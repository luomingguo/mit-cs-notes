import React from 'react';
import { Icon } from '../brand/Icon.jsx';

const SIZES = { sm: { box: 28, icon: 15 }, md: { box: 34, icon: 18 }, lg: { box: 42, icon: 20 } };

export function IconButton({
  icon, label, variant = 'ghost', size = 'md', active = false, disabled = false,
  href, onClick, style, ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const s = SIZES[size] || SIZES.md;
  const Tag = href ? 'a' : 'button';
  const skin = variant === 'solid'
    ? { background: press ? 'var(--accent-press)' : hover ? 'var(--accent-hover)' : 'var(--accent)', color: 'var(--paper-50)', border: '1px solid transparent' }
    : variant === 'outline'
      ? { background: hover ? 'var(--surface-raised)' : 'var(--surface-card)', color: 'var(--text-heading)', border: '1px solid ' + (hover ? 'var(--border-strong)' : 'var(--border-subtle)') }
      : { background: active ? 'var(--surface-ghost-press)' : press ? 'var(--surface-ghost-press)' : hover ? 'var(--surface-ghost-hover)' : 'transparent', color: active || hover ? 'var(--text-heading)' : 'var(--text-muted)', border: '1px solid transparent' };
  return (
    <Tag
      href={disabled ? undefined : href} type={href ? undefined : 'button'}
      aria-label={label} title={label}
      disabled={Tag === 'button' ? disabled : undefined}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)} onMouseUp={() => setPress(false)}
      {...rest}
      style={{
        display: 'inline-grid', placeItems: 'center', width: s.box, height: s.box,
        borderRadius: 'var(--radius-sm)', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1, padding: 0,
        transform: press && !disabled ? 'scale(var(--press-scale))' : 'none',
        transition: 'var(--transition-control), transform var(--dur-instant) var(--ease-tide)',
        ...skin, ...style
      }}
    >
      <Icon name={icon} size={s.icon} />
    </Tag>
  );
}
