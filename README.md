# Candid Leap Wisdom

Static Cloudflare Pages site for `wisdom.candidleap.com`.

- `/` redirects to `/allan/`
- `/allan/` contains Allan Leinwand's career hack quote collection
- `/allan/wiki/` explains the system, infra, maintenance flow, and warnings
- `/allan/how-built/` explains the human-directed AI build process
- `/allan/quotes.md` and `/allan/quotes.json` are generated quote banks for AI/tools
- `/sign-up/` lets readers subscribe to new Allan Career Hacks through Resend
- `skills/allan-career-hacks/SKILL.md` is a public Codex/Claude Code skill that reads the hosted quote bank
- `docs/how-this-was-built.md` is a public-safe build journal, not the raw transcript
- The subdomain is noindexed via `X-Robots-Tag` headers and page-level robots meta tags.

Subscriber flow:

- Cloudflare Pages serves the signup form.
- `/api/subscribe` validates the request and sends the contact directly to Resend.
- Resend is the subscriber source of truth; there is no local subscriber database.
- The Resend segment name is `Allan Career Hacks`.
- Set `RESEND_FROM_EMAIL` in Cloudflare if outbound update emails are added.

Deploy:

```sh
node scripts/export-quotes.mjs
wrangler pages deploy public --project-name wisdom --branch main
```
