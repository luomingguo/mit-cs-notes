import { useState } from 'react';
import { ListTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { Backlink } from '@/lib/notes';

interface Heading { depth: number; slug: string; text: string }

export function RelationsSheet({
  headings,
  lecturePosition,
  lectureCount,
  tags,
  backlinks,
}: {
  headings: Heading[];
  lecturePosition: number | null;
  lectureCount: number;
  tags: string[];
  backlinks: Backlink[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm"><ListTree className="size-3.5" />目录与关系</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <header className="border-b border-border px-5 py-5 pr-12">
          <SheetTitle className="font-mono text-sm">本页目录与关系</SheetTitle>
          <SheetDescription className="mt-1 text-xs text-muted-foreground">仅显示能从真实内容推导的信息</SheetDescription>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <section>
            <h2 className="rail-label">ON THIS PAGE</h2>
            <nav className="rail-toc" aria-label="本页目录">
              {headings.map((heading) => (
                <SheetClose asChild key={heading.slug}>
                  <a href={`#${heading.slug}`} className={heading.depth === 3 ? 'toc-depth-3' : ''}>{heading.text}</a>
                </SheetClose>
              ))}
            </nav>
          </section>
          <section className="rail-section">
            <h2 className="rail-label">讲义序列</h2>
            <p className="rail-value">第 {lecturePosition ?? '—'} / {lectureCount} 讲</p>
            <p className="rail-note">来自 lecture 编号，不代表阅读进度。</p>
          </section>
          <section className="rail-section">
            <h2 className="rail-label">相关概念</h2>
            {tags.length ? <div className="tag-list">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div> : <p className="rail-empty">frontmatter 暂无 tags，未自动臆测概念。</p>}
          </section>
          <section className="rail-section">
            <h2 className="rail-label">反向链接 · {backlinks.length}</h2>
            {backlinks.length ? backlinks.map((link) => <a className="backlink" href={link.href} key={link.href}><span>{link.title}</span><small>{link.context}</small></a>) : <p className="rail-empty">当前课程未发现指向本文的 Markdown 链接。</p>}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
