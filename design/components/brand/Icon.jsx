import React from 'react';

const BASE = 'https://cdn.jsdelivr.net/npm/lucide-static@0.544.0/icons/';

/* Lucide glyph rendered as a CSS mask so it inherits currentColor.
   Substituted icon set — see readme.md section 4. */
export function Icon({ name, size = 18, color = 'currentColor', style, ...rest }) {
  const url = 'url(' + BASE + name + '.svg)';
  return (
    <span
      aria-hidden="true"
      {...rest}
      style={{
        display: 'inline-block', width: size, height: size, flex: '0 0 auto',
        backgroundColor: color,
        WebkitMaskImage: url, maskImage: url,
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center', maskPosition: 'center',
        WebkitMaskSize: 'contain', maskSize: 'contain',
        ...style
      }}
    />
  );
}
