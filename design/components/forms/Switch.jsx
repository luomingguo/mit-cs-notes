import React from 'react';

export function Switch({ label, hint, checked, defaultChecked, onChange, disabled, id, style, ...rest }) {
  const [inner, setInner] = React.useState(Boolean(defaultChecked));
  const on = checked !== undefined ? checked : inner;
  const auto = React.useMemo(() => 'sw-' + Math.random().toString(36).slice(2, 7), []);
  const uid = id || auto;
  return (
    <label htmlFor={uid} {...rest} style={{
      display: 'inline-flex', alignItems: 'center', gap: 'var(--space-6)',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1, ...style
    }}>
      <input id={uid} type="checkbox" role="switch" checked={on} disabled={disabled}
        onChange={(e) => { if (checked === undefined) setInner(e.target.checked); if (onChange) onChange(e); }}
        style={{ position: 'absolute', opacity: 0, width: 1, height: 1, margin: 0 }} />
      <span style={{
        width: 38, height: 21, flex: '0 0 auto', borderRadius: 'var(--radius-pill)', position: 'relative',
        background: on ? 'var(--accent)' : 'var(--sand-400)',
        boxShadow: 'var(--shadow-inset-field)',
        transition: 'background-color var(--dur-base) var(--ease-tide)'
      }}>
        <span style={{
          position: 'absolute', top: 2, left: on ? 19 : 2, width: 17, height: 17,
          borderRadius: '50%', background: 'var(--paper-50)', boxShadow: 'var(--shadow-1)',
          transition: 'left var(--dur-base) var(--ease-tide)'
        }} />
      </span>
      {(label || hint) && (
        <span>
          <span style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-sans)', color: 'var(--text-heading)' }}>{label}</span>
          {hint && <span style={{ display: 'block', font: 'var(--type-meta)', color: 'var(--text-faint)', marginTop: 2 }}>{hint}</span>}
        </span>
      )}
    </label>
  );
}
