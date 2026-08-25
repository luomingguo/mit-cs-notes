import { useEffect } from 'react';

export function TocHighlighter() {
  useEffect(() => {
    const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]')];
    const headings = links
      .map((link) => document.getElementById(link.dataset.tocLink || ''))
      .filter((heading): heading is HTMLElement => Boolean(heading));
    if (!headings.length) return;

    const activate = (id: string) => {
      for (const link of links) link.dataset.active = String(link.dataset.tocLink === id);
    };
    activate(headings[0].id);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target.id) activate(visible.target.id);
      },
      { rootMargin: '-12% 0px -76% 0px', threshold: [0, 1] },
    );
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, []);
  return null;
}
