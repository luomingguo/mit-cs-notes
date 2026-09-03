#!/usr/bin/env python3
"""Safely replace duplicate source notes with links to canonical notes."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


@dataclass
class Mapping:
    source_relative: Path
    canonical_relative: Path
    source: Path
    canonical: Path
    source_kind: str
    source_hash: Optional[str]
    canonical_hash: str
    original_link: Optional[str]
    already_correct: bool
    backup: Optional[Path] = None


def fail(message: str) -> "None":
    raise ValueError(message)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def is_within(path: Path, root: Path) -> bool:
    try:
        path.relative_to(root)
        return True
    except ValueError:
        return False


def safe_relative(raw: str, label: str) -> Path:
    value = Path(raw)
    if value.is_absolute() or value == Path(".") or ".." in value.parts:
        fail(f"{label} must be a non-empty relative path without '..': {raw!r}")
    return value


def parse_mapping(raw: str) -> tuple[Path, Path]:
    if "=" not in raw:
        fail(f"--map must use SOURCE=CANONICAL syntax: {raw!r}")
    source_raw, canonical_raw = raw.split("=", 1)
    return (
        safe_relative(source_raw, "mapping source"),
        safe_relative(canonical_raw, "mapping target"),
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Back up external course notes and atomically replace them with "
            "symlinks to canonical repository notes. Defaults to dry-run."
        )
    )
    parser.add_argument("--source-dir", required=True, help="External course directory")
    parser.add_argument(
        "--canonical-dir", required=True, help="Canonical repository course directory"
    )
    parser.add_argument(
        "--map",
        action="append",
        default=[],
        metavar="SOURCE=CANONICAL",
        help="Map one relative source filename to one relative canonical filename",
    )
    parser.add_argument(
        "--same-name",
        action="append",
        default=[],
        metavar="PATH",
        help="Map the same relative filename in both directories",
    )
    parser.add_argument(
        "--backup-dir",
        help="New directory for source backups and manifest; defaults under /private/tmp",
    )
    parser.add_argument(
        "--relative-links",
        action="store_true",
        help="Create relative instead of absolute symlinks",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Perform the replacement; without this flag the command is read-only",
    )
    parser.add_argument(
        "--confirm-merged",
        action="store_true",
        help="Confirm that byte-different source content was semantically merged and reviewed",
    )
    return parser


def prepare_roots(source_raw: str, canonical_raw: str) -> tuple[Path, Path]:
    source = Path(source_raw).expanduser().resolve(strict=True)
    canonical = Path(canonical_raw).expanduser().resolve(strict=True)
    if not source.is_dir() or not canonical.is_dir():
        fail("--source-dir and --canonical-dir must both be existing directories")
    if source == canonical or is_within(source, canonical) or is_within(canonical, source):
        fail("source and canonical directories must be separate, non-nested trees")
    return source, canonical


def collect_pairs(args: argparse.Namespace) -> list[tuple[Path, Path]]:
    pairs = [parse_mapping(raw) for raw in args.map]
    pairs.extend(
        (safe_relative(raw, "same-name path"), safe_relative(raw, "same-name path"))
        for raw in args.same_name
    )
    if not pairs:
        fail("provide at least one --map or --same-name entry")

    source_names: set[Path] = set()
    canonical_names: set[Path] = set()
    for source_relative, canonical_relative in pairs:
        if source_relative in source_names:
            fail(f"duplicate source mapping: {source_relative}")
        if canonical_relative in canonical_names:
            fail(f"duplicate canonical mapping: {canonical_relative}")
        source_names.add(source_relative)
        canonical_names.add(canonical_relative)
    return pairs


def inspect_mapping(
    source_root: Path,
    canonical_root: Path,
    source_relative: Path,
    canonical_relative: Path,
) -> Mapping:
    source = source_root / source_relative
    canonical = canonical_root / canonical_relative

    source_parent = source.parent.resolve(strict=True)
    canonical_parent = canonical.parent.resolve(strict=True)
    if not is_within(source_parent, source_root):
        fail(f"source parent escapes --source-dir: {source_relative}")
    if not is_within(canonical_parent, canonical_root):
        fail(f"canonical parent escapes --canonical-dir: {canonical_relative}")
    if not os.path.lexists(source):
        fail(f"source path does not exist: {source}")
    if canonical.is_symlink():
        fail(f"canonical target must be a regular file, not a symlink: {canonical}")
    if not canonical.is_file():
        fail(f"canonical target is not a regular file: {canonical}")

    canonical_resolved = canonical.resolve(strict=True)
    if not is_within(canonical_resolved, canonical_root):
        fail(f"canonical target escapes --canonical-dir: {canonical}")
    canonical_hash = sha256(canonical)

    if source.is_symlink():
        original_link = os.readlink(source)
        already_correct = source.resolve(strict=False) == canonical_resolved
        return Mapping(
            source_relative,
            canonical_relative,
            source,
            canonical,
            "symlink",
            None,
            canonical_hash,
            original_link,
            already_correct,
        )
    if not source.is_file():
        fail(f"source path must be a regular file or symlink: {source}")
    return Mapping(
        source_relative,
        canonical_relative,
        source,
        canonical,
        "regular",
        sha256(source),
        canonical_hash,
        None,
        False,
    )


def describe_plan(mappings: list[Mapping]) -> None:
    print("Mapping plan:")
    for item in mappings:
        if item.already_correct:
            state = "already linked"
        elif item.source_kind == "regular" and item.source_hash != item.canonical_hash:
            state = "regular file; bytes differ"
        else:
            state = item.source_kind
        print(f"  [{state}] {item.source} -> {item.canonical}")


def create_backup_root(raw: Optional[str]) -> Path:
    if raw:
        backup = Path(raw).expanduser().resolve(strict=False)
        backup.mkdir(parents=True, exist_ok=False)
        return backup
    return Path(tempfile.mkdtemp(prefix="consolidate-course-notes-", dir="/private/tmp"))


def backup_sources(mappings: list[Mapping], backup_root: Path) -> None:
    for item in mappings:
        if item.already_correct or item.source_kind != "regular":
            continue
        backup = backup_root / "files" / item.source_relative
        backup.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(item.source, backup)
        if sha256(backup) != item.source_hash:
            fail(f"backup verification failed: {backup}")
        item.backup = backup


def manifest_data(
    source_root: Path, canonical_root: Path, mappings: list[Mapping]
) -> dict[str, object]:
    return {
        "source_dir": str(source_root),
        "canonical_dir": str(canonical_root),
        "mappings": [
            {
                "source": str(item.source),
                "canonical": str(item.canonical),
                "source_kind": item.source_kind,
                "source_sha256": item.source_hash,
                "canonical_sha256": item.canonical_hash,
                "original_link": item.original_link,
                "already_correct": item.already_correct,
                "backup": str(item.backup) if item.backup else None,
            }
            for item in mappings
        ],
    }


def verify_unchanged(mappings: list[Mapping]) -> None:
    for item in mappings:
        if sha256(item.canonical) != item.canonical_hash:
            fail(f"canonical target changed after preflight: {item.canonical}")
        if item.already_correct:
            continue
        if item.source_kind == "regular":
            if item.source.is_symlink() or sha256(item.source) != item.source_hash:
                fail(f"source file changed after preflight: {item.source}")
        elif not item.source.is_symlink() or os.readlink(item.source) != item.original_link:
            fail(f"source symlink changed after preflight: {item.source}")


def replace_one(item: Mapping, relative_links: bool) -> None:
    link_target = (
        os.path.relpath(item.canonical, start=item.source.parent)
        if relative_links
        else str(item.canonical)
    )
    temporary = item.source.parent / f".{item.source.name}.consolidate-{os.getpid()}"
    if os.path.lexists(temporary):
        fail(f"temporary link path already exists: {temporary}")
    os.symlink(link_target, temporary)
    try:
        os.replace(temporary, item.source)
    except Exception:
        if os.path.lexists(temporary):
            temporary.unlink()
        raise


def restore_one(item: Mapping) -> None:
    if os.path.lexists(item.source):
        item.source.unlink()
    if item.source_kind == "regular":
        if item.backup is None:
            fail(f"cannot roll back without backup: {item.source}")
        shutil.copy2(item.backup, item.source)
    else:
        if item.original_link is None:
            fail(f"cannot roll back symlink without original target: {item.source}")
        os.symlink(item.original_link, item.source)


def verify_links(mappings: list[Mapping]) -> None:
    for item in mappings:
        if not item.source.is_symlink():
            fail(f"result is not a symlink: {item.source}")
        if item.source.resolve(strict=True) != item.canonical.resolve(strict=True):
            fail(f"symlink resolves to the wrong target: {item.source}")
        if sha256(item.source) != sha256(item.canonical):
            fail(f"symlink bytes do not match canonical target: {item.source}")
        if item.canonical.is_symlink() or not item.canonical.is_file():
            fail(f"canonical target stopped being a regular file: {item.canonical}")


def run(args: argparse.Namespace) -> int:
    source_root, canonical_root = prepare_roots(args.source_dir, args.canonical_dir)
    pairs = collect_pairs(args)
    mappings = [
        inspect_mapping(source_root, canonical_root, source_relative, canonical_relative)
        for source_relative, canonical_relative in pairs
    ]
    describe_plan(mappings)

    byte_differences = [
        item
        for item in mappings
        if item.source_kind == "regular" and item.source_hash != item.canonical_hash
    ]
    if not args.apply:
        print("Dry run only; no files changed.")
        if byte_differences:
            print(
                "Byte-different regular files require semantic review and "
                "--confirm-merged when applying."
            )
        return 0
    if byte_differences and not args.confirm_merged:
        fail(
            "refusing to replace byte-different source files without --confirm-merged"
        )

    changes = [item for item in mappings if not item.already_correct]
    if not changes:
        verify_links(mappings)
        print("All mappings were already correct; no backup or mutation was needed.")
        return 0

    backup_root = create_backup_root(args.backup_dir)
    backup_sources(mappings, backup_root)
    manifest = backup_root / "manifest.json"
    manifest.write_text(
        json.dumps(manifest_data(source_root, canonical_root, mappings), ensure_ascii=False, indent=2)
        + "\n",
        encoding="utf-8",
    )
    verify_unchanged(mappings)

    replaced: list[Mapping] = []
    try:
        for item in changes:
            replace_one(item, args.relative_links)
            replaced.append(item)
        verify_links(mappings)
    except Exception:
        rollback_errors: list[str] = []
        for item in reversed(replaced):
            try:
                restore_one(item)
            except Exception as error:  # pragma: no cover - emergency path
                rollback_errors.append(f"{item.source}: {error}")
        if rollback_errors:
            print("Rollback errors:", file=sys.stderr)
            for error in rollback_errors:
                print(f"  {error}", file=sys.stderr)
        raise

    print(f"Replaced {len(changes)} source path(s) with verified symlinks.")
    print(f"Backup and manifest: {backup_root}")
    return 0


def main() -> int:
    parser = build_parser()
    try:
        return run(parser.parse_args())
    except (OSError, ValueError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
