import React from 'react';

const PADS = { none: 0, sm: 'var(--space-6)', md: 'var(--pad-card)', lg: 'var(--pad-card-lg)' };

export function Card({
  padding = 'md', interactive = false, sheen = false, href, onClick,
  as, children, style, ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const live = interactive || Boolean(href || onClick);
  const Tag = as || (href ? 'a' : onClick ? 'button' : 'div');
  return (
    <Tag
      href={href} onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      {...rest}
      style={{
        display: 'block', textAlign: 'left', width: '100%', boxSizing: 'border-box',
        background: 'var(--surface-card)',
        border: '1px solid ' + (live && hover ? 'var(--border-subtle)' : 'var(--border-hairline)'),
        borderRadius: 'var(--radius-card)',
        padding: PADS[padding] !== undefined ? PADS[padding] : PADS.md,
        boxShadow: live && hover
          ? 'var(--shadow-2)' + (sheen ? ', var(--shadow-inset-top)' : '')
          : 'var(--shadow-1)' + (sheen ? ', var(--shadow-inset-top)' : ''),
        transform: live && hover ? 'var(--lift-hover)' : 'none',
        transition: 'var(--transition-lift), border-color var(--dur-fast) var(--ease-tide)',
        textDecoration: 'none', color: 'inherit',
        cursor: live ? 'pointer' : 'default',
        font: 'inherit', ...style
      }}
    >
      {children}
    </Tag>
  );
}
