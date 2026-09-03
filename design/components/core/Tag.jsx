import React from 'react';
import { Icon } from '../brand/Icon.jsx';

export function Tag({ href, onClick, onRemove, size = 'md', active = false, children, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const clickable = Boolean(href || onClick);
  const Tag_ = href ? 'a' : onClick ? 'button' : 'span';
  const sm = size === 'sm';
  return (
    <Tag_
      href={href} onClick={onClick} type={onClick && !href ? 'button' : undefined}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      {...rest}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: sm ? 3 : 'var(--space-2)',
        padding: sm ? '2px 8px 2px 6px' : '3px 11px 3px 8px',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid ' + (active ? 'rgba(15,92,147,.4)' : hover && clickable ? 'var(--border-subtle)' : 'var(--border-hairline)'),
        background: active ? 'var(--ocean-100)' : hover && clickable ? 'var(--surface-ghost-hover)' : 'transparent',
        color: active ? 'var(--ocean-700)' : hover && clickable ? 'var(--text-heading)' : 'var(--text-muted)',
        font: 'var(--fw-regular) ' + (sm ? 'var(--fs-micro)' : 'var(--fs-meta)') + '/1.5 var(--font-sans)',
        textDecoration: 'none', cursor: clickable ? 'pointer' : 'default',
        transition: 'var(--transition-control)', whiteSpace: 'nowrap', ...style
      }}
    >
      <Icon name="hash" size={sm ? 10 : 12} color={active ? 'var(--ocean-500)' : 'var(--text-faint)'} />
      {children}
      {onRemove && (
        <span role="button" aria-label="移除" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(e); }}
          style={{ display: 'inline-flex', marginLeft: 2, opacity: 0.6 }}>
          <Icon name="x" size={sm ? 10 : 12} />
        </span>
      )}
    </Tag_>
  );
}
