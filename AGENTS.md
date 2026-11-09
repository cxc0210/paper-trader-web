<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## UI design

Use the modern fintech dashboard style for Paper Trader.

- Use a light neutral page background with white cards, subtle borders, and restrained shadows.
- Use blue or indigo only for primary actions and active navigation.
- Use green for gains and red for losses or destructive actions; do not use these colors as general decoration.
- Keep the layout information-dense: a sidebar, summary metric cards, charts, and tables.
- Prefer clear hierarchy, generous spacing, and compact, readable data displays.
