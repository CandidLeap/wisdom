# How This Was Built

This is a cleaned build journal for the Allan Career Hacks project. It is not the raw chat transcript. The raw transcript can contain private operational detail, temporary mistakes, account references, and half-formed thinking, so this public version captures the useful process without publishing the whole session.

The short version: this was not an autonomous AI swarm. It was a human-directed build where Hal set direction, corrected course, judged taste, asked risk questions, and kept tightening the product. Codex did implementation, research, extraction, deployment, verification, and documentation.

## What We Built

- A noindexed Cloudflare Pages site at `wisdom.candidleap.com`.
- A human-readable Allan Career Hacks collection at `/allan/`.
- A Markdown and JSON quote bank at `/allan/quotes.md` and `/allan/quotes.json`.
- Topic tags, search, timeline cards, source links, and Allan's photo.
- An Ask Allan prompt/skill workflow for Codex, Claude Code, ChatGPT, and other LLMs.
- A signup page at `/sign-up/` wired to Resend contacts/segments.
- A system wiki at `/allan/wiki/`.
- A hidden next-steps checklist reachable only by the corn shortcut.
- A public GitHub repo with a single-file installable skill.

## Human Direction Moments

These are representative prompts from the build. They show where the product judgment came from.

| Moment | Human Direction | What Changed |
|---|---|---|
| Start with messy source material | "Will this paste?" | The work began with a large LinkedIn HTML dump, not a clean dataset. Codex inspected it, counted posts, and extracted readable Career Hack posts. |
| Count and extract | "How many posts start with \"Career Hack\" - I want to extract all of those posts." | Codex parsed the loaded LinkedIn activity items and produced a clean extract. |
| Choose the right home | "Nono I don't want this on /career-hacks on the main domain. Can you please undo that?" | The main-domain Worker idea was abandoned before deployment. The project moved to a separate `wisdom.candidleap.com/allan` Pages app. |
| Protect search visibility | "Can you make sure this subdomain is noindexed?" | The site got both page-level robots meta tags and Cloudflare `X-Robots-Tag` headers. |
| Improve data coverage | "Are you able to use the method of using Google Search as a search engine for twitter or linkedin to unearth more cards?" | Codex searched Google, LinkedIn public pages, and X sources, then expanded the collection from the original extract to 24 public posts. |
| Fix readability | "This is hard to read." | The page moved away from oversized cards toward a clearer timeline, tags, filters, and a calmer reading surface. |
| Set the visual direction | "Use linkedin and X logos. Let's go with the timeline view." | The default layout became timeline-first with branded source buttons. |
| Add context and photo | "Add Allan's photo to the top." | Codex found and used a public Allan headshot and added Hal's note about why the collection exists. |
| Build automation | "Can you create a skill that runs every day that searches to find new career hack posts and adds them to the website?" | Codex created a monitor skill/playbook and daily automation instructions for future new-post discovery. |
| Improve notifications | "Update the skill as needed to match this template, then send it again with a real example." | The new-quote email format became more prescriptive and included date, source, tags, and a collection link. |
| Choose the subscriber architecture | "Why even store in D1 and not just go straight to Resend?" | The architecture simplified: Cloudflare receives form submissions, Resend stores subscribers, and no local subscriber database stores raw PII. |
| Add the AI advice flow | "Ask Allan questions in Claude, Codex, ChatGPT, or in your LLM." | The Allan page got a prompt area and a public installable skill that reads the quote bank and cites real Allan quotes. |
| Public repo hygiene | "Make sure it does not expose any private stuff that I do not want people to see." | Codex audited the repo, removed personal defaults, avoided raw transcript storage, and rewrote public Git history as a clean snapshot. |
| Final navigation polish | "can we improve the design of the nav bar across the pages?" | The site got consistent pill navigation, better mobile behavior, and a bottom-only corn shortcut. |

## What Codex Did

Codex acted as the implementation layer:

- Parsed a 9.9 MB LinkedIn HTML paste.
- Counted 440 listed post entries, including 306 loaded posts and 134 placeholders.
- Extracted the initial 14 Career Hack posts.
- Created and deployed a separate Cloudflare Pages project.
- Added DNS and custom domain wiring for `wisdom.candidleap.com`.
- Added noindex headers and verified them live.
- Searched public sources for missing posts.
- Built the Allan page, quote bank, wiki, signup page, and hidden checklist.
- Wrote Cloudflare Pages Functions for Resend subscription capture.
- Created a public GitHub repo and public single-file skill.
- Ran browser, DOM, header, script, and API smoke tests.
- Cleaned commit history before making the repo public.

## The Correction Loop

The project improved because Hal kept reacting to what was visible:

- A proposed main-domain path was rejected before it reached production.
- Browser tunnel errors were diagnosed as DNS/tunnel caching, not a broken deployment.
- The quote cards were redesigned after the first version felt too hard to read.
- The "most recent" card was changed several times, then removed when it got in the way of filtering.
- Signup copy was rewritten because it sounded too much like AI.
- The corn shortcut was changed from floating to bottom-of-page after it overlapped mobile copy.
- Git history was cleaned after a local machine email appeared as a commit author.

This was not "prompt once and walk away." The useful product emerged from a loop of direction, implementation, visual inspection, correction, and verification.

## What Was Human Judgment

- Where the page should live.
- Whether the main domain should be touched.
- What felt readable or hard to read.
- Which layout direction to use.
- Whether subscribers should live in D1 or Resend.
- Whether the repo could safely be public.
- What the public skill should and should not do.
- How the story should be framed: directed AI collaboration, not autonomous swarm mythology.

## What Was AI Execution

- File edits.
- Parsing and extraction.
- Search queries and source checks.
- Cloudflare Pages deployment.
- DNS/custom-domain setup.
- Resend API integration.
- GitHub repo creation and cleanup.
- CSS/HTML/JavaScript implementation.
- Browser screenshots and smoke tests.
- Documentation drafts.

## Safety And Privacy Choices

- The raw chat transcript is not committed.
- The subdomain is noindexed with both meta tags and response headers.
- Cloudflare secrets are referenced by name only, never committed.
- Subscriber PII is sent to Resend; the repo does not store subscriber data.
- The public GitHub history was collapsed to a clean public snapshot.
- Example emails and test commands use placeholders in public docs.

## The Better Future Pattern

For a future build like this, start with a lightweight instruction:

> Keep a running build journal in `docs/build-journal.md`. Log major user instructions, decisions, AI actions, verification, and open questions. Do not include secrets, raw credentials, private account data, or raw transcript text.

That gives the public story a durable source while keeping the full raw chat private.

