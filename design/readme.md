# Archipelago 群岛 — Design System

> 不同学科是各自独立的岛屿，内部链接和知识关系则是连接它们的航线。
> Separate disciplines are islands. Links and relations are the sea lanes between them.

---

## 1. What Archipelago is

Archipelago（群岛）started as one person's public-course study notes, but it is deliberately
**not** a file listing of courses. It keeps the spine of each course intact while re-organising
the material along five axes:

| Axis | 中文 | Role |
| --- | --- | --- |
| Domain | 领域 | The island group — a discipline (e.g. 政治哲学, 计算机系统) |
| Course | 课程 | An island — one public course, with its own shore and order |
| Lecture / Note | 讲义 | A place on the island — one session's notes |
| Concept | 概念 | A landmark that recurs across islands |
| Link | 内部链接 | The sea lane — the reason two pages are near each other |

Every page must let a reader answer three questions, in this order:

1. **这篇在讲什么** — what is this about?
2. **需要先读什么** — what must I read first?
3. **接下来可以读什么** — where can I sail next?

Those three questions are the product. They are also the design brief: any screen that answers
them well is on-brand; any screen that buries them is not.

**Content language:** primarily 中文 (Simplified). Latin appears as technical terms, course
codes, institution names, and citations. Every component must set CJK-safe line-height and never
assume Latin word-boundary wrapping.

### Surfaces
One product today: **the Archipelago reading site** — a public, document-first knowledge base.
Its surfaces are covered in `ui_kits/archipelago-web/`: the atlas home, a domain island page, a
lecture reading view with margin apparatus, and a concept page with backlinks.

### Sources given to me
- `uploads/Codex Image 3 Sept 2026, 10_51_01.png` — the circular Archipelago badge (the only
  visual asset supplied). Copied to `assets/logo-archipelago-badge.png`.
- The written brief: *不幼稚，也不 SaaS，不要过于科技感，能够引人入胜，现代化有质感，有种大航海时代那种开拓创新的感觉* —
  not childish, not SaaS, not over-teched; engaging, modern, tactile, with the feeling of an age
  of discovery.
- **No codebase, Figma file, deck, or font binaries were provided.** Everything below is derived
  from the badge plus the brief. See §7 Caveats for what that means for fidelity.

---

## 2. Content fundamentals

**Voice: a cartographer's field notes, not a teacher's lecture.** Archipelago describes terrain
it has actually walked. It is confident about structure and modest about conclusions.

- **Person.** The site speaks as **我/我们** about the notes themselves ("我把这门课重排成三段"),
  and addresses the reader as **你** only when giving a route ("先读这篇，再回来"). Never 「您」 —
  too formal, turns a shared chart into customer service.
- **Casing (Latin).** Sentence case everywhere: page titles, buttons, nav. `ALL CAPS` is reserved
  for one thing — the 11px tracked eyebrow label above a block (`领域 · DOMAIN`, `PREREQUISITE`).
  Never all-caps a sentence.
- **Punctuation.** Full-width Chinese punctuation in Chinese sentences（，。、「」）; half-width in
  Latin. One space between CJK and Latin/digits: `MIT 6.006 的第三讲`, not `MIT6.006的第三讲`.
- **Length.** A note opens with a 1–2 sentence 摘要 that answers "这篇在讲什么" before any heading.
  Buttons are 2–4 characters（继续阅读 / 全部课程）. Card summaries cap at ~60 字.
- **Numbers.** Concrete and small; never invented precision. 「12 篇讲义」, 「约 40 分钟」.
  No progress percentages, no gamified counts, no streaks.
- **Emoji: never.** Not in UI, not in content, not in headings. The brand's warmth comes from
  paper, gold rule, and serif type — not from faces.
- **Metaphor discipline.** The nautical metaphor lives in *structure and naming* (岛屿/航线/
  灯塔/坐标/航海日志), used sparingly — roughly one nautical noun per screen. It never becomes
  pirate cosplay: no 「Ahoy」, no ⚓, no treasure maps, no "chart your journey!" motivation copy.
- **Never** write marketing SaaS copy: no "赋能", no "一站式", no "解锁你的潜能", no exclamation
  marks, no "Get started for free".

