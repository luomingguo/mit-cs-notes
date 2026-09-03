import React from 'react';
import { Icon } from '../brand/Icon.jsx';

function Row({ item, active, onSelect }) {
  const [hover, setHover] = React.useState(false);
  const on = active === item.value;
  return (
    <a
      href={item.href || '#'}
      onClick={(e) => { if (onSelect) { e.preventDefault(); onSelect(item.value); } }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-5)',
        padding: '7px var(--space-6) 7px ' + (item.depth ? 'var(--space-10)' : 'var(--space-6)'),
        borderRadius: 'var(--radius-sm)', textDecoration: 'none',
        background: on ? 'var(--surface-ghost-press)' : hover ? 'var(--surface-ghost-hover)' : 'transparent',
        color: on ? 'var(--text-heading)' : hover ? 'var(--text-heading)' : 'var(--text-muted)',
        font: (on ? 'var(--fw-medium) ' : 'var(--fw-regular) ') + 'var(--fs-body-sm)/1.45 var(--font-sans)',
        boxShadow: on ? 'inset 2px 0 0 var(--accent)' : 'none',
        transition: 'var(--transition-control)'
      }}
    >
      {item.icon && <Icon name={item.icon} size={16} color={on ? 'var(--accent)' : 'var(--text-faint)'} />}
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
      {item.count !== undefined && (
        <span style={{ font: 'var(--font-mono)', fontSize: 'var(--fs-micro)', color: 'var(--text-faint)' }}>{item.count}</span>
      )}
    </a>
  );
}

export function SidebarNav({ sections = [], active, onSelect, style, ...rest }) {
  return (
    <nav {...rest} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-9)', ...style }}>
      {sections.map((sec, i) => (
        <div key={sec.title || i} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {sec.title && (
            <div style={{
              font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase',
              color: 'var(--text-faint)', padding: '0 var(--space-6)', marginBottom: 'var(--space-4)'
            }}>{sec.title}</div>
          )}
          {(sec.items || []).map((it) => (
            <Row key={it.value || it.label} item={it} active={active} onSelect={onSelect} />
          ))}
        </div>
      ))}
    </nav>
  );
}
