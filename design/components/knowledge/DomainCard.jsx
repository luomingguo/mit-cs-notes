import React from 'react';
import { Icon } from '../brand/Icon.jsx';

/* One 领域 — an island group. Deep-sea tile: this is where the abyss world shows up. */
export function DomainCard({
  name, latin, summary, courseCount, noteCount, concepts = [], href, style, ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const Tag = href ? 'a' : 'div';
  return (
    <Tag href={href} data-theme="deep"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      {...rest}
      style={{
        display: 'block', textDecoration: 'none', position: 'relative', overflow: 'hidden',
        padding: 'var(--pad-card)',
        background: 'var(--gradient-abyss)',
        backgroundImage: 'var(--gradient-abyss), var(--texture-chart)',
        border: '1px solid ' + (hover ? 'rgba(143,198,223,.34)' : 'rgba(143,198,223,.16)'),
        borderRadius: 'var(--radius-card)',
        boxShadow: hover ? 'var(--shadow-2)' : 'var(--shadow-1)',
        transform: hover && href ? 'var(--lift-hover)' : 'none',
        transition: 'var(--transition-lift), border-color var(--dur-fast) var(--ease-tide)',
        ...style
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <Icon name="map" size={15} color="var(--gold-400)" />
        {latin && (
          <span style={{ font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--gold-400)' }}>{latin}</span>
        )}
      </div>
      <h3 style={{ font: 'var(--fw-semibold) var(--fs-h2)/1.25 var(--font-display)', color: 'var(--paper-50)', margin: 'var(--space-5) 0 0', letterSpacing: 'var(--tracking-heading)' }}>{name}</h3>
      {summary && (
        <p style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1.8 var(--font-serif)', color: 'var(--text-inverse-muted)', margin: 'var(--space-5) 0 0', maxWidth: '30em' }}>{summary}</p>
      )}
      {concepts.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', marginTop: 'var(--space-7)' }}>
          {concepts.slice(0, 5).map((c) => (
            <span key={c} style={{
              font: 'var(--fw-regular) var(--fs-micro)/1.5 var(--font-sans)', color: 'var(--ocean-200)',
              padding: '2px 9px', borderRadius: 'var(--radius-pill)', border: '1px dashed rgba(198,225,236,.3)'
            }}>{c}</span>
          ))}
        </div>
      )}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-6)', marginTop: 'var(--space-8)',
        paddingTop: 'var(--space-5)', borderTop: '1px dashed rgba(240,246,251,.28)',
        font: 'var(--type-meta)', color: 'var(--ocean-300)'
      }}>
        {courseCount !== undefined && <span>{courseCount} 门课程</span>}
        {courseCount !== undefined && noteCount !== undefined && <span style={{ opacity: .5 }}>·</span>}
        {noteCount !== undefined && <span>{noteCount} 篇讲义</span>}
        {href && (
          <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, color: hover ? 'var(--paper-50)' : 'var(--ocean-300)', transition: 'color var(--dur-fast) var(--ease-tide)' }}>
            登岛<Icon name="arrow-right" size={13} />
          </span>
        )}
      </div>
    </Tag>
  );
}
