---
name: course-notes-audit
description: Audit one MIT CS Notes course directory for directory layout, frontmatter, type, tags, TL;DR, course metadata inheritance, content-lint findings, and RAG readiness. Use when the user supplies a course folder and asks whether its notes satisfy NOTESTYLE.md; report only unless fixes are explicitly requested.
---

# Course Notes Audit

Audit exactly one course directory and give a decisive, evidence-backed result. Treat the supplied path as the audit boundary.

## Required context

1. Resolve the supplied path and locate the repository root.
2. Read the repository `AGENTS.md` and `NOTESTYLE.md` completely before judging compliance. They are authoritative; do not preserve rules copied into this skill when the repository standard has changed.
3. Preserve all existing worktree changes. This workflow is read-only: do not run `notes:fix`, edit Markdown, build the site, ingest RAG data, or apply database schema changes unless the user separately asks for them.

## Editor-owned heading structure

- Treat heading levels and section boundaries as editorial decisions. Do not report skipped levels, deep headings, headings with no standalone paragraph, or any heading arrangement as an audit finding.
- Do not infer compliance, completeness, `status`, or RAG readiness from section length, document length, character counts, or line counts. The explicit TL;DR limits in `NOTESTYLE.md` are the only length contract.
- Do not recommend promoting, demoting, splitting, or merging headings to satisfy chunk sizes. RAG parses H2–H6 individually, preserves H2/H3 ancestry in breadcrumbs, and may split long body text internally without changing Markdown.

## Audit workflow

Run the deterministic contract audit from the skill directory:

```bash
node <skill-directory>/scripts/audit-course.mjs '<course-directory>' --json
```

Interpret its exit status as:

- `0`: the course satisfies the mandatory organization contract.
- `1`: the command ran successfully, but mandatory migration work remains.
- `2`: the directory is structurally invalid or the audit could not be completed.

Then run the repository content linter against the directory:

```bash
npm run notes:lint -- '<course-directory>'
```

The linter accepts a directory and recursively checks its Markdown files. Separate its findings into:

- blocking content errors;
- mandatory migration rules such as `no-type`, `no-tags`, `no-tldr`, `course-metadata`, and `repeated-course-metadata`;
- quality recommendations such as `code-heavy`, `vague-heading`, `image-alt`, and `no-insight`.

Never classify legacy length or hierarchy rules such as `long-section`, `short-section`, `too-short`, `empty-section`, `heading-skip`, or `deep-heading` as findings; they are outside the current content contract.

Do not call a course compliant merely because the linter process exits successfully; its normal mode reports findings without failing the process. Use the contract audit result and rule counts.

## Result labels

- **合格**: no structural errors or mandatory migration findings. Quality recommendations may remain, but list them.
- **待迁移**: the directory is valid and readable, but one or more mandatory fields, TL;DR sections, tags, or inheritance rules are unmet.
- **不合格**: the course root/index is invalid, a declared type conflicts with its path, metadata is malformed, or content lint contains errors that prevent reliable parsing/chunking.

When both “待迁移” and hard errors exist, report **不合格**.

## Report format

Lead with one sentence: `<课程目录>：合格 / 待迁移 / 不合格。`

Then provide:

1. Inventory by page type and stub count.
2. Coverage as exact fractions for explicit `type`, valid tags, TL;DR, and child metadata inheritance.
3. Blocking or mandatory findings grouped by rule, with affected-file counts and representative clickable paths.
4. Quality recommendations, kept separate so they do not obscure mandatory work.
5. A prioritized migration order: course `index.md` first, then high-value lectures, then paper/concept/assignment/project pages.

State which checks were not run. In particular, a course-directory audit does not prove production database ingestion, vector quality, or external-link availability.

## Invocation example

```text
$course-notes-audit '/Users/mac/Documents/MIT/mit-cs-notes/docs/zh/cs/computer_sys/os'
```

The equivalent UI form is:

```text
[course-notes-audit] + '/Users/mac/Documents/MIT/mit-cs-notes/docs/zh/cs/computer_sys/os'
```
