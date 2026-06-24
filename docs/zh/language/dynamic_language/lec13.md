# L13：垃圾回收 II（GC II）——标记-清扫与复制式回收

> 接 L12。展开 Mark-and-Sweep 的实现，引入**复制式回收 (copying collector)**、转发地址、语义垃圾与权衡

---

## 1. 标记-清扫（Mark and Sweep）

回顾：引用计数对**环**失效。Mark-and-Sweep 直接处理可达性——**标记**阶段从根集遍历所有可达对象，**清扫**阶段回收所有未标记（不可达）对象。

### 1.1 标记阶段（Mark）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（根集 Root Set）</strong>
标记的起点。在 MITScript（如多数脚本语言）里，<strong>根集就是当前的帧栈（所有栈帧）</strong>，外加其他全局指针（如全局 <code>None</code>）。从根集出发，沿对象内指针做可达闭包遍历。
</div>

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（标记必须跟随每一个指针）</strong>
遍历时务必跟随所有指针：操作数栈 → 值、局部变量 → 值、记录 → 值（字段）、帧的父指针 p、闭包捕获的帧等。注意：<strong>记录等对象常由多个小对象组成</strong>（如哈希表由多个小块构成）——遍历时<strong>只需访问/标记主对象</strong>，但<strong>回收时必须把其所有从属小对象一并释放</strong>。
</div>

### 1.2 清扫阶段（Sweep）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（清扫与"如何找到不可达对象"）</strong>
目标：释放一切不可达对象。但不可达对象正因为"无人指向"而难以枚举，两种办法：
<ol>
<li>维护一个<strong>"所有曾分配对象"的链表</strong>，清扫时遍历该表，释放未标记者；</li>
<li>用便于枚举的方式分配对象（见复制式回收）。</li>
</ol>
清扫后清除所有标记位，供下次 GC 使用。
</div>

### 1.3 优化：侵入式头部（Intrusive Header）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（用对象头里的 next 指针替代独立链表）</strong>
不必为"分配链表"维护与对象分离的结构。像引用计数加 count 头那样，给每个对象加一个<strong>头部 + <code>next</code> 指针</strong>，把所有对象串成侵入式链表。好处：可一次性释放整个节点；<strong>把 GC 的内存开销减半</strong>（无需独立的链表节点）。
</div>

---

## 2. 复制式回收（Copying Collector）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（半空间复制式回收）</strong>
把堆分成两个区域 A、B（半空间 semispaces）：
<ol>
<li>先把对象<strong>紧凑地 (tightly packed)</strong> 分配进 A（紧凑分配免去追踪空闲块的开销，分配只需移动一个指针）；</li>
<li>当 A 满，遍历所有<strong>可达</strong>对象，把它们<strong>复制到 B</strong>；遍历时把指向旧对象的指针改为指向其在 B 中的<strong>副本 (twin)</strong>；</li>
<li><strong>整体一次性释放 A</strong>；</li>
<li>交换 A、B 角色，重复。</li>
</ol>
</div>

> 优点：分配极快（指针碰撞 bump pointer）；复制时顺带**压紧 (compaction)**，改善缓存局部性；不可达对象"免费"消失（不复制即可）。缺点：只有一半内存可用；复制本身可能昂贵。

### 2.1 对象重定位问题（Object Relocation）

复制的核心难题：对象从旧址移到新址后，**所有指向旧对象的指针都要更新**。两种思路：

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（思路一：间接表 Indirection）</strong>
把指针都换成"间接表的索引"；对象移动时只改表中一处。问题：① 运行期开销高（每次解引用多一跳）；② 削弱复制式回收的局部性优势；③ 间接表本身又要做资源管理。
</div>

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（思路二：转发地址 Forwarding Address）</strong>
复制一个对象到新区后，在<strong>旧位置原地留下一个"转发地址"</strong>指向新副本。遍历中再遇到指向该旧对象的指针时，<strong>跟随转发地址</strong>得到新址并更新该指针。这样每个对象只复制一次，且无需全局间接表。
</div>

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（转发地址的工作过程）</strong>
旧区有 A、B、C，A 与 C 都含"指向 B"的指针。复制时：
<pre>
1) 复制 B 到新区得 B'，在旧 B 处写下"转发到 B'";
2) 处理 A 中"指向 B"的指针 → 跟随旧 B 的转发地址 → 改为指向 B';
3) 处理 C 中"指向 B"的指针 → 同样跟随转发地址 → 指向 B'。
</pre>
B 只被复制一次，A、C 的指针都正确重定向到 B'。
</div>

---

## 3. 标记不是精确的：语义垃圾（Semantic Garbage）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（可达性 ≠ "将来会用"）</strong>
理想目标是"回收一切将来绝不再用的内存"，但 GC 只能近似为"回收不可达内存"，<strong>并不精确</strong>。存在<strong>语义垃圾 (semantic garbage)</strong>：仍然<strong>可达</strong>、但程序<strong>实际上再也不会用</strong>的对象——GC 无法回收它们。
</div>

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（语义垃圾）</strong>
程序在初始化时把一个大数据结构存进全局变量、用于启动；启动后<strong>再也不碰它</strong>。该数据仍从全局根可达，故不会被回收——但它就是垃圾。要验证"程序此后绝不再访问它"通常是不可判定/极难的，所以 GC 选择保守保留。
</div>

---

## 4. 各方案的权衡（Tradeoffs）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（GC 方案权衡）</strong>
<ul>
<li><strong>引用计数</strong>：开销高，但<strong>分摊</strong>在整个执行过程中（无明显停顿）；不处理环。</li>
<li><strong>标记-清扫 / 复制式</strong>：总开销更低，但<strong>集中爆发</strong>，可能造成可察觉的应用停顿 (stalls)。</li>
<li><strong>复制式</strong>：分配极快、压紧改善缓存局部性，但复制对象可能很昂贵，且浪费一半空间。</li>
</ul>
</div>

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（GC 设计的三个关键维度）</strong>
<ul>
<li><strong>运行期开销</strong>：GC 给正常程序执行增加的成本；</li>
<li><strong>空间效率</strong>：GC 需要多少额外空间？回收对象有多快？</li>
<li><strong>GC 延迟</strong>：能否避免长时间停顿？</li>
</ul>
三者相互权衡，没有"万能最优"，依应用场景（吞吐 vs. 延迟 vs. 内存）取舍。
</div>

---

## 5. 本讲小结

- Mark-Sweep：根集（MITScript 即帧栈 + 全局指针）→ 标记可达（跟随每个指针，记录只标主对象但回收其全部从属小对象）→ 清扫（遍历分配链表释放未标记者）；侵入式 next 头部可省独立链表、内存开销减半。
- 复制式回收：双半空间，紧凑分配；满则把可达对象复制到另一半并重定向指针、整体释放旧半、交换。
- 重定位用**转发地址**（旧址留指向新副本的转发指针，遇旧指针即跟随更新）优于全局间接表。
- 标记不精确：**语义垃圾**（可达但永不再用）无法回收。
- 权衡：引用计数开销分摊但不处理环；标记/复制开销集中可致停顿；复制分配快、局部性好但费空间。三维度：运行期开销 / 空间效率 / 延迟。
