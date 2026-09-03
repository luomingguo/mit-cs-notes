import React from 'react';
import { Icon } from '../brand/Icon.jsx';

/* Answers "接下来可以读什么" from the incoming direction: who points here. */
function Row({ item }) {
  const [hover, setHover] = React.useState(false);
  return (
    <a href={item.href || '#'}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'block', textDecoration: 'none',
        padding: 'var(--space-5) 0 var(--space-5) var(--space-6)',
        borderLeft: '1px solid ' + (hover ? 'var(--accent)' : 'var(--border-hairline)'),
        transition: 'var(--transition-control)'
      }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 3 }}>
        <Icon name="corner-down-right" size={11} color={hover ? 'var(--accent)' : 'var(--text-faint)'} />
        <span style={{ font: 'var(--type-meta)', fontSize: 'var(--fs-micro)', color: 'var(--text-faint)' }}>{item.course}</span>
      </span>
      <span style={{
        display: 'block', font: 'var(--fw-medium) var(--fs-body-sm)/1.45 var(--font-display)',
        color: hover ? 'var(--text-link-hover)' : 'var(--text-heading)', transition: 'var(--transition-control)'
      }}>{item.title}</span>
      {item.context && (
        <span style={{ display: 'block', font: 'var(--fw-regular) var(--fs-meta)/1.7 var(--font-serif)', color: 'var(--text-muted)', marginTop: 4 }}>{item.context}</span>
      )}
    </a>
  );
}

export function BacklinkList({ items = [], title = '反向链接', empty = '还没有讲义指向这里。', style, ...rest }) {
  return (
    <section {...rest} style={{ ...style }}>
      {title && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)'
        }}>
          <span style={{ font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{title}</span>
          <span style={{ flex: 1, borderTop: '1px dashed var(--route-line)' }} />
          <span style={{ font: 'var(--font-mono)', fontSize: 'var(--fs-micro)', color: 'var(--text-faint)' }}>{items.length}</span>
        </div>
      )}
      {items.length === 0
        ? <p style={{ font: 'var(--fw-regular) var(--fs-meta)/1.7 var(--font-serif)', color: 'var(--text-faint)', margin: 0 }}>{empty}</p>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>{items.map((it, i) => <Row key={it.title + i} item={it} />)}</div>}
    </section>
  );
}
