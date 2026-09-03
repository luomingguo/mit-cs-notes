/* Wrapped in an IIFE: every text/babel script in this kit shares one top-level
   scope, so bare consts would collide across files. Exports go on window. */
(() => {
  const { Breadcrumb, Card, Tag, Badge, BacklinkList, NoteCard, Divider, Button, Icon, ConceptLink } = window.ArchipelagoDesignSystem_958ced;

  function ConceptScreen({ label, onOpenNote }) {
    const name = label || '无知之幕';
    return (
      <PageWidth style={{ padding: 'var(--space-10) var(--page-gutter) 0' }}>
        <Breadcrumb items={[{ label: '海图', href: '#' }, { label: '概念', href: '#' }, { label: name }]} />
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 'var(--space-12)', marginTop: 'var(--space-8)' }}>
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
              font: 'var(--type-label)', letterSpacing: 'var(--tracking-micro)', textTransform: 'uppercase',
              color: 'var(--text-accent)', marginBottom: 'var(--space-5)'
            }}>
              <Icon name="tower-control" size={13} />概念 · 地标
            </div>
            <h1 style={{ font: 'var(--type-h1)', color: 'var(--text-heading)', margin: 0 }}>{name}</h1>
            <p style={{
              font: 'var(--type-lead)', color: 'var(--text-body)',
              margin: 'var(--space-7) 0 0', maxWidth: 'var(--measure-lead)'
            }}>一个用于剥离个人处境的思想装置：幕后的人知道社会的一般事实，却不知道自己会是谁。</p>

            <hr style={{ border: 0, height: 1, background: 'linear-gradient(90deg,var(--rule-gold),transparent 82%)', margin: 'var(--space-9) 0' }} />

            <div className="ap-prose" style={{ maxWidth: 'var(--measure-prose)' }}>
              <p>这个概念出现在三门课里，但用法并不相同。在政治哲学里它是一个正当化程序；在博弈论里它被读作一种风险态度；在经济学的分配讨论中，它常常被简化成「代表性个体」。</p>
              <p>如果只记一句话：它排除的不是欲望，而是<strong style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--text-heading)' }}>「因为我恰好是我」</strong>这个理由。</p>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-5)',
              margin: 'var(--space-10) 0 var(--space-7)'
            }}>
              <span style={{
                font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase',
                color: 'var(--text-muted)'
              }}>出现在</span>
              <span style={{ flex: 1, borderTop: '1px dashed var(--route-line)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-micro)', color: 'var(--text-faint)' }}>3</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--grid-gap)' }}>
              {window.NOTES.slice(0, 2).map((n) => (
                <NoteCard key={n.id} title={n.title} summary={n.summary} course={n.course} lecture={n.lecture} readingTime={n.readingTime} concepts={n.concepts} updated={n.updated} href="#" onClick={(e) => { e.preventDefault(); onOpenNote(n.id); }} />
              ))}
            </div>

            <hr style={{ border: 0, borderTop: '1px dashed var(--route-line)', margin: 'var(--space-11) 0 var(--space-9)' }} />
            <BacklinkList items={window.BACKLINKS} />
          </div>

          <aside style={{ position: 'sticky', top: 'calc(var(--header-h) + var(--space-9))', alignSelf: 'start' }}>
            <Card padding="md">
              <div style={{
                font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase',
                color: 'var(--text-faint)', marginBottom: 'var(--space-5)'
              }}>坐标</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', font: 'var(--type-meta)', color: 'var(--text-body)' }}>
                {[['领域', '政治哲学'], ['首次出现', '正义论导读 · 第 3 讲'], ['被引用', '11 次'], ['相邻概念', '4 个']].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-6)' }}>
                    <span style={{ color: 'var(--text-faint)' }}>{k}</span><span>{v}</span>
                  </div>
                ))}
              </div>
            </Card>
            <div style={{ marginTop: 'var(--space-9)' }}>
              <div style={{
                font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase',
                color: 'var(--text-faint)', marginBottom: 'var(--space-6)'
              }}>相邻地标</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                {['原初状态', '差别原则', '持有正义', '重叠共识'].map((c) => <Tag key={c} size="sm" href="#">{c}</Tag>)}
              </div>
            </div>
          </aside>
        </div>
      </PageWidth>
    );
  }

  Object.assign(window, { ConceptScreen });

})();
