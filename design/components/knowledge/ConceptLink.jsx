import React from 'react';
import { Icon } from '../brand/Icon.jsx';

/* The sea lane made concrete: an inline 内部链接 that previews its destination. */
export function ConceptLink({ href = '#', label, summary, kind = '概念', source, children, style, ...rest }) {
  const [open, setOpen] = React.useState(false);
  const showCard = Boolean(summary) && open;
  return (
    <span style={{ position: 'relative', display: 'inline' }}
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <a href={href} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} {...rest} style={{
        color: open ? 'var(--text-link-hover)' : 'var(--text-link)',
        textDecorationLine: 'underline', textDecorationStyle: 'dashed',
        textDecorationThickness: '1px', textUnderlineOffset: '0.22em',
        textDecorationColor: open ? 'currentColor' : 'color-mix(in oklab, var(--text-link) 45%, transparent)',
        transition: 'var(--transition-control)', ...style
      }}>{children || label}</a>
      {showCard && (
        <span style={{
          position: 'absolute', zIndex: 50, bottom: '100%', left: 0, marginBottom: 10,
          display: 'block', width: 306, padding: 'var(--space-6) var(--space-7)',
          background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)',
          borderTop: '2px solid var(--rule-gold)', borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-2)', textAlign: 'left', cursor: 'default'
        }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
            font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase',
            color: 'var(--text-accent)', marginBottom: 'var(--space-4)'
          }}>
            <Icon name="tower-control" size={11} />{kind}
          </span>
          <span style={{ display: 'block', font: 'var(--fw-medium) var(--fs-body-sm)/1.4 var(--font-display)', color: 'var(--text-heading)' }}>{label}</span>
          <span style={{ display: 'block', font: 'var(--fw-regular) var(--fs-meta)/1.7 var(--font-serif)', color: 'var(--text-muted)', marginTop: 'var(--space-4)' }}>{summary}</span>
          {source && (
            <span style={{ display: 'block', font: 'var(--type-meta)', fontSize: 'var(--fs-micro)', color: 'var(--text-faint)', marginTop: 'var(--space-5)' }}>{source}</span>
          )}
        </span>
      )}
    </span>
  );
}
