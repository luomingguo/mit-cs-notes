import React from 'react';

export function Divider({ variant = 'hairline', orientation = 'horizontal', label, style, ...rest }) {
  const vertical = orientation === 'vertical';
  const line = variant === 'route'
    ? { borderStyle: 'dashed', borderColor: 'var(--route-line)' }
    : variant === 'gold'
      ? { border: 0, background: 'linear-gradient(90deg,transparent,var(--rule-gold) 18%,var(--rule-gold) 82%,transparent)' }
      : { borderStyle: 'solid', borderColor: 'var(--border-hairline)' };

  if (label) {
    return (
      <div {...rest} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', ...style }}>
        <span style={{ flex: 1, height: 1, borderTop: '1px ' + (variant === 'route' ? 'dashed' : 'solid') + ' ' + (variant === 'route' ? 'var(--route-line)' : 'var(--border-hairline)') }} />
        <span style={{ font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--text-faint)' }}>{label}</span>
        <span style={{ flex: 1, height: 1, borderTop: '1px ' + (variant === 'route' ? 'dashed' : 'solid') + ' ' + (variant === 'route' ? 'var(--route-line)' : 'var(--border-hairline)') }} />
      </div>
    );
  }
  return (
    <hr {...rest} style={{
      margin: 0, border: 0,
      ...(vertical
        ? { width: 1, height: '100%', borderLeft: variant === 'gold' ? undefined : '1px solid', ...(variant === 'gold' ? { background: 'linear-gradient(180deg,transparent,var(--rule-gold) 18%,var(--rule-gold) 82%,transparent)' } : {}) }
        : { height: variant === 'gold' ? 1 : 0, borderTop: variant === 'gold' ? undefined : '1px solid' }),
      ...line, ...style
    }} />
  );
}
