import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const allanPage = resolve(root, "public/allan/index.html");
const quotesJson = resolve(root, "public/allan/quotes.json");
const quotesMd = resolve(root, "public/allan/quotes.md");

function extractPosts(html) {
  const match = html.match(/<script type="application\/json" id="postsData">([\s\S]*?)<\/script>/);
  if (!match) {
    throw new Error("Could not find postsData JSON in public/allan/index.html");
  }

  return JSON.parse(match[1]);
}

function stripCareerHackPrefix(text) {
  return text.replace(/^Career hack -\s*/i, "");
}

function markdown(posts) {
  const lines = [
    "# Allan Leinwand Career Hacks",
    "",
    "Machine-readable quote bank for Allan-style advice prompts.",
    "",
    `Source page: https://wisdom.candidleap.com/allan/`,
    `Total posts: ${posts.length}`,
    `Latest post: ${posts[0]?.label || "Unknown"}`,
    "",
    "Use this as source material only. Do not invent quotes or dates.",
    "",
  ];

  posts.forEach((post, index) => {
    lines.push(`## ${String(index + 1).padStart(2, "0")}. ${stripCareerHackPrefix(post.text).split(". ")[0]}`);
    lines.push("");
    lines.push(`- Date: ${post.label}`);
    lines.push(`- Source: ${post.source}`);
    lines.push(`- Tags: ${post.tags.join(", ")}`);
    lines.push(`- URL: ${post.url}`);
    lines.push("");
    lines.push(post.text);
    lines.push("");
  });

  return `${lines.join("\n").trim()}\n`;
}

const html = await readFile(allanPage, "utf8");
const posts = extractPosts(html);

const data = {
  sourcePage: "https://wisdom.candidleap.com/allan/",
  count: posts.length,
  latestDate: posts[0]?.date || null,
  latestLabel: posts[0]?.label || null,
  posts,
};

await mkdir(dirname(quotesJson), { recursive: true });
await writeFile(quotesJson, `${JSON.stringify(data, null, 2)}\n`);
await writeFile(quotesMd, markdown(posts));

console.log(`Exported ${posts.length} posts to public/allan/quotes.json and public/allan/quotes.md`);
