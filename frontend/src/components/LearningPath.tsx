import { useId, useState } from 'react';
import type { LearningPathsData } from '@/lib/learning-paths';

interface Props {
  data: LearningPathsData;
}

export function LearningPath({ data }: Props) {
  const paths = Object.values(data.paths);
  const [activeSlug, setActiveSlug] = useState(paths[0]?.slug ?? '');
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set([0]));
  const instanceId = useId().replaceAll(':', '');
  const active = paths.find((path) => path.slug === activeSlug) ?? paths[0];

  function selectPath(slug: string) {
    setActiveSlug(slug);
    setExpanded(new Set([0]));
  }

  function toggleStep(index: number) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  if (!active) {
    return <p className="learning-path-status">当前没有已生成的学习路径。</p>;
  }

  return (
    <section className="learning-path" aria-labelledby={`${instanceId}-title`}>
      <div className="learning-path-heading">
        <div>
          <p className="learning-path-kicker">GOAL-BASED READING</p>
          <h2 id={`${instanceId}-title`}>选择学习目标</h2>
        </div>
        <time dateTime={data.generatedAt}>数据更新于 {data.generatedAt.slice(0, 10)}</time>
      </div>

      <nav className="learning-path-goals" aria-label="学习目标">
        {paths.map((path) => (
          <button
            key={path.slug}
            type="button"
            className={path.slug === active.slug ? 'is-active' : undefined}
            aria-pressed={path.slug === active.slug}
            onClick={() => selectPath(path.slug)}
          >
            <strong>{path.title}</strong>
            <span>{path.brief}</span>
          </button>
        ))}
      </nav>

      <div className="learning-path-overview">
        <p>{active.summary}</p>
        <dl>
          <div><dt>阶段</dt><dd>{active.steps.length}</dd></div>
          <div><dt>预计时间</dt><dd>{active.estimatedWeeks} 周</dd></div>
        </dl>
      </div>

      {active.prerequisites && <p className="learning-path-prerequisite"><strong>前置基础</strong>{active.prerequisites}</p>}

      <ol className="learning-path-steps">
        {active.steps.map((step, index) => {
          const open = expanded.has(index);
          const panelId = `${instanceId}-${active.slug}-step-${index}`;
          return (
            <li key={`${active.slug}-${step.title}`} className={open ? 'is-open' : undefined}>
              <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => toggleStep(index)}>
                <span className="learning-path-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="learning-path-step-title"><strong>{step.title}</strong><small>{step.course}</small></span>
                <span className="learning-path-caret" aria-hidden="true">›</span>
              </button>
              <div id={panelId} className="learning-path-step-body" hidden={!open}>
                <p><strong>为什么是这一步</strong>{step.why}</p>
                {step.notes.length > 0 && (
                  <div className="learning-path-notes">
                    <span>对应笔记</span>
                    <div>{step.notes.map((note) => <a key={note.url} href={note.url}>{note.title}</a>)}</div>
                  </div>
                )}
                {step.checkpoint && <p className="learning-path-checkpoint"><strong>过关标志</strong>{step.checkpoint}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
