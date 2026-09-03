import React from 'react';
import { Icon } from '../brand/Icon.jsx';

/* 领域 / 课程 / 讲义 — the reader's position in the archipelago. */
export function Breadcrumb({ items = [], separator = 'chevron-right', style, ...rest }) {
  return (
    <nav aria-label="面包屑" {...rest} style={{
      display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)',
      font: 'var(--type-meta)', ...style
    }}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <React.Fragment key={it.label + i}>
            {i > 0 && (separator === 'dot'
              ? <span style={{ color: 'var(--text-faint)', padding: '0 2px' }}>·</span>
              : <Icon name={separator} size={12} color="var(--text-faint)" />)}
            {last || !it.href
              ? <span aria-current={last ? 'page' : undefined} style={{ color: last ? 'var(--text-heading)' : 'var(--text-muted)', fontWeight: last ? 'var(--fw-medium)' : 'var(--fw-regular)' }}>{it.label}</span>
              : <a href={it.href} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{it.label}</a>}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