**Voice examples**

| Slot | ✅ On brand | ❌ Off brand |
| --- | --- | --- |
| Home hero | 群岛：把公开课笔记重新连成一张海图 | 🚀 解锁你的学习潜能！ |
| Note summary | 这篇讲义梳理罗尔斯的「无知之幕」，以及它为什么不是一个思想实验的终点。 | 本文将带你深入理解正义论的核心概念！ |
| Prereq block | 需要先读：《社会契约的三种版本》 | 前置知识 (Prerequisites) — 必读！ |
| Next block | 接下来可以读：诺齐克的反驳，或跳到分配正义的经济学一侧。 | 相关推荐 |
| Empty state | 这片海域还没有笔记。 | 暂无数据 |
| Button | 继续阅读 · 全部领域 · 查看反向链接 | 立即开始 · 免费试用 |

---

## 3. Visual foundations

### 3.1 The three worlds
Every surface belongs to one of three material worlds, and mixing more than two on a screen is
the main way this system goes wrong.

1. **PAPER** (`--surface-page` `#faf5e9` → `--surface-card` `#fdfbf5`) — the default. Warm
   parchment, near-white cards, hairline navy rules. This is where reading happens.
2. **ABYSS** (`--surface-deep` `#001a3d`, `--gradient-abyss`) — night sea. Hero bands, footers,
   the atlas map, quote slides. Set `data-theme="deep"` on the container and every token flips.
3. **CHART** (`--ocean-600` → `--ocean-300`) — the connective tissue: links, routes, active
   states, waypoints. Ocean blue is *never* a large background fill; it is a line, a dot, a word.

### 3.2 Colour
- **Navy `#001a3d` is the ink**, not a "primary brand button colour". Headings, body text at 88%
  navy, borders as navy at 12–32% alpha. Nothing in the system uses pure black or pure white
  (`#fff` appears only inside `data-theme="deep"` for maximum-contrast headings).
- **Ocean `#0f5c93` is the only interactive hue.** Links, focus rings, selected tabs, primary
  buttons. If something is blue, it does something.
- **Gold `#c79a3e` is punctuation, capped at ~2% of any screen's pixels.** Three sanctioned uses:
  the hairline rule under a title (`.ap-rule-gold`), a lit waypoint dot on a route, and the
  eyebrow accent on a concept landmark. Gold is never a button fill and never a body-text colour.
- **Semantics** are muted earth: kelp `#2f6b57` for success, coral `#b4503a` for danger, gold for
  caution. No pure red, no neon green.
- **Imagery colour vibe:** cool-to-neutral, mid-contrast, slightly desaturated — dusk over water.
  A single warm horizon accent (`--sunset-400`) is allowed per image. Never high-saturation
  stock-photo colour; never black-and-white; never heavy grain (a fine paper tooth only).

### 3.3 Type
Two serifs and one sans, with strict jobs:
- `--font-wordmark` **Playfair Display** — the wordmark and display-1 only. High contrast, ball
  terminals; matches the badge lettering. Never used for UI or body.
- `--font-display` / `--font-serif` **Spectral + Noto Serif SC** — every heading and all reading
  text. Body 17px / line-height **1.9** (CJK needs the air), measure capped at `34em` ≈ 40 汉字.
- `--font-sans` **IBM Plex Sans + Noto Sans SC** — chrome only: nav, meta lines, labels, buttons,
  table headers. 13–15px, medium weight.
- `--font-mono` **IBM Plex Mono** — code, course codes, coordinates, kbd hints.
- Tracking: display goes **negative** (−0.02em); the 11px uppercase eyebrow goes **+0.14em**;
  CJK never gets letter-spacing.
- Italic is Spectral italic, used for quotes and Latin titles — never for CJK.

### 3.4 Spacing, layout, grid
4px base, but the top of the scale is generous (`--space-13` 96px, `--space-15` 176px). Sections
on a reading page are separated by 72–96px, not 32px. Layout is a **three-column atlas**:
`--rail-left` 264px (contents / islands) · flexible reading column · `--rail-right` 232px
(margin apparatus: prereqs, backlinks, concepts). Page max 1240px, gutter 32px.
Fixed elements: the 66px header only. It is opaque paper with a hairline bottom border — no
floating pills, no sticky CTAs, no cookie-style bars. Right rails are `position: sticky`.

