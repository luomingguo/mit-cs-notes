import React from 'react';
import { Icon } from '../brand/Icon.jsx';
import { Field } from './Field.jsx';

const H = { sm: 'var(--control-h-sm)', md: 'var(--control-h)', lg: 'var(--control-h-lg)' };

export function Input({
  label, hint, error, icon, suffix, size = 'md', id, disabled, style, wrapperStyle, ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const auto = React.useMemo(() => 'in-' + Math.random().toString(36).slice(2, 7), []);
  const uid = id || auto;
  const border = error ? 'var(--danger)' : focus ? 'var(--border-focus)' : hover ? 'var(--border-strong)' : 'var(--border-subtle)';
  return (
    <Field label={label} hint={hint} error={error} htmlFor={uid} style={wrapperStyle}>
      <div
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
          height: H[size] || H.md, padding: '0 var(--pad-field-x)',
          background: disabled ? 'var(--surface-sunken)' : 'var(--surface-raised)',
          border: '1px solid ' + border, borderRadius: 'var(--radius-sm)',
          boxShadow: focus ? 'var(--shadow-focus)' : 'var(--shadow-inset-field)',
          transition: 'var(--transition-control)', opacity: disabled ? 0.55 : 1
        }}
      >
        {icon && <Icon name={icon} size={15} color={focus ? 'var(--accent)' : 'var(--text-faint)'} />}
        <input
          id={uid} disabled={disabled}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          {...rest}
          style={{
            flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent',
            font: 'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-sans)',
            color: 'var(--text-heading)', padding: 0, ...style
          }}
        />
        {suffix && <span style={{ font: 'var(--type-meta)', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>{suffix}</span>}
      </div>
    </Field>
  );
}
