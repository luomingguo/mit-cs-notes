import React from 'react';
import { Icon } from '../brand/Icon.jsx';

export function Checkbox({ label, hint, checked, defaultChecked, onChange, disabled, id, style, ...rest }) {
  const [inner, setInner] = React.useState(Boolean(defaultChecked));
  const isOn = checked !== undefined ? checked : inner;
  const auto = React.useMemo(() => 'cb-' + Math.random().toString(36).slice(2, 7), []);
  const uid = id || auto;
  const [hover, setHover] = React.useState(false);
  return (
    <label htmlFor={uid}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--space-5)',
        alignItems: 'start', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1, minHeight: 'var(--space-7)', ...style
      }}>
      <input id={uid} type="checkbox" checked={isOn} disabled={disabled}
        onChange={(e) => { if (checked === undefined) setInner(e.target.checked); if (onChange) onChange(e); }}
        {...rest}
        style={{ position: 'absolute', opacity: 0, width: 1, height: 1, margin: 0 }} />
      <span style={{
        width: 17, height: 17, marginTop: 2, display: 'grid', placeItems: 'center',
        borderRadius: 'var(--radius-xs)',
        background: isOn ? 'var(--accent)' : 'var(--surface-raised)',
        border: '1px solid ' + (isOn ? 'var(--accent)' : hover ? 'var(--border-strong)' : 'var(--border-subtle)'),
        boxShadow: isOn ? 'none' : 'var(--shadow-inset-field)',
        transition: 'var(--transition-control)'
      }}>
        {isOn && <Icon name="check" size={12} color="var(--paper-50)" />}
      </span>
      <span>
        <span style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-sans)', color: 'var(--text-heading)' }}>{label}</span>
        {hint && <span style={{ display: 'block', font: 'var(--type-meta)', color: 'var(--text-faint)', marginTop: 2 }}>{hint}</span>}
      </span>
    </label>
  );
}
