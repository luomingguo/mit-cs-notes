import React from 'react';
import { IconButton } from '../core/IconButton.jsx';

export function Dialog({ open = false, title, eyebrow, onClose, footer, width = 520, children, style, ...rest }) {
  React.useEffect(() => {
    if (!open || !onClose) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 60, display: 'grid', placeItems: 'center',
        padding: 'var(--space-9)', background: 'var(--surface-scrim)',
        animation: 'none'
      }}
    >
      <div role="dialog" aria-modal="true" aria-label={title} {...rest} style={{
        width: '100%', maxWidth: width, background: 'var(--surface-raised)',
        border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-3)', overflow: 'hidden', ...style
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 'var(--space-6)',
          padding: 'var(--pad-card) var(--pad-card) var(--space-6)'
        }}>
          <div style={{ flex: 1 }}>
            {eyebrow && (
              <div style={{
                font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase',
                color: 'var(--text-accent)', marginBottom: 'var(--space-4)'
              }}>{eyebrow}</div>
            )}
            {title && <h2 style={{ font: 'var(--type-h3)', color: 'var(--text-heading)', margin: 0 }}>{title}</h2>}
          </div>
          {onClose && <IconButton icon="x" label="关闭" size="sm" onClick={onClose} />}
        </div>
        <div style={{
          padding: '0 var(--pad-card) var(--pad-card)',
          font: 'var(--fw-regular) var(--fs-body-sm)/1.75 var(--font-serif)', color: 'var(--text-body)'
        }}>{children}</div>
        {footer && (
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-5)',
            padding: 'var(--space-6) var(--pad-card)',
            borderTop: '1px solid var(--border-hairline)', background: 'var(--surface-sunken)'
          }}>{footer}</div>
        )}
      </div>
    </div>
  );
}
