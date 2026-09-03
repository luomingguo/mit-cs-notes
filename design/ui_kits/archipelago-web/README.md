# UI kit — Archipelago 阅读站 (web)

A click-through recreation of the Archipelago reading site, composed entirely from
`window.ArchipelagoDesignSystem_958ced` primitives. Open `index.html`.

> **This kit is a proposal, not a recreation.** No production code, Figma file, or screenshot of
> an existing Archipelago site was provided — only the badge and the written brief. The
> information architecture below is derived from the brief's three reader questions. Treat every
> screen as a starting point to correct, not as documentation of something that exists.

## Screens

| File | Screen | What it demonstrates |
| --- | --- | --- |
| `Shell.jsx` | Header + footer frame | 66px opaque paper header, sticky, hairline bottom; deep-scope footer with chart texture |
| `AtlasHome.jsx` | 海图 (atlas home) | Abyss hero with the badge, the three-question strip, 领域 grid (DomainCard), recent 讲义, in-progress 课程 |
| `DomainScreen.jsx` | 领域 (island group) | Breadcrumb, Tabs across 课程/讲义/概念, CourseCard list, sticky sibling-domain rail |
| `LectureScreen.jsx` | 讲义 (reading view) | Three-column atlas: lecture rail · prose column with ConceptLink previews and prereq/next Callouts · sticky TableOfContents, concepts, BacklinkList |
| `ConceptScreen.jsx` | 概念 (landmark) | Definition lead, 出现在 note grid, coordinates card, backlinks |
| `SearchOverlay.jsx` | ⌘K search | Grouped results (讲义/概念/课程) with inset ocean marker on hover |
| `data.jsx` | Sample content | Four domains, four public courses, five notes, backlinks |

## Interactions wired up

- Header nav switches screens; the logo returns to the atlas.
- ⌘K / clicking the header search field opens the overlay; Escape or a scrim click closes it.
- Any DomainCard, CourseCard, NoteCard, Tag or ConceptLink navigates.
- ConceptLink previews appear on hover inside prose — the kit's signature interaction.
- "加入航海日志" fires a Toast bottom-left for ~2.6s.

## Notes for whoever corrects this

- The lecture view is the most opinionated screen: prerequisites sit **above** the prose, not in a
  footer, because "需要先读什么" is question two of three.
- Counts are plain text ("已整理 8 / 12") by brand rule — no percentage bars.
- Every screen loads the badge from `../../assets/`; pass `src` to `Logo` if you relocate the kit.
