import React from 'react';
import { Card } from '../core/Card.jsx';
import { Icon } from '../brand/Icon.jsx';

/* One 课程 — an island. Keeps the course's own spine visible. */
export function CourseCard({
  title, institution, code, summary, noteCount, conceptCount, domain, progress, href, style, ...rest
}) {
  return (
    <Card href={href} padding="md" sheen style={style} {...rest}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
        <Icon name="book-open" size={15} color="var(--ocean-500)" />
        {code && <span style={{ font: 'var(--font-mono)', fontSize: 'var(--fs-micro)', letterSpacing: '.04em', color: 'var(--text-muted)' }}>{code}</span>}
        {institution && <span style={{ font: 'var(--type-meta)', fontSize: 'var(--fs-micro)', color: 'var(--text-faint)' }}>{institution}</span>}
      </div>
      <h3 style={{ font: 'var(--fw-semibold) var(--fs-h3)/1.3 var(--font-display)', color: 'var(--text-heading)', margin: 0, letterSpacing: 'var(--tracking-heading)' }}>{title}</h3>
      {domain && (
        <div style={{ font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--text-accent)', marginTop: 'var(--space-4)' }}>{domain}</div>
      )}
      {summary && (
        <p style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1.75 var(--font-serif)', color: 'var(--text-muted)', margin: 'var(--space-5) 0 0' }}>{summary}</p>
      )}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-6)', marginTop: 'var(--space-7)',
        paddingTop: 'var(--space-5)', borderTop: '1px solid var(--border-hairline)',
        font: 'var(--type-meta)', color: 'var(--text-muted)'
      }}>
        {noteCount !== undefined && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="file-text" size={12} color="var(--text-faint)" />{noteCount} 篇讲义</span>}
        {conceptCount !== undefined && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="link" size={12} color="var(--text-faint)" />{conceptCount} 个概念</span>}
        {progress && <span style={{ marginLeft: 'auto', color: 'var(--text-faint)' }}>{progress}</span>}
      </div>
    </Card>
  );
}
