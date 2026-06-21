const RESEND_API_URL = "https://api.resend.com";
const SEGMENT_NAME = "Allan Career Hacks";
const DEFAULT_FROM_EMAIL = "Allan Career Hacks <updates@candidleap.com>";
const ALLOWED_ORIGINS = new Set([
  "https://wisdom.candidleap.com",
  "https://wisdom-emt.pages.dev",
]);

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(init.headers || {}),
    },
  });
}

function getCorsHeaders(request) {
  const origin = request.headers.get("origin");
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return {};
  }

  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "vary": "Origin",
  };
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function splitName(value) {
  const clean = String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 120);

  if (!clean) {
    return {};
  }

  const parts = clean.split(" ");
  if (parts.length === 1) {
    return { firstName: parts[0] };
  }

  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

async function resendFetch(env, path, options = {}) {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }

  const response = await fetch(`${RESEND_API_URL}${path}`, {
    ...options,
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });

  const body = await response.text();
  const data = body ? JSON.parse(body) : {};

  if (!response.ok) {
    const error = new Error(data?.message || data?.error || "Resend API request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function listSegments(env) {
  const data = await resendFetch(env, "/segments", { method: "GET" });
  return Array.isArray(data?.data) ? data.data : [];
}

async function getOrCreateSegment(env) {
  const existing = (await listSegments(env)).find((segment) => segment.name === SEGMENT_NAME);
  if (existing) {
    return existing;
  }

  try {
    return await resendFetch(env, "/segments", {
      method: "POST",
      body: JSON.stringify({ name: SEGMENT_NAME }),
    });
  } catch (error) {
    if (error.status === 409) {
      const retry = (await listSegments(env)).find((segment) => segment.name === SEGMENT_NAME);
      if (retry) {
        return retry;
      }
    }

    throw error;
  }
}

async function addContactToSegment(env, email, segmentId) {
  try {
    await resendFetch(env, `/contacts/${encodeURIComponent(email)}/segments/${segmentId}`, {
      method: "POST",
    });
  } catch (error) {
    if (![400, 404, 409].includes(error.status)) {
      throw error;
    }
  }
}

async function createOrUpdateContact(env, { email, name, segmentId }) {
  const nameParts = splitName(name);
  const payload = {
    email,
    unsubscribed: false,
    segments: [{ id: segmentId }],
    ...nameParts,
  };

  try {
    return await resendFetch(env, "/contacts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (![400, 409, 422].includes(error.status)) {
      throw error;
    }

    try {
      await resendFetch(env, `/contacts/${encodeURIComponent(email)}`, {
        method: "PATCH",
        body: JSON.stringify({
          unsubscribed: false,
          ...nameParts,
        }),
      });
    } catch (patchError) {
      if (![400, 404, 409, 422].includes(patchError.status)) {
        throw patchError;
      }
    }

    await addContactToSegment(env, email, segmentId);

    return { object: "contact", email };
  }
}

export async function onRequestOptions({ request }) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

export async function onRequestGet({ request }) {
  return json({ ok: false, message: "Method not allowed." }, {
    status: 405,
    headers: {
      ...getCorsHeaders(request),
      allow: "POST, OPTIONS",
    },
  });
}

export async function onRequestPost({ request, env }) {
  const corsHeaders = getCorsHeaders(request);

  try {
    const length = Number(request.headers.get("content-length") || "0");
    if (length > 4096) {
      return json({ ok: false, message: "That request is too large." }, { status: 413, headers: corsHeaders });
    }

    const body = await request.json();

    if (body?.website) {
      return json({ ok: true, message: "You are on the list." }, { headers: corsHeaders });
    }

    const email = normalizeEmail(body?.email);
    const name = String(body?.name || "").trim();

    if (!isValidEmail(email)) {
      return json({ ok: false, message: "Please enter a valid email address." }, { status: 400, headers: corsHeaders });
    }

    const segment = await getOrCreateSegment(env);
    await createOrUpdateContact(env, { email, name, segmentId: segment.id });

    return json({
      ok: true,
      message: "You are on the Allan Career Hacks list.",
      segment: SEGMENT_NAME,
      from: env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error("Subscribe failed", {
      status: error.status,
      message: error.message,
      data: error.data,
    });

    return json({
      ok: false,
      message: "Something went wrong adding you to the list. Please try again in a minute.",
    }, { status: 500, headers: corsHeaders });
  }
}
