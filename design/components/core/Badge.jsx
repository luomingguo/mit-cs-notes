import React from 'react';
import { Icon } from '../brand/Icon.jsx';

const TONES = {
  neutral: { fg: 'var(--text-muted)', bg: 'var(--surface-sunken)', bd: 'var(--border-hairline)', solid: 'var(--navy-800)' },
  ocean: { fg: 'var(--ocean-700)', bg: 'var(--ocean-100)', bd: 'rgba(15,92,147,.22)', solid: 'var(--ocean-600)' },
  gold: { fg: 'var(--gold-600)', bg: 'var(--gold-200)', bd: 'rgba(168,124,44,.28)', solid: 'var(--gold-500)' },
  kelp: { fg: 'var(--kelp-700)', bg: 'var(--kelp-200)', bd: 'rgba(47,107,87,.26)', solid: 'var(--kelp-600)' },
  coral: { fg: 'var(--coral-700)', bg: 'var(--coral-200)', bd: 'rgba(180,80,58,.26)', solid: 'var(--coral-600)' }
};

export function Badge({ tone = 'neutral', variant = 'soft', icon, uppercase = false, children, style, ...rest }) {
  const t = TONES[tone] || TONES.neutral;
  const skin = variant === 'solid'
    ? { background: t.solid, color: 'var(--paper-50)', border: '1px solid transparent' }
    : variant === 'outline'
      ? { background: 'transparent', color: t.fg, border: '1px solid ' + t.bd }
      : { background: t.bg, color: t.fg, border: '1px solid ' + t.bd };
  return (
    <span {...rest} style={{
      display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
      padding: '2px var(--space-4)', borderRadius: 'var(--radius-xs)',
      font: 'var(--fw-medium) var(--fs-micro)/1.5 var(--font-sans)',
      letterSpacing: uppercase ? 'var(--tracking-label)' : '0.02em',
      textTransform: uppercase ? 'uppercase' : 'none',
      whiteSpace: 'nowrap', ...skin, ...style
    }}>
      {icon && <Icon name={icon} size={11} />}
      {children}
    </span>
  );
}
