/* Wrapped in an IIFE: every text/babel script in this kit shares one top-level
   scope, so bare consts would collide across files. Exports go on window. */
(() => {
  const { DomainCard, NoteCard, CourseCard, Button, Divider, Logo, Icon, Badge } = window.ArchipelagoDesignSystem_958ced;

  const QUESTIONS = [
    ['这篇在讲什么', '每篇讲义开头一句摘要，先给结论的形状。'],
    ['需要先读什么', '前置讲义写在正文之前，不藏在页尾。'],
    ['接下来可以读什么', '航线指向别的岛，也指向反过来引用你的人。']
  ];

  function Hero({ onNav }) {
    return (
      <section data-theme="deep" style={{
        background: 'var(--gradient-abyss)',
        backgroundImage: 'var(--gradient-abyss), var(--texture-chart)',
        borderBottom: '1px solid rgba(143,198,223,.16)'
      }}>
        <PageWidth style={{ padding: 'var(--space-13) var(--page-gutter) var(--space-12)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 268px', gap: 'var(--space-12)', alignItems: 'center' }}>
            <div>
              <div style={{
                font: 'var(--type-label)', letterSpacing: 'var(--tracking-micro)', textTransform: 'uppercase',
                color: 'var(--gold-400)', marginBottom: 'var(--space-7)'
              }}>公开课笔记 · 第 4 年</div>
              <h1 style={{
                font: 'var(--fw-semibold) var(--fs-display-2)/1.14 var(--font-display)',
                letterSpacing: 'var(--tracking-display)', color: 'var(--paper-50)', margin: 0, maxWidth: '18em'
              }}>把公开课笔记<br />重新连成一张海图</h1>
              <p style={{
                font: 'var(--fw-regular) var(--fs-lead)/1.75 var(--font-serif)',
                color: 'var(--text-inverse-muted)', margin: 'var(--space-8) 0 0', maxWidth: '26em'
              }}>课程的脉络留着，但内容按领域、讲义、概念和内部链接重排。不同学科是各自独立的岛屿，链接是连接它们的航线。</p>
              <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-10)' }}>
                <Button size="lg" iconRight="arrow-right" onClick={() => onNav('domain')}>从政治哲学出发</Button>
                <Button size="lg" variant="ghost" icon="list" onClick={() => onNav('lecture')}>看一篇讲义</Button>
              </div>
            </div>
            <img src="../../assets/logo-archipelago-badge-512.png" alt="Archipelago"
              style={{ width: 268, height: 268, justifySelf: 'end' }} />
          </div>
        </PageWidth>
      </section>
    );
  }

  function Questions() {
    return (
      <PageWidth style={{ padding: 'var(--space-11) var(--page-gutter) 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-10)' }}>
          {QUESTIONS.map(([q, a], i) => (
            <div key={q} style={{ paddingTop: 'var(--space-6)', borderTop: '1px solid var(--border-hairline)' }}>
              <div style={{
                font: 'var(--font-mono)', fontSize: 'var(--fs-micro)', color: 'var(--text-accent)',
                marginBottom: 'var(--space-5)'
              }}>{'0' + (i + 1)}</div>
              <h3 style={{ font: 'var(--fw-medium) var(--fs-h4)/1.4 var(--font-display)', color: 'var(--text-heading)', margin: 0 }}>{q}</h3>
              <p style={{ font: 'var(--fw-regular) var(--fs-body-sm)/1.8 var(--font-serif)', color: 'var(--text-muted)', margin: 'var(--space-4) 0 0' }}>{a}</p>
            </div>
          ))}
        </div>
      </PageWidth>
    );
  }

  function SectionHead({ label, title, action, onAction }) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
        <div>
          <div style={{
            font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase',
            color: 'var(--text-faint)', marginBottom: 'var(--space-4)'
          }}>{label}</div>
          <h2 style={{ font: 'var(--type-h2)', color: 'var(--text-heading)', margin: 0 }}>{title}</h2>
        </div>
        <span style={{ flex: 1, borderTop: '1px dashed var(--route-line)', marginBottom: 10 }} />
        {action && <Button variant="quiet" iconRight="arrow-right" onClick={onAction}>{action}</Button>}
      </div>
    );
  }

  function AtlasHome({ onNav, onOpenNote }) {
    return (
      <>
        <Hero onNav={onNav} />
        <Questions />
        <PageWidth style={{ padding: 'var(--space-12) var(--page-gutter) 0' }}>
          <SectionHead label="四个岛群 · FOUR ISLAND GROUPS" title="领域" action="全部领域" onAction={() => onNav('domain')} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--grid-gap)' }}>
            {window.DOMAINS.map((d) => (
              <DomainCard key={d.id} name={d.name} latin={d.latin} summary={d.summary}
                concepts={d.concepts} courseCount={d.courseCount} noteCount={d.noteCount}
                href="#" onClick={(e) => { e.preventDefault(); onNav('domain'); }} />
            ))}
          </div>
        </PageWidth>
        <PageWidth style={{ padding: 'var(--space-12) var(--page-gutter) 0' }}>
          <SectionHead label="最近整理 · RECENTLY CHARTED" title="讲义" action="全部讲义" onAction={() => onNav('lecture')} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--grid-gap)' }}>
            {window.NOTES.slice(0, 3).map((n) => (
              <NoteCard key={n.id} title={n.title} summary={n.summary} course={n.course} lecture={n.lecture} readingTime={n.readingTime} concepts={n.concepts} updated={n.updated} href="#"
                onClick={(e) => { e.preventDefault(); onOpenNote(n.id); }} />
            ))}
          </div>
        </PageWidth>
        <PageWidth style={{ padding: 'var(--space-12) var(--page-gutter) 0' }}>
          <SectionHead label="正在读 · IN PROGRESS" title="课程" action="全部课程" onAction={() => onNav('domain')} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--grid-gap)' }}>
            {window.COURSES.slice(0, 2).map((c) => (
              <CourseCard key={c.id} title={c.title} code={c.code} institution={c.institution} summary={c.summary} domain={c.domain} noteCount={c.noteCount} conceptCount={c.conceptCount} progress={c.progress} href="#" onClick={(e) => { e.preventDefault(); onNav('domain'); }} />
            ))}
          </div>
        </PageWidth>
      </>
    );
  }

  Object.assign(window, { AtlasHome, SectionHead });

})();
