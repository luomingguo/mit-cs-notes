import type { CSSProperties } from 'react';

export interface BreadcrumbItem { label: string; href?: string }

/** The reader's position: 领域 / 课程 / 讲义. Appears above every content title. */
export interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  /** "chevron-right" for hierarchy, "dot" for a flatter meta row. */
  separator?: 'chevron-right' | 'dot';
  style?: CSSProperties;
}
export declare function Breadcrumb(props: BreadcrumbProps): JSX.Element;
