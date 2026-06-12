# Admin Panel — `src/data/site.json`

Every piece of content **and** design on this site is driven by one file:
[`src/data/site.json`](src/data/site.json). Edit it, save, and the site updates
(dev server hot-reloads; production needs a rebuild). No component code ever
needs to change for content edits.

## Quick recipes

| I want to… | Edit |
|---|---|
| Change the accent color of the whole site | `theme.colors.accent` (+ `accentDim`, `accentFaint` to match) |
| Make the film grain stronger/weaker | `theme.grainOpacity` (0 = off, 0.1 = heavy) |
| More/fewer background particles | `theme.particles.spacing` (smaller = denser), `maxCount` caps it |
| Speed up the skills marquee | `theme.marqueeSeconds` (lower = faster) |
| Change the boot/loading text | `hero.boot.lines` — add/remove lines freely |
| Skip the loading screen entirely | `hero.boot.enabled: false` |
| Reorder sections of the page | `sections.order` — move/remove keys |
| Add a job | Add an object to `experience.items` (top = most recent) |
| Add a project | Add an object to `projects.items` — links array can hold any number of links |
| Add a skill | Add to any group in `skills.groups`, or add a whole new group |
| Change availability badge | `personal.availability` (shows in nav) |
| Update links | `links.*`, `contact.socials`, and per-project `links` |
| Swap the hero avatar | `hero.image` (path under `public/`) — remove the key to hide it |
| Swap the about portrait | `about.image` — remove the key to hide it |
| Give any project an image | add `"image": "/images/…png"` to that item in `projects.items` |
| Change name/role/tagline | `personal.*`, `hero.*` |

## Section keys

`sections.order` accepts: `hero`, `marquee`, `about`, `experience`, `projects`,
`skills`, `education`, `contact`. Content sections are auto-numbered (01, 02, …)
in the order they appear; `hero` and `marquee` are unnumbered.

## Notes

- `about.highlights` — exact phrases from `about.body` that get the accent
  color. They must match the body text character-for-character.
- `personal.timezone` — IANA zone (e.g. `Asia/Karachi`) used by the live clock
  in the nav.
- Colors accept any CSS color (`#hex`, `rgba(...)`) — they're injected as CSS
  variables at the root, so everything follows.
- Placeholder URLs (LinkedIn, Upwork, NPM, live demos) are best-guess — swap in
  the real ones in `links`, `projects.items[].links` and `contact.socials`.

## Stack

Next.js 16 (App Router) · Tailwind CSS v4 · anime.js v4 · Lenis smooth scroll.
Animations live in `src/components/*`; shared helpers in `src/lib/anim.js`.
