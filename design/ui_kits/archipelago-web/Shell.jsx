/* Wrapped in an IIFE: every text/babel script in this kit shares one top-level
   scope, so bare consts would collide across files. Exports go on window. */
(() => {
  const { Logo, IconButton, Tooltip, Input, Divider } = window.ArchipelagoDesignSystem_958ced;

  const NAV = [
    { id: 'home', label: '海图' },
    { id: 'domain', label: '领域' },
    { id: 'lecture', label: '讲义' },
    { id: 'concept', label: '概念' }
  ];

  function Header({ view, onNav, onSearch }) {
    return (
      <header style={{
        position: 'sticky', top: 0, zIndex: 30, height: 'var(--header-h)',
        background: 'var(--surface-page)', borderBottom: '1px solid var(--border-hairline)'
      }}>
        <div style={{
          maxWidth: 'var(--page-max)', margin: '0 auto', height: '100%',
          padding: '0 var(--page-gutter)', display: 'flex', alignItems: 'center', gap: 'var(--space-10)'
        }}>
          <a href="#" onClick={(e) => { e.preventDefault(); onNav('home'); }} style={{ textDecoration: 'none' }}>
            <Logo src="../../assets/logo-archipelago-badge-256.png" size={34} showCn={false} />
          </a>
          <nav style={{ display: 'flex', gap: 'var(--space-8)', flex: 1 }}>
            {NAV.map((n) => {
              const on = view === n.id;
              return (
                <a key={n.id} href="#" onClick={(e) => { e.preventDefault(); onNav(n.id); }}
                  style={{
                    textDecoration: 'none', paddingBottom: 2,
                    borderBottom: '2px solid ' + (on ? 'var(--accent)' : 'transparent'),
                    font: (on ? 'var(--fw-medium) ' : 'var(--fw-regular) ') + 'var(--fs-body-sm)/1.4 var(--font-sans)',
                    color: on ? 'var(--text-heading)' : 'var(--text-muted)'
                  }}>{n.label}</a>
              );
            })}
          </nav>
          <div onClick={onSearch} style={{ width: 232, cursor: 'pointer' }}>
            <Input icon="search" placeholder="搜索讲义、概念、课程" suffix="⌘K" size="sm" readOnly style={{ cursor: 'pointer' }} />
          </div>
          <Tooltip content="航海日志"><IconButton icon="compass" label="航海日志" /></Tooltip>
        </div>
      </header>
    );
  }

  function Footer() {
    return (
      <footer data-theme="deep" style={{
        marginTop: 'var(--space-13)', background: 'var(--gradient-abyss)',
        backgroundImage: 'var(--gradient-abyss), var(--texture-chart)', padding: 'var(--space-12) 0 var(--space-11)'
      }}>
        <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '0 var(--page-gutter)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-11)', flexWrap: 'wrap' }}>
            <div style={{ maxWidth: '28em' }}>
              <Logo src="../../assets/logo-archipelago-badge-256.png" size={44} tone="inverse" />
              <p style={{
                font: 'var(--fw-regular) var(--fs-body-sm)/1.85 var(--font-serif)',
                color: 'var(--text-inverse-muted)', margin: 'var(--space-7) 0 0'
              }}>不同学科是各自独立的岛屿，内部链接和知识关系则是连接它们的航线。</p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-12)' }}>
              {[['航行', ['全部领域', '全部课程', '概念索引']], ['关于', ['这个项目', '如何记笔记', '订阅更新']]].map(([title, items]) => (
                <div key={title}>
                  <div style={{
                    font: 'var(--type-label)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase',
                    color: 'var(--gold-400)', marginBottom: 'var(--space-6)'
                  }}>{title}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {items.map((i) => (
                      <a key={i} href="#" style={{
                        font: 'var(--type-meta)', color: 'var(--ocean-300)', textDecoration: 'none'
                      }}>{i}</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{
            marginTop: 'var(--space-11)', paddingTop: 'var(--space-6)',
            borderTop: '1px dashed var(--route-line-inverse)',
            display: 'flex', justifyContent: 'space-between',
            font: 'var(--type-meta)', fontSize: 'var(--fs-micro)', color: 'var(--text-faint)'
          }}>
            <span>Archipelago 群岛 · 公开课笔记</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>154 篇讲义 · 11 门课程 · 4 个领域</span>
          </div>
        </div>
      </footer>
    );
  }

  function Shell({ view, onNav, onSearch, children }) {
    return (
      <div style={{ minHeight: '100%', background: 'var(--surface-page)', backgroundImage: 'var(--texture-paper)' }}>
        <Header view={view} onNav={onNav} onSearch={onSearch} />
        <main>{children}</main>
        <Footer />
      </div>
    );
  }

  function PageWidth({ children, style }) {
    return (
      <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '0 var(--page-gutter)', ...style }}>{children}</div>
    );
  }

  Object.assign(window, { Shell, Header, Footer, PageWidth });

})();
