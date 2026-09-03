Renders one Lucide glyph tinted with currentColor; use it for chrome (nav, buttons, meta rows), never inside body copy.

    <Icon name="book-open" size={16} />
    <Icon name="link" size={14} color="var(--gold-500)" />

Stick to the sanctioned glyph list in readme.md section 4. Icons are loaded from the lucide-static CDN as mask images, so they need network access but no bundling. Never scale above 32px — use the badge asset instead.
