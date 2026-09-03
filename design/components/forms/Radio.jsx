import React from 'react';

export function Radio({ name, options = [], value, defaultValue, onChange, disabled, direction = 'column', style, ...rest }) {
  const [inner, setInner] = React.useState(defaultValue);
  const current = value !== undefined ? value : inner;
  const autoName = React.useMemo(() => 'rd-' + Math.random().toString(36).slice(2, 7), []);
  const gname = name || autoName;
  return (
    <div role="radiogroup" {...rest} style={{
      display: 'flex', flexDirection: direction, gap: direction === 'row' ? 'var(--space-8)' : 'var(--space-5)', ...style
    }}>
      {options.map((o) => {
        const opt = typeof o === 'string' ? { value: o, label: o } : o;
        const on = current === opt.value;
        return (
          <label key={opt.value} style={{
            display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--space-5)', alignItems: 'start',
            cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1
          }}>
            <input type="radio" name={gname} value={opt.value} checked={on} disabled={disabled}
              onChange={() => { if (value === undefined) setInner(opt.value); if (onChange) onChange(opt.value); }}
              style={{ position: 'absolute', opacity: 0, width: 1, height: 1, margin: 0 }} />
            <span style={{
              width: 17, height: 17, marginTop: 2, borderRadius: '50%', display: 'grid', placeItems: 'center',
              background: 'var(--surface-raised)',
              border: '1px solid ' + (on ? 'var(--accent)' : 'var(--border-subtle)'),
              boxShadow: on ? 'none' : 'var(--shadow-inset-field)',
              transition: 'var(--transition-control)'
            }}>
              {on && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--accent)' }} />}
            </span>
            <span>
              <span style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-sans)', color: 'var(--text-heading)' }}>{opt.label}</span>
              {opt.hint && <span style={{ display: 'block', font: 'var(--type-meta)', color: 'var(--text-faint)', marginTop: 2 }}>{opt.hint}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}
