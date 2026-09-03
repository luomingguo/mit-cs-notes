/* Wrapped in an IIFE: every text/babel script in this kit shares one top-level
   scope, so bare consts would collide across files. Exports go on window. */
(() => {
  const { Input, Badge, Tag, Icon, Divider } = window.ArchipelagoDesignSystem_958ced;

  const GROUPS = [
    { label: '讲义', icon: 'file-text', items: [['无知之幕', '正义论导读 · 第 3 讲'], ['诺齐克的反驳', '正义论导读 · 第 5 讲'], ['摊还分析', '算法导论 · 第 7 讲']] },
    { label: '概念', icon: 'tower-control', items: [['原初状态', '政治哲学 · 被引用 7 次'], ['分配正义', '政治哲学 · 被引用 14 次']] },
    { label: '课程', icon: 'book-open', items: [['正义论导读', 'Harvard ER 22 · 12 篇讲义'], ['博弈论', 'Yale ECON 159 · 16 篇讲义']] }
  ];

  function SearchOverlay({ open, onClose, onPick }) {
    const [q, setQ] = React.useState('无知');
    if (!open) return null;
    return (
      <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{
        position: 'fixed', inset: 0, zIndex: 70, background: 'var(--surface-scrim)',
        display: 'flex', justifyContent: 'center', paddingTop: '12vh'
      }}>
        <div style={{
          width: 620, maxHeight: '70vh', overflow: 'auto',
          background: 'var(--surface-raised)', border: '1px solid var(--border-hairline)',
          borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-3)'
        }}>
          <div style={{ padding: 'var(--space-7) var(--space-7) var(--space-6)', borderBottom: '1px solid var(--border-hairline)' }}>
            <Input icon="search" value={q} onChange={(e) => setQ(e.target.value)} autoFocus
              placeholder="搜索讲义、概念、课程" suffix="ESC 关闭" size="lg" />
          </div>
          <div style={{ padding: 'var(--space-6) 0 var(--space-7)' }}>
            {GROUPS.map((g) => (
              <div key={g.label} style={{ marginBottom: 'var(--space-7)' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                  padding: '0 var(--space-7)', marginBottom: 'var(--space-4)',
                  font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase',
                  color: 'var(--text-faint)'
                }}>
                  <Icon name={g.icon} size={12} />{g.label}
                </div>
                {g.items.map(([title, meta]) => (
                  <Row key={title} title={title} meta={meta} onPick={onPick} />
                ))}
              </div>
            ))}
            <div style={{
              padding: 'var(--space-5) var(--space-7) 0', borderTop: '1px dashed var(--route-line)',
              display: 'flex', gap: 'var(--space-7)', font: 'var(--type-meta)', fontSize: 'var(--fs-micro)', color: 'var(--text-faint)'
            }}>
              <span><span style={{ fontFamily: 'var(--font-mono)' }}>↑↓</span> 移动</span>
              <span><span style={{ fontFamily: 'var(--font-mono)' }}>↵</span> 打开</span>
              <span><span style={{ fontFamily: 'var(--font-mono)' }}>⌘K</span> 呼出</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function Row({ title, meta, onPick }) {
    const [hover, setHover] = React.useState(false);
    return (
      <a href="#" onClick={(e) => { e.preventDefault(); onPick(title); }}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{
          display: 'flex', alignItems: 'baseline', gap: 'var(--space-6)',
          padding: '9px var(--space-7)', textDecoration: 'none',
          background: hover ? 'var(--surface-ghost-hover)' : 'transparent',
          boxShadow: hover ? 'inset 2px 0 0 var(--accent)' : 'none',
          transition: 'var(--transition-control)'
        }}>
        <span style={{ font: 'var(--fw-medium) var(--fs-body-sm)/1.5 var(--font-display)', color: 'var(--text-heading)' }}>{title}</span>
        <span style={{ font: 'var(--type-meta)', fontSize: 'var(--fs-micro)', color: 'var(--text-faint)' }}>{meta}</span>
      </a>
    );
  }

  Object.assign(window, { SearchOverlay });

})();
