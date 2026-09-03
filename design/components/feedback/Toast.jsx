import React from 'react';
import { Icon } from '../brand/Icon.jsx';
import { IconButton } from '../core/IconButton.jsx';

const TONES = {
  neutral: { icon: 'info', accent: 'var(--navy-700)' },
  success: { icon: 'check', accent: 'var(--success)' },
  warning: { icon: 'triangle-alert', accent: 'var(--warning)' },
  danger: { icon: 'octagon-alert', accent: 'var(--danger)' }
};

export function Toast({ tone = 'neutral', title, children, action, onDismiss, style, ...rest }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <div role="status" {...rest} style={{
      display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'start', gap: 'var(--space-5)',
      minWidth: 300, maxWidth: 420, padding: 'var(--space-6) var(--space-6) var(--space-6) var(--space-7)',
      background: 'var(--navy-900)', color: 'var(--text-inverse)',
      borderRadius: 'var(--radius-sm)', borderTop: '2px solid ' + t.accent,
      boxShadow: 'var(--shadow-3)', ...style
    }}>
      <Icon name={t.icon} size={16} color={t.accent} style={{ marginTop: 2 }} />
      <div>
        {title && <div style={{ font: 'var(--fw-medium) var(--fs-body-sm)/1.45 var(--font-sans)', color: 'var(--paper-50)' }}>{title}</div>}
        {children && <div style={{ font: 'var(--type-meta)', color: 'var(--text-inverse-muted)', marginTop: title ? 3 : 0 }}>{children}</div>}
        {action && <div style={{ marginTop: 'var(--space-5)' }}>{action}</div>}
      </div>
      {onDismiss && <IconButton icon="x" label="关闭" size="sm" onClick={onDismiss} style={{ color: 'var(--text-inverse-muted)' }} />}
    </div>
  );
}
