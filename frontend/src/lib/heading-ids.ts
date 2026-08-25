import { visit } from 'unist-util-visit';

export interface SourceHeading {
  depth: number;
  slug: string;
  text: string;
}

export function slugifyHeading(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[\u0000-\u001f]/g, '')
    .replace(/[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^(\d)/, '_$1')
    .toLowerCase();
}

function plainHeading(value: string): string {
  return value
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/\*([^*]*)\*/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .trim();
}

function withoutCodeFences(source: string): string {
  const lines = source.split('\n');
  let marker = '';
  let length = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const match = /^([ \t]*(?:[-*+]|\d+[.)])?[ \t]*)(`{3,}|~{3,})(.*)$/.exec(lines[index]);
    if (!match) {
      if (marker) lines[index] = '';
      continue;
    }
    const currentMarker = match[2][0];
    if (!marker) {
      marker = currentMarker;
      length = match[2].length;
      lines[index] = '';
    } else if (currentMarker === marker && match[2].length >= length) {
      marker = '';
      length = 0;
      lines[index] = '';
    } else {
      lines[index] = '';
    }
  }
  return lines.join('\n');
}

export function sourceHeadings(source: string): SourceHeading[] {
  const seen = new Map<string, number>();
  return [...withoutCodeFences(source).matchAll(/^(#{1,6})[ \t]+(.+)$/gm)].flatMap((match) => {
    const text = plainHeading(match[2]);
    const base = slugifyHeading(text);
    if (!base) return [];
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return [{ depth: match[1].length, text, slug: count ? `${base}-${count}` : base }];
  });
}

export function remarkLegacyHeadingIds() {
  return (tree: any, file: any) => {
    const source = String(file.value ?? '');
    const seen = new Map<string, number>();
    visit(tree, 'heading', (node: any) => {
      const start = node.position?.start?.offset;
      const end = node.position?.end?.offset;
      if (typeof start !== 'number' || typeof end !== 'number') return;

      // RAG references were generated from the literal Markdown heading text.
      // Reading the source slice here keeps math commands and inline HTML intact;
      // deriving the id after KaTeX/HTML rendering would silently change old URLs.
      const raw = source.slice(start, end).replace(/^#{1,6}[ \t]+/, '');
      const base = slugifyHeading(plainHeading(raw));
      if (!base) return;
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      node.data = {
        ...(node.data ?? {}),
        hProperties: {
          ...(node.data?.hProperties ?? {}),
          id: count ? `${base}-${count}` : base,
        },
      };
    });
  };
}
