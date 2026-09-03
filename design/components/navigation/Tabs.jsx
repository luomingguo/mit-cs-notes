import React from 'react';
import { Icon } from '../brand/Icon.jsx';

export function Tabs({ items = [], value, defaultValue, onChange, size = 'md', style, ...rest }) {
  const first = items.length ? (typeof items[0] === 'string' ? items[0] : items[0].value) : undefined;
  const [inner, setInner] = React.useState(defaultValue !== undefined ? defaultValue : first);
  const current = value !== undefined ? value : inner;
  const [hover, setHover] = React.useState(null);
  const sm = size === 'sm';
  return (
    <div role="tablist" {...rest} style={{
      display: 'flex', gap: 'var(--space-8)', borderBottom: '1px solid var(--border-hairline)', ...style
    }}>
      {items.map((raw) => {
        const it = typeof raw === 'string' ? { value: raw, label: raw } : raw;
        const on = current === it.value;
        return (
          <button key={it.value} role="tab" aria-selected={on} type="button"
            onClick={() => { if (value === undefined) setInner(it.value); if (onChange) onChange(it.value); }}
            onMouseEnter={() => setHover(it.value)} onMouseLeave={() => setHover(null)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 'var(--space-4)',
              padding: sm ? '0 0 8px' : '0 0 12px', background: 'none', border: 0,
              borderBottom: '2px solid ' + (on ? 'var(--accent)' : 'transparent'),
              marginBottom: -1, cursor: 'pointer',
              font: 'var(--fw-medium) ' + (sm ? 'var(--fs-meta)' : 'var(--fs-body-sm)') + '/1.4 var(--font-sans)',
              color: on ? 'var(--text-heading)' : hover === it.value ? 'var(--text-heading)' : 'var(--text-muted)',
              transition: 'var(--transition-control)'
            }}>
            {it.icon && <Icon name={it.icon} size={15} />}
            {it.label}
            {it.count !== undefined && (
              <span style={{ font: 'var(--type-mono)', fontSize: 'var(--fs-micro)', color: 'var(--text-faint)' }}>{it.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
