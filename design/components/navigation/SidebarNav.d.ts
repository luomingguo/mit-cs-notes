import type { CSSProperties } from 'react';

export interface SidebarNavItem {
  value?: string; label: string; href?: string; icon?: string; count?: number;
  /** 1 indents the row one step, for a course under a domain. */
  depth?: 0 | 1;
}
export interface SidebarNavSection { title?: string; items?: SidebarNavItem[] }

/** The left rail: 领域 and 课程 lists. Active row gets an inset 2px ocean marker. */
export interface SidebarNavProps {
  sections?: SidebarNavSection[];
  /** Value of the active item. */
  active?: string;
  /** Called with the item value; when present, row clicks are intercepted. */
  onSelect?: (value: string) => void;
  style?: CSSProperties;
}
export declare function SidebarNav(props: SidebarNavProps): JSX.Element;
