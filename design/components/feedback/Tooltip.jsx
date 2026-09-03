import React from 'react';

const POS = {
  top: { bottom: '100%', left: '50%', transform: 'translate(-50%,-8px)' },
  bottom: { top: '100%', left: '50%', transform: 'translate(-50%,8px)' },
  left: { right: '100%', top: '50%', transform: 'translate(-8px,-50%)' },
  right: { left: '100%', top: '50%', transform: 'translate(8px,-50%)' }
};

export function Tooltip({ content, placement = 'top', kbd, children, style, ...rest }) {
  const [open, setOpen] = React.useState(false);
  return (
    <span {...rest}
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
      style={{ position: 'relative', display: 'inline-flex', ...style }}>
      {children}
      <span role="tooltip" style={{
        position: 'absolute', zIndex: 40, pointerEvents: 'none', whiteSpace: 'nowrap',
        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-4)',
        padding: '5px var(--space-5)', background: 'var(--navy-900)', color: 'var(--paper-100)',
        borderRadius: 'var(--radius-xs)', boxShadow: 'var(--shadow-2)',
        font: 'var(--fw-regular) var(--fs-micro)/1.5 var(--font-sans)',
        opacity: open ? 1 : 0,
        transition: 'opacity var(--dur-fast) var(--ease-tide)',
        ...POS[placement]
      }}>
        {content}
        {kbd && <span style={{ font: 'var(--font-mono)', fontSize: 10, color: 'var(--ocean-300)' }}>{kbd}</span>}
      </span>
    </span>
  );
}
