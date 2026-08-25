import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

interface Source {
  n: number;
  url: string;
  course: string;
  docTitle: string;
  heading: string;
}

type AskState = 'idle' | 'retrieving' | 'thinking' | 'answering' | 'error';

export function AskNotes() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [state, setState] = useState<AskState>('idle');
  const [error, setError] = useState('');
  const submitting = useRef(false);

  const ask = async (event?: { preventDefault(): void }) => {
    event?.preventDefault();
    const prompt = question.trim();
    if (!prompt || submitting.current) return;

    submitting.current = true;
    setAnswer('');
    setSources([]);
    setError('');
    setState('retrieving');

    try {
      const response = await fetch('/rag/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt, lang: 'zh' }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `问答服务返回 ${response.status}`);
      }
      if (!response.body) throw new Error('当前浏览器不支持流式问答');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split('\n\n');
        buffer = frames.pop() ?? '';

        for (const frame of frames) {
          if (!frame.trim() || frame.startsWith(':')) continue;
          let eventName = 'message';
          const dataLines: string[] = [];
          for (const line of frame.split('\n')) {
            if (line.startsWith('event: ')) eventName = line.slice(7).trim();
            if (line.startsWith('data: ')) dataLines.push(line.slice(6));
          }
          if (!dataLines.length) continue;

          let payload: unknown;
          try {
            payload = JSON.parse(dataLines.join('\n'));
          } catch {
            continue;
          }

          if (eventName === 'sources' && Array.isArray(payload)) setSources(payload as Source[]);
          if (eventName === 'thinking') setState('thinking');
          if (eventName === 'delta' && payload && typeof payload === 'object' && 'text' in payload) {
            setState('answering');
            setAnswer((current) => current + String((payload as { text: unknown }).text));
          }
          if (eventName === 'error' && payload && typeof payload === 'object' && 'message' in payload) {
            throw new Error(String((payload as { message: unknown }).message));
          }
        }
      }

      setState('idle');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '问答服务暂时不可用');
      setState('error');
    } finally {
      submitting.current = false;
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void ask();
    }
  };

  const status = state === 'retrieving'
    ? '正在检索笔记…'
    : state === 'thinking'
      ? '模型正在思考…'
      : state === 'answering'
        ? '正在生成回答…'
        : '';

  return (
    <>
      <button className="ask-fab" type="button" onClick={() => setOpen(true)} aria-label="问我的笔记">
        <MessageCircle aria-hidden="true" />
        <span>问我的笔记</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="ask-dialog" aria-describedby="ask-notes-description">
          <header className="ask-header">
            <DialogTitle>问我的笔记</DialogTitle>
            <DialogDescription id="ask-notes-description">
              基于真实笔记检索作答，并附引用来源。
            </DialogDescription>
          </header>

          <div className="ask-body" aria-live="polite">
            {!answer && !status && !error && (
              <p className="ask-empty">可跨课程提问。问答依赖自建部署中的同源 <code>/rag/ask</code> 服务；静态预览不会伪造回答。</p>
            )}
            {status && !answer && <p className="ask-status"><span aria-hidden="true" />{status}</p>}
            {answer && <div className="ask-answer">{answer}</div>}
            {error && <p className="ask-error">{error}</p>}

            {sources.length > 0 && (
              <section className="ask-sources" aria-label="引用来源">
                <h3>引用来源</h3>
                {sources.map((source) => (
                  <a key={`${source.n}-${source.url}`} href={source.url}>
                    <b>{source.n}</b>
                    <span><strong>{source.docTitle}</strong><small>{source.course}{source.heading ? ` · ${source.heading}` : ''}</small></span>
                  </a>
                ))}
              </section>
            )}
          </div>

          <form className="ask-form" onSubmit={ask}>
            <label className="sr-only" htmlFor="ask-question">输入问题</label>
            <textarea
              id="ask-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={onKeyDown}
              rows={2}
              placeholder="例如：寄存器调用约定解决了什么问题？"
              disabled={submitting.current}
              autoFocus
            />
            <Button type="submit" size="icon" disabled={!question.trim() || submitting.current} aria-label="发送问题">
              <Send className="size-4" aria-hidden="true" />
            </Button>
          </form>
          <p className="ask-hint">Enter 发送 · Shift+Enter 换行 · Esc 关闭</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
