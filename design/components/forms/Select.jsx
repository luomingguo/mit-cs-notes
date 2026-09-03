import React from 'react';
import { Icon } from '../brand/Icon.jsx';
import { Field } from './Field.jsx';

const H = { sm: 'var(--control-h-sm)', md: 'var(--control-h)', lg: 'var(--control-h-lg)' };

export function Select({
  label, hint, error, options = [], size = 'md', id, disabled, placeholder, style, wrapperStyle, ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const auto = React.useMemo(() => 'se-' + Math.random().toString(36).slice(2, 7), []);
  const uid = id || auto;
  return (
    <Field label={label} hint={hint} error={error} htmlFor={uid} style={wrapperStyle}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <select
          id={uid} disabled={disabled}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          {...rest}
          style={{
            width: '100%', height: H[size] || H.md, WebkitAppearance: 'none', appearance: 'none',
            padding: '0 34px 0 var(--pad-field-x)',
            background: disabled ? 'var(--surface-sunken)' : 'var(--surface-raised)',
            border: '1px solid ' + (error ? 'var(--danger)' : focus ? 'var(--border-focus)' : 'var(--border-subtle)'),
            borderRadius: 'var(--radius-sm)',
            boxShadow: focus ? 'var(--shadow-focus)' : 'var(--shadow-inset-field)',
            font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-sans)',
            color: 'var(--text-heading)', outline: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'var(--transition-control)', opacity: disabled ? 0.55 : 1, ...style
          }}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => {
            const opt = typeof o === 'string' ? { value: o, label: o } : o;
            return <option key={opt.value} value={opt.value}>{opt.label}</option>;
          })}
        </select>
        <Icon name="chevron-down" size={15} color="var(--text-faint)"
          style={{ position: 'absolute', right: 'var(--space-5)', pointerEvents: 'none' }} />
      </div>
    </Field>
  );
}
