/* Wrapped in an IIFE: every text/babel script in this kit shares one top-level
   scope, so bare consts would collide across files. Exports go on window. */
(() => {
  const { Breadcrumb, Tabs, SidebarNav, CourseCard, NoteCard, Tag, Divider, Badge, Icon, Button } = window.ArchipelagoDesignSystem_958ced;

  function DomainScreen({ onNav, onOpenNote, onOpenConcept }) {
    const [tab, setTab] = React.useState('courses');
    const domain = window.DOMAINS[0];
    const courses = window.COURSES.filter((c) => c.domain === domain.name);
    const notes = window.NOTES.filter((n) => courses.some((c) => c.title === n.course));
    return (
      <PageWidth style={{ padding: 'var(--space-10) var(--page-gutter) 0' }}>
        <Breadcrumb items={[{ label: '海图', href: '#' }, { label: '领域', href: '#' }, { label: domain.name }]} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-12)', marginTop: 'var(--space-8)' }}>
          <div>
            <div style={{
              font: 'var(--type-label)', letterSpacing: 'var(--tracking-micro)', textTransform: 'uppercase',
              color: 'var(--text-accent)', marginBottom: 'var(--space-5)'
            }}>{domain.latin}</div>
            <h1 style={{ font: 'var(--type-h1)', color: 'var(--text-heading)', margin: 0 }}>{domain.name}</h1>
            <p style={{
              font: 'var(--type-lead)', color: 'var(--text-muted)',
              margin: 'var(--space-7) 0 0', maxWidth: 'var(--measure-lead)'
            }}>{domain.summary}</p>
            <div style={{
              display: 'flex', gap: 'var(--space-7)', marginTop: 'var(--space-8)',
              font: 'var(--type-meta)', color: 'var(--text-muted)'
            }}>
              <span>{domain.courseCount} 门课程</span><span style={{ color: 'var(--text-faint)' }}>·</span>
              <span>{domain.noteCount} 篇讲义</span><span style={{ color: 'var(--text-faint)' }}>·</span>
              <span>{domain.concepts.length * 9} 个概念</span>
            </div>
            <div style={{ marginTop: 'var(--space-10)' }}>
              <Tabs value={tab} onChange={setTab} items={[
                { value: 'courses', label: '课程', count: courses.length },
                { value: 'notes', label: '讲义', count: domain.noteCount },
                { value: 'concepts', label: '概念', count: 36 }
              ]} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--grid-gap)', marginTop: 'var(--space-9)' }}>
              {tab === 'courses' && courses.map((c) => (
                <CourseCard key={c.id} title={c.title} code={c.code} institution={c.institution} summary={c.summary} domain={c.domain} noteCount={c.noteCount} conceptCount={c.conceptCount} progress={c.progress} href="#" onClick={(e) => { e.preventDefault(); onNav('lecture'); }} />
              ))}
              {tab === 'notes' && notes.map((n) => (
                <NoteCard key={n.id} title={n.title} summary={n.summary} course={n.course} lecture={n.lecture} readingTime={n.readingTime} concepts={n.concepts} updated={n.updated} href="#" onClick={(e) => { e.preventDefault(); onOpenNote(n.id); }} />
              ))}
              {tab === 'concepts' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                  {['无知之幕', '原初状态', '分配正义', '自然状态', '消极自由', '积极自由', '持有正义', '自我所有', '公共理性', '重叠共识', '差别原则', '能力路径'].map((c) => (
                    <Tag key={c} href="#" onClick={(e) => { e.preventDefault(); onOpenConcept(c); }}>{c}</Tag>
                  ))}
                </div>
              )}
            </div>
          </div>
          <aside style={{ position: 'sticky', top: 'calc(var(--header-h) + var(--space-9))', alignSelf: 'start' }}>
            <div style={{
              font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase',
              color: 'var(--text-faint)', marginBottom: 'var(--space-6)'
            }}>岛群 · 其他领域</div>
            <SidebarNav active="pp" onSelect={() => {}} sections={[{
              items: window.DOMAINS.map((d) => ({ value: d.id, label: d.name, icon: 'map', count: d.courseCount }))
            }]} style={{ marginLeft: 'calc(var(--space-6) * -1)' }} />
            <hr style={{ border: 0, borderTop: '1px dashed var(--route-line)', margin: 'var(--space-9) 0' }} />
            <div style={{
              font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase',
              color: 'var(--text-faint)', marginBottom: 'var(--space-6)'
            }}>这片海域的地标</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              {domain.concepts.map((c) => (
                <Tag key={c} size="sm" href="#" onClick={(e) => { e.preventDefault(); onOpenConcept(c); }}>{c}</Tag>
              ))}
            </div>
          </aside>
        </div>
      </PageWidth>
    );
  }

  Object.assign(window, { DomainScreen });

})();