### 3.5 Borders, corners, cards
- **Hairlines carry the structure.** 1px `rgba(0,26,61,.12)`. Borders do more work here than
  shadows do.
- **Radii are small and printed-feeling:** 2/4/8px is the working range; `--radius-lg` 14px is for
  dialogs only; pill radius exists solely for tags and the waypoint dot. A 22px+ radius on a card
  reads as SaaS and is off-brand.
- **A card is:** `--surface-card` fill, 1px hairline border, `--radius-md` 8px, `--shadow-1`
  (barely there), `--pad-card` 24px. On hover it lifts 2px and moves to `--shadow-2` — it does
  *not* change background colour. Feature cards may add `--shadow-inset-top` for a page-edge sheen.
- **The dashed sea lane** (`.ap-route`, 1px dashed at 28% navy) is the brand's signature divider:
  it separates a note from its "next" block, connects nodes in the atlas, and outlines dropzones.

### 3.6 Shadows, transparency, blur
Shadows are shallow and cool (`rgba(4,16,31,…)`), max blur 60px at level 3 (dialogs only).
No coloured glows, no inner-shadow "neumorphism" beyond `--shadow-inset-field` on inputs.
Transparency is used for exactly three things: hairline borders, the `--surface-scrim` behind
dialogs, and text-over-image protection. **Protection is a gradient scrim** (`--gradient-scrim`,
bottom-up navy), never a capsule/pill behind text. `backdrop-filter` (`--blur-veil`) appears in
one place only — the header when it overlaps a deep hero — and never on cards.

### 3.7 Motion
Water under a hull: starts, settles, never bounces. `--ease-tide` for state changes
(140ms), `--ease-out-soft` for entrances (220–340ms), `--dur-tide` 560ms for the atlas route
draw. **No bounce, no spring overshoot, no scale-up-from-0.9 modals.** Entrances are opacity +
6–8px translate. The one signature animation: a route line drawing itself
(`stroke-dashoffset`) with a waypoint dot fading in at the end.

### 3.8 Interaction states
| State | Treatment |
| --- | --- |
| Hover, primary | background → `--accent-hover` (darker), no lift |
| Hover, card / row | lift `translateY(-2px)` + `--shadow-2`, border → `--border-subtle` |
| Hover, ghost / nav | `--surface-ghost-hover` (5% navy) wash, text → `--text-heading` |
| Hover, link | colour → `--text-link-hover`, underline goes to full opacity |
| Press | `--surface-ghost-press` / `--accent-press`, `scale(.985)`, no downward shift |
| Focus | 2px `--ocean-500` outline, 2px offset (or `--shadow-focus` ring on filled controls) |
| Selected | 2px ocean left/bottom marker + `--text-heading`; never a filled blue block |
| Disabled | opacity .45, `cursor: not-allowed`, no colour change |
| Visited link | `--ocean-700` — a read page is visibly charted |

---

## 4. Iconography

**No icon set was supplied with the brand.** Substitution, flagged for review:

- **Lucide** (`lucide-static`, 24×24, 2px stroke, round caps) via CDN — chosen because its plain
  2px geometric stroke sits quietly next to serif text and reads as drafting instruments rather
  than app chrome. The `Icon` component (`components/brand/Icon.jsx`) renders a glyph as a
  CSS `mask-image` of `https://cdn.jsdelivr.net/npm/lucide-static@0.544.0/icons/<name>.svg`, so
  icons inherit `currentColor` and never need to be hand-drawn or inlined.
- **Sanctioned glyph vocabulary** (keep the set small — an unfamiliar icon costs more than a word):
  `compass` (atlas/home), `map` (domain), `book-open` (course), `file-text` (lecture),
  `link` (internal link), `arrow-left`/`arrow-right` (route), `search`, `list` (contents),
  `lighthouse`→ use `tower-control` (concept landmark), `anchor` (prerequisite), `chevron-*`,
  `x`, `check`, `external-link`, `hash` (tag), `clock` (reading time).
