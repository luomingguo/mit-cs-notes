import type { CSSProperties } from 'react';

export interface BacklinkItem {
  title: string;
  /** Where the pointing note lives. */
  course?: string;
  /** The sentence around the link, so the reader sees why it points here. */
  context?: string;
  href?: string;
}

/** Incoming links to the current page - the other half of "接下来可以读什么". */
export interface BacklinkListProps {
  items?: BacklinkItem[];
  title?: string | null;
  /** Empty-state sentence. Keep it plain: 还没有讲义指向这里。 */
  empty?: string;
  style?: CSSProperties;
}
export declare function BacklinkList(props: BacklinkListProps): JSX.Element;
