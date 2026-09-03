import React from 'react';
import { Card } from '../core/Card.jsx';
import { Badge } from '../core/Badge.jsx';
import { Tag } from '../core/Tag.jsx';
import { Icon } from '../brand/Icon.jsx';

/* One 讲义. Answers "这篇在讲什么" in a summary capped at ~60 字. */
export function NoteCard({
  title, summary, course, lecture, readingTime, concepts = [], href, updated, style, ...rest
}) {
  return (
    <Card href={href} padding="md" style={style} {...rest}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
        {lecture && <Badge tone="ocean">{lecture}</Badge>}
        {course && (
          <span style={{ font: 'var(--type-meta)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course}</span>
        )}
      </div>
      <h3 style={{ font: 'var(--fw-medium) var(--fs-h4)/1.4 var(--font-display)', color: 'var(--text-heading)', margin: 0 }}>{title}</h3>
      {summary && (
        <p style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1.75 var(--font-serif)', color: 'var(--text-muted)', margin: 'var(--space-4) 0 0' }}>{summary}</p>
      )}
      {concepts.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
          {concepts.slice(0, 4).map((c) => <Tag key={c} size="sm">{c}</Tag>)}
        </div>
      )}
      {(readingTime || updated) && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-5)', marginTop: 'var(--space-6)',
          paddingTop: 'var(--space-5)', borderTop: '1px dashed var(--route-line)',
          font: 'var(--type-meta)', fontSize: 'var(--fs-micro)', color: 'var(--text-faint)'
        }}>
          {readingTime && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="clock" size={11} />{readingTime}</span>}
          {readingTime && updated && <span>·</span>}
          {updated && <span>{updated}</span>}
        </div>
      )}
    </Card>
  );
}
