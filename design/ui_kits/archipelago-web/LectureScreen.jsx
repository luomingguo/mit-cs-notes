/* Wrapped in an IIFE: every text/babel script in this kit shares one top-level
   scope, so bare consts would collide across files. Exports go on window. */
(() => {
  const { Breadcrumb, SidebarNav, TableOfContents, Callout, ConceptLink, BacklinkList, Tag, Badge, Button, IconButton, Divider, Tooltip, Icon, Card } = window.ArchipelagoDesignSystem_958ced;

  function Meta() {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-6)',
        font: 'var(--type-meta)', color: 'var(--text-muted)'
      }}>
        <Badge tone="ocean">第 3 讲</Badge>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-micro)' }}>ER 22 · Harvard</span>
        <span style={{ color: 'var(--text-faint)' }}>·</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="clock" size={12} color="var(--text-faint)" />约 12 分钟</span>
        <span style={{ color: 'var(--text-faint)' }}>·</span>
        <span>三天前更新</span>
      </div>
    );
  }

  function LectureScreen({ onOpenConcept, onLog }) {
    const [active, setActive] = React.useState('veil');
    const concept = (label, summary, source) => (
      <ConceptLink label={label} summary={summary} source={source} href="#"
        onClick={(e) => { e.preventDefault(); onOpenConcept(label); }} />
    );
    return (
      <PageWidth style={{ padding: 'var(--space-10) var(--page-gutter) 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'var(--rail-left) minmax(0,1fr) var(--rail-right)', gap: 'var(--space-11)' }}>

          <aside style={{ position: 'sticky', top: 'calc(var(--header-h) + var(--space-9))', alignSelf: 'start' }}>
            <div style={{
              font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase',
              color: 'var(--text-faint)', marginBottom: 'var(--space-6)', paddingLeft: 'var(--space-6)'
            }}>正义论导读</div>
            <SidebarNav active="veil" onSelect={() => {}} sections={[{ items: window.COURSE_LECTURES }]} />
            <hr style={{ border: 0, borderTop: '1px dashed var(--route-line)', margin: 'var(--space-9) var(--space-6)' }} />
            <div style={{ paddingLeft: 'var(--space-6)' }}>
              <Button variant="secondary" size="sm" icon="compass" onClick={onLog}>加入航海日志</Button>
            </div>
          </aside>

          <article>
            <Breadcrumb items={[
              { label: '政治哲学', href: '#' }, { label: '正义论导读', href: '#' }, { label: '无知之幕' }
            ]} />
            <h1 style={{ font: 'var(--type-h1)', color: 'var(--text-heading)', margin: 'var(--space-7) 0 var(--space-6)' }}>无知之幕</h1>
            <Meta />
            <hr style={{ border: 0, height: 1, background: 'linear-gradient(90deg,var(--rule-gold),transparent 82%)', margin: 'var(--space-8) 0 var(--space-8)' }} />
            <p style={{
              font: 'var(--fw-regular) var(--fs-lead)/1.75 var(--font-serif)', color: 'var(--text-body)',
              margin: 0, maxWidth: 'var(--measure-lead)'
            }}>这篇讲义梳理罗尔斯的「无知之幕」，以及它为什么不是一个思想实验的终点。</p>

            <div style={{ margin: 'var(--space-9) 0' }}>
              <Callout kind="prereq">先读<ConceptLink label="社会契约的三种版本" href="#" summary="霍布斯、洛克、卢梭：同一个装置，三种不同的出发点。" source="正义论导读 · 第 2 讲">《社会契约的三种版本》</ConceptLink>，这一讲默认你已经接受了契约论的提问方式。</Callout>
            </div>

            <div className="ap-prose" style={{ maxWidth: 'var(--measure-prose)' }}>
              <h2 id="setup">问题的设置</h2>
              <p>功利主义把正义交给一个加总：只要总量最大，分配方式可以再谈。罗尔斯不接受这个让步，于是他需要一个新的出发点——一个能让人在不知道自己是谁的情况下，仍然愿意签字的程序。</p>
              <h3 id="veil">无知之幕是什么</h3>
              <p>{concept('无知之幕', '一个用于剥离个人处境的思想装置，而不是一个结论。', '正义论导读 · 第 3 讲')}并不是让人变成空白。幕后的人知道社会的一般事实：经济学、心理学、稀缺。他们唯独不知道自己会落在哪里——性别、阶层、天赋、乃至对好生活的具体想法。</p>
              <p>这层遮蔽做的是一次视角的置换：问题从「我想要什么」变成「任何人都能接受什么」。它把偏私剥掉的方式，不是要求人变得高尚，而是让偏私失去可用的信息。</p>
              <blockquote>正义的原则应当在一种没人能为自己量身定做的处境中被选出。</blockquote>
              <h3 id="orig">原初状态里的人</h3>
              <p>{concept('原初状态', '幕后的选择处境：一般知识充分，个人信息为零。', '正义论导读 · 第 3 讲')}中的立约者是理性且互不关心的：他们不嫉妒，也不利他，只想让自己（无论最后是谁）过得不算差。这个设定后来被大量批评，也被大量借用——{concept('博弈论', '当结果取决于别人怎么选，理性本身就变成了一个结构问题。', '博弈论 · 第 4 讲')}那边会把它读成一种极端的风险态度。</p>
              <h2 id="why">为什么需要这层遮蔽</h2>
              <p>如果允许立约者知道自己的位置，任何原则都会退化成一次谈判：强者要求更少的再分配，弱者要求更多。遮蔽的作用不是产生共识，而是让共识变得有意义——它排除了「因为我恰好是我」这个理由。</p>
              <h2 id="crit">两种反驳</h2>
              <p>第一种来自{concept('持有正义', '正义不在于结果的分布，而在于取得过程是否正当。', '正义论导读 · 第 5 讲')}：诺齐克认为「分配」这个提法本身已经假定了有一个可供分配的总量。第二种来自社群主义：幕后那个不知道自己看重什么的人，是否还算一个人？</p>
            </div>

            <div style={{ margin: 'var(--space-10) 0 0' }}>
              <Callout kind="next">接下来可以读<ConceptLink label="诺齐克的反驳" href="#" summary="持有正义论如何把「分配」这个提法本身当成问题。" source="正义论导读 · 第 5 讲">诺齐克的反驳</ConceptLink>，或者跳到分配正义的经济学一侧。</Callout>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-9)' }}>
              <Button variant="secondary" icon="arrow-left">第 2 讲 · 契约论的复活</Button>
              <Button iconRight="arrow-right">第 4 讲 · 两个正义原则</Button>
            </div>

            <hr style={{ border: 0, borderTop: '1px dashed var(--route-line)', margin: 'var(--space-11) 0 var(--space-9)' }} />
            <BacklinkList items={window.BACKLINKS} />
          </article>

          <aside style={{ position: 'sticky', top: 'calc(var(--header-h) + var(--space-9))', alignSelf: 'start' }}>
            <TableOfContents items={window.LECTURE_TOC} active={active} onSelect={setActive} />
            <hr style={{ border: 0, borderTop: '1px dashed var(--route-line)', margin: 'var(--space-9) 0' }} />
            <div style={{
              font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase',
              color: 'var(--text-faint)', marginBottom: 'var(--space-6)'
            }}>本页概念</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              {['无知之幕', '原初状态', '持有正义', '分配正义'].map((c) => (
                <Tag key={c} size="sm" href="#" onClick={(e) => { e.preventDefault(); onOpenConcept(c); }}>{c}</Tag>
              ))}
            </div>
            <hr style={{ border: 0, borderTop: '1px dashed var(--route-line)', margin: 'var(--space-9) 0' }} />
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <Tooltip content="复制链接"><IconButton icon="link" label="复制链接" variant="outline" size="sm" /></Tooltip>
              <Tooltip content="原课程页"><IconButton icon="external-link" label="原课程页" variant="outline" size="sm" /></Tooltip>
              <Tooltip content="加入日志"><IconButton icon="compass" label="加入日志" variant="outline" size="sm" onClick={onLog} /></Tooltip>
            </div>
          </aside>
        </div>
      </PageWidth>
    );
  }

  Object.assign(window, { LectureScreen });

})();
