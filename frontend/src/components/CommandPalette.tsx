import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, Boxes, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { SearchItem } from '@/lib/notes';

type Filter = 'all' | SearchItem['type'];

export function CommandPalette({ index = [], indexUrl }: { index?: SearchItem[]; indexUrl?: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(index);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    const onOpen = () => setOpen(true);
    document.addEventListener('keydown', onKey);
    window.addEventListener('open-note-search', onOpen);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('open-note-search', onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open || items.length || !indexUrl || loading) return;
    setLoading(true);
    fetch(indexUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`search index ${response.status}`);
        return response.json() as Promise<SearchItem[]>;
      })
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [indexUrl, items.length, loading, open]);

  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('zh');
    return items.filter((item) => {
      if (filter !== 'all' && item.type !== filter) return false;
      if (!needle) return true;
      return `${item.title} ${item.course} ${item.excerpt}`.toLocaleLowerCase('zh').includes(needle);
    });
  }, [filter, items, query]);

  const go = (href: string) => {
    setOpen(false);
    window.location.assign(href);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent aria-describedby="note-search-description">
        <DialogTitle className="sr-only">搜索课程讲义</DialogTitle>
        <DialogDescription id="note-search-description" className="sr-only">
          搜索结果来自完整真实语料，使用上下方向键选择，回车打开。
        </DialogDescription>
        <Command shouldFilter={false} loop>
          <CommandInput value={query} onValueChange={setQuery} placeholder={indexUrl ? '搜索全站领域、课程与讲义…' : `搜索本课程 ${items.filter((item) => item.type === 'lecture').length} 篇讲义…`} autoFocus />
          <div className="flex gap-1.5 border-b border-border px-3 py-2">
            {([
              ['all', '全部'],
              ['domain', '领域'],
              ['lecture', '讲义'],
              ['course', '课程'],
            ] as const).map(([value, label]) => (
              <Button
                key={value}
                type="button"
                variant={filter === value ? 'default' : 'outline'}
                size="sm"
                className="h-7 rounded-full px-3 font-mono text-[10px] tracking-wide"
                onClick={() => setFilter(value)}
              >
                {label}
              </Button>
            ))}
          </div>
          <CommandList>
            <CommandEmpty>{loading ? '正在载入全站索引…' : '没有匹配结果。可以尝试课程号、标题或正文关键词。'}</CommandEmpty>
            <CommandGroup>
              <AnimatePresence initial={false} mode="popLayout">
                {results.map((item) => (
                  <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                    <CommandItem value={item.id} onSelect={() => go(item.href)}>
                      {item.type === 'course' ? <Library className="mr-3 size-4 text-muted-foreground" /> : item.type === 'domain' ? <Boxes className="mr-3 size-4 text-muted-foreground" /> : <BookOpen className="mr-3 size-4 text-muted-foreground" />}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{item.title}</div>
                        <div className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">{item.excerpt}</div>
                      </div>
                      <span className="ml-3 rounded-full border border-border px-2 py-0.5 font-mono text-[9px] text-muted-foreground">{item.typeLabel}</span>
                    </CommandItem>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CommandGroup>
          </CommandList>
          <footer className="flex gap-4 border-t border-border bg-sidebar px-4 py-2 font-mono text-[9px] text-faint">
            <span>↑↓ 选择</span><span>↵ 打开</span><span>esc 关闭</span>
          </footer>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
