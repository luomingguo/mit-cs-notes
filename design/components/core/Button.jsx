import React from 'react';
import { Icon } from '../brand/Icon.jsx';

const SIZES = {
  sm: { h: 'var(--control-h-sm)', px: 'var(--pad-control-sm-x)', fs: 'var(--fs-meta)', icon: 14, gap: 'var(--space-3)' },
  md: { h: 'var(--control-h)', px: 'var(--pad-control-x)', fs: 'var(--fs-body-sm)', icon: 16, gap: 'var(--space-4)' },
  lg: { h: 'var(--control-h-lg)', px: 'var(--pad-control-lg-x)', fs: 'var(--fs-body)', icon: 18, gap: 'var(--space-4)' }
};

function skin(variant, hover, press) {
  if (variant === 'primary') return {
    background: press ? 'var(--accent-press)' : hover ? 'var(--accent-hover)' : 'var(--accent)',
    color: 'var(--paper-50)', border: '1px solid transparent'
  };
  if (variant === 'danger') return {
    background: press ? 'var(--coral-700)' : hover ? 'var(--coral-700)' : 'var(--danger)',
    color: 'var(--paper-50)', border: '1px solid transparent'
  };
  if (variant === 'secondary') return {
    background: press ? 'var(--surface-sunken)' : hover ? 'var(--surface-raised)' : 'var(--surface-card)',
    color: 'var(--text-heading)',
    border: '1px solid ' + (hover ? 'var(--border-strong)' : 'var(--border-subtle)')
  };
  if (variant === 'ghost') return {
    background: press ? 'var(--surface-ghost-press)' : hover ? 'var(--surface-ghost-hover)' : 'transparent',
    color: hover ? 'var(--text-heading)' : 'var(--text-body)', border: '1px solid transparent'
  };
  return { /* quiet: text-only, reads as a link but sits on the control baseline */
    background: 'transparent', color: hover ? 'var(--text-link-hover)' : 'var(--text-link)',
    border: '1px solid transparent', padding: 0
  };
}

export function Button({
  variant = 'primary', size = 'md', icon, iconRight, fullWidth = false,
  disabled = false, href, type = 'button', children, style, onClick, ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const s = SIZES[size] || SIZES.md;
  const quiet = variant === 'quiet';
  const Tag = href ? 'a' : 'button';
  return (
    <Tag
      href={disabled ? undefined : href}
      type={href ? undefined : type}
      disabled={Tag === 'button' ? disabled : undefined}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      {...rest}
      style={{
        display: fullWidth ? 'flex' : 'inline-flex', width: fullWidth ? '100%' : undefined,
        alignItems: 'center', justifyContent: 'center', gap: s.gap,
        height: quiet ? 'auto' : s.h, padding: quiet ? 0 : '0 ' + s.px,
        font: 'var(--fw-medium) ' + 'var(--fs-body-sm)' + '/1 var(--font-sans)',
        fontSize: s.fs, borderRadius: quiet ? 0 : 'var(--radius-sm)',
        textDecoration: quiet ? 'underline' : 'none',
        textDecorationThickness: '1px', textUnderlineOffset: '0.24em',
        textDecorationColor: quiet && !hover ? 'color-mix(in oklab, currentColor 38%, transparent)' : 'currentColor',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transform: press && !disabled && !quiet ? 'scale(var(--press-scale))' : 'none',
        transition: 'var(--transition-control), transform var(--dur-instant) var(--ease-tide)',
        whiteSpace: 'nowrap', WebkitAppearance: 'none',
        ...skin(variant, hover && !disabled, press && !disabled),
        ...style
      }}
    >
      {icon && <Icon name={icon} size={s.icon} />}
      {children}
      {iconRight && <Icon name={iconRight} size={s.icon} />}
    </Tag>
  );
}
