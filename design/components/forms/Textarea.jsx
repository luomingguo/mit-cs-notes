import React from 'react';
import { Field } from './Field.jsx';

export function Textarea({ label, hint, error, rows = 4, id, disabled, style, wrapperStyle, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const auto = React.useMemo(() => 'ta-' + Math.random().toString(36).slice(2, 7), []);
  const uid = id || auto;
  return (
    <Field label={label} hint={hint} error={error} htmlFor={uid} style={wrapperStyle}>
      <textarea
        id={uid} rows={rows} disabled={disabled}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        {...rest}
        style={{
          width: '100%', boxSizing: 'border-box', resize: 'vertical',
          padding: 'var(--pad-field-y) var(--pad-field-x)',
          background: disabled ? 'var(--surface-sunken)' : 'var(--surface-raised)',
          border: '1px solid ' + (error ? 'var(--danger)' : focus ? 'var(--border-focus)' : 'var(--border-subtle)'),
          borderRadius: 'var(--radius-sm)',
          boxShadow: focus ? 'var(--shadow-focus)' : 'var(--shadow-inset-field)',
          font: 'var(--fw-regular) var(--fs-body-sm)/1.7 var(--font-serif)',
          color: 'var(--text-heading)', outline: 'none',
          transition: 'var(--transition-control)', opacity: disabled ? 0.55 : 1, ...style
        }}
      />
    </Field>
  );
}
