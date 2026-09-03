import type { CSSProperties, ReactNode } from 'react';

/**
 * An inline 内部链接 with a hover preview - the brand's signature interaction.
 */
export interface ConceptLinkProps {
  href?: string;
  /** Canonical concept name, shown as the preview title. */
  label: string;
  /** One or two sentences answering 这篇在讲什么. Omit to render a plain dashed link. */
  summary?: string;
  /** Tracked uppercase kind line, default 概念. */
  kind?: string;
  /** Provenance line, e.g. "正义论导读 · 第 3 讲". */
  source?: string;
  /** Link text if it differs from label. */
  children?: ReactNode;
  style?: CSSProperties;
}
export declare function ConceptLink(props: ConceptLinkProps): JSX.Element;
