# L14：垃圾回收 III（GC III）——分代与增量回收

> 接 L13。用**分代回收**降低回收成本、用**增量回收**降低停顿，并比较各方案、看实践

---

## 1. GC 的五个权衡维度（汇总）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（评价 GC 的五维）</strong>
<ul>
<li><strong>可达性 (Reachability)</strong>：精确还是近似（处理环否）；</li>
<li><strong>运行期开销 (Runtime overhead)</strong>：GC 给正常执行增加的成本；</li>
<li><strong>空间效率 (Space efficiency)</strong>：需要多少额外空间；</li>
<li><strong>回收效率 (Reclamation efficiency)</strong>：回收每个对象多贵 / 多快；</li>
<li><strong>GC 延迟 (Latency)</strong>：能否避免长停顿。</li>
</ul>
</div>

三种基础方案对照：

| 方案 | 可达性 | 运行期开销 | 空间 | 回收效率 | 延迟 |
|------|--------|-----------|------|----------|------|
| 引用计数 | 近似（漏环） | 每次指针更新都有开销 | 每对象一个计数 | 计数归零即刻回收 | **无停顿** |
| 标记-清扫 | 精确 | 仅分配时（加入链表） | 标记位 + next 指针 | 单对象低，但需扫遍全部已分配对象 | 可能长停顿 |
| 复制式 | 精确（配合标记） | 仅分配时；分配极快（指针碰撞），压紧改善局部性 | 标记位；但相当于砍半可用空间 | 批量删除；但复制对象可能贵（复制可与标记融合，免重扫） | 可能长停顿 |

---

## 2. 分代回收（Generational Collectors）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（弱分代假设与分代堆）</strong>
洞察（<strong>弱分代假设</strong>）：多数应用有<strong>大量极短命对象</strong>与<strong>少量极长寿对象</strong>。据此把堆按"代 (generation)"分区：
<ul>
<li><strong>新生代 (young heap)</strong>：存短命对象，<strong>频繁</strong>回收，保持较小；</li>
<li><strong>老年代 (old heap)</strong>：在新生代中<strong>历经多轮 GC 仍存活</strong>的对象被<strong>晋升</strong>至此，<strong>很少</strong>回收。</li>
</ul>
（可有多于两代。）
</div>

> 为何高效：新生代小，回收快；绝大多数短命对象（如小函数的栈帧、算术中间值）很快死亡、根本不必复制；老年代虽大但极少被遍历/复制。

### 2.1 关键问题：跨代指针（Cross-Generation Pointers）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（老→新指针必须纳入根集）</strong>
回收新生代时，我们<strong>不想遍历整个老年代</strong>（否则失去"小范围快回收"的意义）。但老年代对象可能指向新生代对象——这些<strong>从老年代指向新生代的指针，必须被当作根集的一部分</strong>，否则会漏标仍可达的新生代对象。
</div>

实现上用**写屏障 (write barrier)** 记录这类跨代指针（见下节，亦称 remembered set）。**完整回收 (full collection)** 时则像一次（带额外步骤的）标记-清扫，遍历整堆。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（分代回收的权衡）</strong>
<ul>
<li><strong>可达性</strong>：完整回收精确；仅新生代回收不精确（依赖跨代指针记录）。</li>
<li><strong>运行期开销</strong>：需检查是否创建了"指入新生代"的指针；比引用计数略好（只需查指针、不必读旧被指对象）。</li>
<li><strong>空间效率</strong>：可用整个堆，开销主要是根集/记录集；若不触发完整回收，可能残留少量垃圾。</li>
<li><strong>回收效率</strong>：新生代回收比纯复制式更高效（复制更少）；完整回收类似标记-清扫，但理想情况下不必常做。</li>
<li><strong>延迟</strong>：新生代回收远好于整堆复制；完整扫描仍是 mark-and-sweep 级别。</li>
</ul>
</div>

---

## 3. 增量回收（Incremental Collection）——降低延迟

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（增量回收）</strong>
为避免 GC 的长停顿，把 GC 的执行与<strong>变更器 (mutator，即用户程序)</strong> 的执行<strong>交错 (interleave)</strong> 进行。
</div>

### 3.1 三色（对象阶段）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（对象的三个标记阶段，即三色标记）</strong>
<ul>
<li><strong>unreached（白）</strong>：尚未被标记到达；</li>
<li><strong>unscanned（灰）</strong>：已到达，但其引用尚未全部跟随完；</li>
<li><strong>scanned（黑）</strong>：已处理完毕。</li>
</ul>
若 mutator 要与回收交错运行，它必须感知所修改对象的当前阶段。
</div>

### 3.2 危险情形与写屏障

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（增量回收的漏标 bug）</strong>
GC 标记进行到一半时，mutator 插一脚：
<pre>
1) 把一个指针从【scanned(黑)】对象 → 【unreached(白)】对象（新建）；
2) 同时删除【unscanned(灰)】对象到该白对象的原有指针。
</pre>
结果：GC 以为黑对象已扫完（不会再看它的新指针），而通往白对象的唯一灰路径又被删了 → <strong>GC 认为全部扫描完毕，但其实有个可达对象被漏标</strong> → 被错误回收（悬垂指针！）。
</div>

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（写屏障 Write Barrier）</strong>
解法：给 mutator 装一个<strong>写屏障</strong>——在<strong>每次写指针时</strong>运行的检查。当检测到"从 scanned 对象指向 unscanned/unreached 对象"的新引用时，把被指对象加入<strong>待扫描列表</strong>。代价：增加运行期开销，换取更低的 GC 延迟。
</div>

---

## 4. 完整的权衡视角与实践

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（各技术对应的改进维度）</strong>
<ul>
<li><strong>完整性（环）</strong>：引用计数 vs. 标记（标记处理环）；</li>
<li><strong>空间效率</strong>：减少/消除"已分配对象链表"（侵入式头部、复制式）；</li>
<li><strong>回收效率</strong>：分代回收把搜索大多限制在小空间；</li>
<li><strong>延迟</strong>：分代（多数时间只扫小空间）+ 增量（把开销分散到整个运行期）。</li>
</ul>
</div>

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（GC 在实践中）</strong>
<ul>
<li><strong>C++</strong>：通过 <code>shared_ptr</code> 库（引用计数）。</li>
<li><strong>Objective-C / Swift</strong>：引用计数（ARC）。</li>
<li><strong>Python</strong>：引用计数 + 可选的分代回收器（处理环）。</li>
<li><strong>Java 11</strong>：多种分代回收器——Serial（单线程）、Parallel/吞吐量（多线程加速）、CMS 与 G1（大多并发，与应用并行做昂贵工作）。</li>
</ul>
延伸阅读：Jones & Lins《Garbage Collection》；Jones, Hosking, Moss《The Garbage Collection Handbook》。
</div>

---

## 5. 本讲小结

- 评价 GC 看五维：可达性精确性、运行期开销、空间、回收效率、延迟；引用计数/标记-清扫/复制式各有取舍。
- **分代回收**基于"多数对象短命"：新生代小而频繁回收、老年代大而少回收，存活者晋升；新生代回收须把**老→新指针纳入根集**（写屏障记录）。
- **增量回收**交错 GC 与 mutator 以降延迟；三色（unreached/unscanned/scanned）；mutator 可能"黑→白 + 删灰路径"造成漏标，用**写屏障**把新指针的被指对象补入待扫描列表。
- 实践：C++ shared_ptr、Swift 引用计数、Python 引用计数 + 分代、Java 多种分代/并发回收器。
- 至此 Phase 3（GC）完结；下一单元进入底层虚拟机与代码生成（L15 起）。
