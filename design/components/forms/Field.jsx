import React from 'react';

/* Label + hint/error shell shared by every form control. */
export function Field({ label, hint, error, htmlFor, inline = false, children, style, ...rest }) {
  return (
    <div {...rest} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', ...style }}>
      {label && (
        <label htmlFor={htmlFor} style={{
          font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)',
          textTransform: 'uppercase', color: 'var(--text-muted)'
        }}>{label}</label>
      )}
      {children}
      {(error || hint) && (
        <span style={{
          font: 'var(--type-meta)',
          color: error ? 'var(--danger)' : 'var(--text-faint)'
        }}>{error || hint}</span>
      )}
    </div>
  );
}
