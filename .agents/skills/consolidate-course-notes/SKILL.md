---
name: consolidate-course-notes
description: Consolidate duplicate Markdown course notes from an external working directory into one canonical Archipelago course directory, normalize them to repository standards, back up the originals, and replace the old files with verified symlinks. Use when the same course is being maintained in two locations. Do not use for a simple one-off copy that should remain independent.
---

# Consolidate Course Notes

Make the repository course directory the only maintained copy while preserving the old paths as working symlinks. The final link direction is always:

```text
old external note path -> canonical docs/... course note
```

## Required outcome

- Retain the newest substantive content from the external notes.
- Preserve or add the canonical repository metadata and structure required by `NOTESTYLE.md`.
- Keep Markdown, internal links, math, code, tables, anchors, semantic containers, and image references intact.
- Replace only the external files selected by the user; do not absorb neighboring lectures implicitly.
- Leave canonical files as regular files and external paths as symlinks.
- By default, do not rename, relocate, upload, or rehost images. Treat image migration as a separate request.

## Establish scope before editing

Resolve two absolute directories:

1. the external working/source directory whose content is currently newest;
2. the canonical course directory under this repository's `docs/` tree.

Build an exact source-to-canonical mapping. Same-name lectures normally map directly, while a descriptive course-homepage filename may map to `index.md`. Resolve existing symlinks before comparing files so a second run is idempotent and cannot create a link loop.

Inspect repository instructions, `NOTESTYLE.md`, the canonical course directory, and `git status --short` before editing. If the canonical files contain unrelated uncommitted work, merge around it rather than overwriting it. Ask the user only when mapping or content precedence is genuinely ambiguous.

## Merge content into the canonical directory

Treat the external note body as the latest content unless the user says otherwise. Treat the canonical file and `NOTESTYLE.md` as authoritative for repository structure and metadata. Perform a semantic merge instead of blindly copying one file over the other:

- preserve useful canonical frontmatter, valid tags, course inheritance, and existing repository-only links;
- carry over every substantive source section, example, code block, formula, table, image reference, and personal observation;
- add the required TL;DR and honest metadata without inventing missing course content;
- use `status: draft` when the source ends mid-topic or contains a real unfinished placeholder;
- keep quality recommendations separate from mandatory findings, and do not add filler merely to silence `code-heavy` or `no-insight` advice.

For a whole course, read and follow `.agents/skills/course-notes-audit/SKILL.md`. Run its deterministic audit and the repository content linter before and after the merge. A semantic comparison may ignore expected frontmatter, whitespace, TL;DR, and code-fence-language changes, but it must still demonstrate that no source content was lost.

## Validate before changing the external files

At minimum:

```bash
node .agents/skills/course-notes-audit/scripts/audit-course.mjs '<canonical-course-directory>' --json
npm run notes:lint -- '<canonical-course-directory>'
git diff --check -- '<canonical-course-directory>'
```

Run the site check/build and RAG typecheck when the changes are broad enough to affect rendering or ingestion. Do not claim the full course is compliant when files outside the selected scope still have mandatory findings; report those separately.

Do not proceed to link replacement while any of these remains unresolved:

- a missing or ambiguous mapping;
- a missing canonical target or a canonical target that is itself a symlink;
- an unmerged source section or an unexplained destructive diff;
- a blocking parse/lint error in the selected files;
- an overlapping user change that would be overwritten.

## Back up and switch to symlinks

Use `scripts/link_source_to_canonical.py` from this skill directory. It defaults to a read-only dry run, rejects paths escaping either supplied root, validates every target before mutation, backs up all regular source files, writes a manifest, replaces links atomically, rolls back a partial failure, and verifies the result.

Example:

```bash
python3 .agents/skills/consolidate-course-notes/scripts/link_source_to_canonical.py \
  --source-dir '/absolute/external/course' \
  --canonical-dir '/absolute/repository/docs/course' \
  --map 'Course Homepage.md=index.md' \
  --same-name 'lec1.md' \
  --same-name 'lec2.md'
```

Inspect the dry-run mapping. Immediately before mutation, obtain any approval required to write outside the workspace. Then repeat with `--apply --confirm-merged`. Use `--backup-dir` when the user wants a durable backup location; otherwise the script creates a temporary backup under `/private/tmp` and the final report must warn that the operating system may eventually remove it.

`--confirm-merged` is an assertion that all byte-different source files were semantically merged and reviewed. It is not permission to skip comparison or validation.

Absolute symlinks are the default because the two trees commonly have unrelated roots. Use `--relative-links` only when both trees are expected to move together and the relative relationship is stable.

## Verify and report

Verify every selected external path, including files that were already symlinks:

- it is a symlink;
- its resolved target is the exact canonical file;
- reading through it produces the canonical bytes;
- the canonical file remains a regular file.

Lead the final report with whether the repository is now the single source of truth. List the mapping scope, backup and manifest path, validation commands and results, honest `draft` decisions, remaining warnings or out-of-scope findings, and whether images were intentionally left unchanged.
