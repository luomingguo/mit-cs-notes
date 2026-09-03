import React from 'react';

/* Right-rail contents for a 讲义. Levels 2 and 3 only. */
export function TableOfContents({ items = [], active, onSelect, title = '本页目录', style, ...rest }) {
  const [hover, setHover] = React.useState(null);
  return (
    <nav {...rest} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', ...style }}>
      {title && (
        <div style={{
          font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase',
          color: 'var(--text-faint)', marginBottom: 'var(--space-3)'
        }}>{title}</div>
      )}
      {items.map((it) => {
        const on = active === it.id;
        const h = hover === it.id;
        return (
          <a key={it.id} href={'#' + it.id}
            onClick={(e) => { if (onSelect) { e.preventDefault(); onSelect(it.id); } }}
            onMouseEnter={() => setHover(it.id)} onMouseLeave={() => setHover(null)}
            style={{
              display: 'block', textDecoration: 'none',
              paddingLeft: (it.level === 3 ? 'var(--space-7)' : 'var(--space-5)'),
              borderLeft: '1px solid ' + (on ? 'var(--accent)' : 'var(--border-hairline)'),
              paddingBlock: 3,
              font: (on ? 'var(--fw-medium) ' : 'var(--fw-regular) ') + 'var(--fs-meta)/1.55 var(--font-sans)',
              color: on ? 'var(--text-heading)' : h ? 'var(--text-body)' : 'var(--text-muted)',
              transition: 'var(--transition-control)'
            }}>{it.label}</a>
        );
      })}
    </nav>
  );
}