- **Size & pairing.** 16px inside 13–15px sans labels, 18px in buttons, 20px in nav, 24px for
  standalone. Icons sit at 1.5–2px optical stroke; never scale a 24px glyph above 32px.
- **Icons never appear alone in content**, only in chrome or beside a label. Body copy never gets
  an icon bullet.
- **Emoji: never.** **Unicode as icon:** only two, both typographic — `·` as a meta separator
  and `→` inside inline "next" links. No ⚓ ⛵ 🧭 anywhere.
- **The badge** (`assets/logo-archipelago-badge.png`) is illustrative artwork, not an icon. Use it
  at ≥48px, on paper or navy, never recoloured, never cropped, never inside a button.

**No wordmark file was supplied.** The horizontal lockup is therefore the badge plus the name set
in Playfair Display SemiBold, per `components/brand/Logo.jsx`. If a real wordmark exists, replace
that component's type with the asset.

---

## 5. Components

`window.Archipelago.<Name>` after loading `_ds_bundle.js`.

| Group | Components |
| --- | --- |
| `components/core/` | Button, IconButton, Badge, Tag, Card, Callout, Divider |
| `components/forms/` | Field, Input, Textarea, Select, Checkbox, Radio, Switch |
| `components/navigation/` | Breadcrumb, Tabs, SidebarNav, TableOfContents |
| `components/feedback/` | Dialog, Toast, Tooltip |
| `components/knowledge/` | ConceptLink, NoteCard, CourseCard, DomainCard, BacklinkList |
| `components/brand/` | Logo, Icon |

### Intentional additions
No source defined a component inventory, so the set above is the standard primitive list sized to
this product, plus five domain components the three product questions demand:
- **ConceptLink** — an inline 内部链接 with a hover preview card; the "sea lane" made concrete.
- **NoteCard / CourseCard / DomainCard** — the three levels of the content hierarchy, each with a
  different density and a different answer to "这篇在讲什么".
- **BacklinkList** — answers "接下来可以读什么" from the incoming direction.
- **Icon** — a wrapper over the substituted Lucide set (see §4).
- **Field** — the shared label/hint/error shell the other form controls wrap themselves in.

---

## 6. Index

```
styles.css                  ← consumers link this one file (@import list only)
tokens/                     fonts · colors · typography · spacing · elevation · motion · base
assets/                     logo badge (1254px original + 512/256/128/64)
guidelines/                 foundation specimen cards (Design System tab)
components/<group>/         Name.jsx · Name.d.ts · Name.prompt.md · <group>.card.html
ui_kits/archipelago-web/    README.md · index.html · screens
templates/<slug>/           copyable Design Component starting folders
readme.md                   this file
SKILL.md                    Agent-Skills entry point
```

- **Foundations cards:** `guidelines/*.html` — colour (abyss / chart / paper / semantic), type
  (wordmark, display, prose, sans, mono), spacing, radii, shadows, routes & rules, motion, brand.
- **UI kit:** `ui_kits/archipelago-web/index.html` — interactive click-through of the atlas home,
  a domain page, a lecture reading view, and a concept page.
- **Templates:** `templates/lecture-note/LectureNote.dc.html` — the 讲义 reading page, ready to copy
  into a consuming project (loads this system via `ds-base.js`).

---

## 7. Caveats / open questions

1. **Fonts are substitutions.** Playfair Display (wordmark), Spectral + Noto Serif SC (reading),
   IBM Plex Sans/Mono + Noto Sans SC (chrome), all from Google Fonts via `tokens/fonts.css`.
   No binaries were provided. If Archipelago has real licensed faces — especially a CJK serif
   like 思源宋体 / 方正报宋 — send the files and only `tokens/fonts.css` changes.
2. **Icons are substitutions** (Lucide via CDN). See §4.
3. **The badge is the only real asset.** There is no wordmark, no illustration set, no
   photography, and no product screenshot. The UI kit is therefore a *proposal* built from the
   brief and the badge, not a recreation of an existing site — flagged deliberately.
4. **No existing site code was available**, so information architecture (three rails, margin
   apparatus, backlinks) is inferred from the three reader questions in the brief.
