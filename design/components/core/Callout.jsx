import React from 'react';
import { Icon } from '../brand/Icon.jsx';

/* The margin apparatus of a note: what to read first, where to sail next. */
const KINDS = {
  note: { icon: 'file-text', label: '注', accent: 'var(--border-strong)', tint: 'var(--surface-sunken)' },
  prereq: { icon: 'anchor', label: '需要先读', accent: 'var(--gold-500)', tint: 'rgba(199,154,62,.08)' },
  next: { icon: 'arrow-right', label: '接下来可以读', accent: 'var(--ocean-500)', tint: 'var(--ocean-100)' },
  caution: { icon: 'triangle-alert', label: '留意', accent: 'var(--coral-600)', tint: 'rgba(180,80,58,.07)' },
  log: { icon: 'compass', label: '航海日志', accent: 'var(--navy-700)', tint: 'rgba(0,26,61,.045)' }
};

export function Callout({ kind = 'note', label, tinted = true, children, style, ...rest }) {
  const k = KINDS[kind] || KINDS.note;
  return (
    <aside {...rest} style={{
      display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--space-5)',
      padding: 'var(--space-6) var(--space-7)',
      background: tinted ? k.tint : 'transparent',
      borderTop: '1px solid ' + k.accent,
      borderBottom: '1px dashed var(--route-line)',
      ...style
    }}>
      <Icon name={k.icon} size={16} color={k.accent} style={{ marginTop: 4 }} />
      <div>
        <div style={{
          font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)',
          textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--space-3)'
        }}>{label || k.label}</div>
        <div style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1.75 var(--font-serif)', color: 'var(--text-body)' }}>
          {children}
        </div>
      </div>
    </aside>
  );
}
