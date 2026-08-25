import { visit } from 'unist-util-visit';

interface LinkNode {
  type: string;
  properties?: { href?: string };
}

export function rehypeInternalLinks() {
  return (tree: unknown) => {
    visit(tree as never, 'element', (node: LinkNode) => {
      if (!node.properties?.href) return;
      const href = node.properties.href;
      if (/^(https?:|mailto:|#)/.test(href)) return;

      node.properties.href = href.replace(/\.md(?=($|#|\?))/, '').replace(/\/index(?=($|#|\?))/, '/');
    });
  };
}
