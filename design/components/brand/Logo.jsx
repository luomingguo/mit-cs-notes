import React from 'react';

const DEFAULT_SRC = 'assets/logo-archipelago-badge-256.png';

/* Horizontal lockup: the badge plus the name in Playfair Display.
   No wordmark file was supplied by the brand - see readme.md section 4. */
export function Logo({
  src = DEFAULT_SRC, size = 40, showName = true, showCn = true,
  tone = 'auto', href, style, ...rest
}) {
  const nameColor = tone === 'inverse' ? 'var(--paper-50)' : tone === 'ink' ? 'var(--navy-900)' : 'var(--text-heading)';
  const cnColor = tone === 'inverse' ? 'var(--text-inverse-muted)' : 'var(--text-muted)';
  const Tag = href ? 'a' : 'span';
  return (
    <Tag
      href={href}
      {...rest}
      style={{ display: 'inline-flex', alignItems: 'center', gap: size > 32 ? 'var(--space-5)' : 'var(--space-4)', textDecoration: 'none', ...style }}
    >
      <img src={src} alt="Archipelago" width={size} height={size} style={{ width: size, height: size, display: 'block' }} />
      {showName && (
        <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{
            font: 'var(--fw-semibold) ' + Math.round(size * 0.52) + 'px/1.05 var(--font-wordmark)',
            color: nameColor, letterSpacing: '-0.01em'
          }}>Archipelago</span>
          {showCn && (
            <span style={{
              font: 'var(--fw-medium) ' + Math.max(10, Math.round(size * 0.24)) + 'px/1.2 var(--font-sans)',
              color: cnColor, letterSpacing: 'var(--tracking-label)'
            }}>群岛 · 公开课笔记</span>
          )}
        </span>
      )}
    </Tag>
  );
}
