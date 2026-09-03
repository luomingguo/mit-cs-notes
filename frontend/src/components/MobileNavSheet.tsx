import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { NavDomain, NavLecture } from '@/lib/notes';

export function MobileNavSheet({
  domains,
  lectures,
  courseName,
  courseId,
}: {
  domains: NavDomain[];
  lectures: NavLecture[];
  courseName: string;
  courseId: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" aria-label="打开课程导航"><Menu className="size-4" /></Button>
      </SheetTrigger>
      <SheetContent side="left">
        <header className="border-b border-border px-5 py-5 pr-12">
          <SheetTitle className="font-display text-xl font-semibold text-foreground">课程导航</SheetTitle>
          <SheetDescription className="mt-1 text-xs text-muted-foreground">由 Markdown 目录与 frontmatter 自动生成</SheetDescription>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="mb-5">
            <div className="mb-2 font-mono text-[9px] tracking-[0.14em] text-faint">领域</div>
            {domains.map((domain) => (
              <a href={domain.href} key={domain.slug} aria-current={domain.active ? 'page' : undefined} className={`mobile-domain-link ${domain.active ? 'is-current' : ''}`}>
                <span>{domain.label}</span><span className="font-mono text-[9px] text-faint">{domain.courseCount} 门</span>
              </a>
            ))}
          </div>
          <div className="mb-2 font-mono text-[9px] tracking-[0.14em] text-faint">{courseId} · {courseName}</div>
          <nav aria-label="课程讲义">
            {lectures.map((lecture) => (
              <SheetClose asChild key={lecture.href}>
                <a href={lecture.href} aria-current={lecture.current ? 'page' : undefined} className={`mobile-lecture-link ${lecture.current ? 'is-current' : ''}`}>
                  <span className="font-mono text-[10px] opacity-70">{String(lecture.number ?? '').padStart(2, '0')}</span>
                  <span>{lecture.title}</span>
                </a>
              </SheetClose>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
