# L-09 推测执行

> MIT 6.5900 [6.823] Computer System Architecture · Fall 2024
> 主题:推测执行配方、值管理(贪婪/惰性)、误推测恢复、重命名表快照、统一物理寄存器堆、物理寄存器生命周期

---

## 0. 本讲主线

把分支预测落到执行层:**推测执行 (*speculative execution*)** 的统一框架是"预测前进 → 同时维护新旧值 → 检查后取舍"。本讲用**值管理**视角(贪婪 vs 惰性)统一看待 PC、寄存器、重命名表、分支预测器,并完成现代乱序核——**统一物理寄存器堆 + 物理寄存器管理**。

---

## 1. 推测执行配方 (*Speculative Execution Recipe*)

<div style="border-left:4px solid #4a90d9; background:#eaf2fb; padding:8px 14px; margin:10px 0;">
<strong>三步配方</strong>
<ol>
<li>用对某个架构/微架构值的<strong>预测</strong>,在依赖未解析时继续前进。</li>
<li>在更新架构(常含微架构)状态时<strong>同时保留新旧两份值</strong>。</li>
<li>检查后二选一:<br>
&nbsp;&nbsp;• 误推测:丢弃所有新值、恢复旧值、从误推测点之前重执行;<br>
&nbsp;&nbsp;• 确认无误且旧值不再被用:丢弃旧值,只用新值。</li>
</ol>
为何会用到旧值?——乱序中的 WAR 冒险。
</div>

<div style="border-left:4px solid #4a90d9; background:#eaf2fb; padding:8px 14px; margin:10px 0;">
<strong>定义:两种值管理策略</strong>
<ul>
<li><strong>贪婪/即时更新 (<em>Greedy / Eager</em>)</strong>:就地更新值,另存一份旧值日志 (log) 以备恢复。</li>
<li><strong>惰性更新 (<em>Lazy</em>)</strong>:缓冲新值、保留旧值原位,直到 commit 才替换。</li>
</ul>
保留旧值原位的理由:新值很少被用、便于在新值产生后仍用旧值、简化恢复。
</div>

---

## 2. 用值管理视角统一看各种状态

<div style="border-left:4px solid #3fa34d; background:#eafbe9; padding:8px 14px; margin:10px 0;">
<strong>五级顺序流水的异常处理</strong>
<ul>
<li><strong>PC:贪婪</strong>(立即更新)——"日志"就是流水线中的 PC 锁存器链。</li>
<li><strong>寄存器:惰性</strong>(到 commit 才更新)——"新值"在执行流水里。</li>
</ul>
</div>

<div style="border-left:4px solid #3fa34d; background:#eafbe9; padding:8px 14px; margin:10px 0;">
<strong>分支预测器本身也是推测的微架构状态</strong>
<ul>
<li><strong>1-bit / 2-bit 计数器</strong>:惰性。</li>
<li><strong>全局历史 / 局部历史</strong>:贪婪(推测更新,错时恢复)。</li>
</ul>
</div>

**误推测恢复**:顺序执行机器靠"把值留在流水里"保证分支后发射的指令在分支解析前不写回,错则 kill 分支之后的全部值。乱序则更复杂——异常/分支后多条指令可能在解析前就产生了新值。

---

## 3. ROB 的恢复与重命名表快照

数据驱动执行(Tomasulo)基本操作:为每个源填入 tag 或已知数据 → 数据就绪时用数据替换 tag → 所有源就绪时发射 → 完成时存目的数据。**更新策略:执行时贪婪。**

**Data-in-ROB 的惰性化**:在模板加 `<pd, dest, data, cause>`,按程序序提交;异常时 `ptr1=ptr2` 清空 ROB(store 必须等 commit 才写内存)。寄存器更新策略变为**惰性**;提交前的值通过**搜索 ROB 的 dest 字段**找到。

<div style="border-left:4px solid #4a90d9; background:#eaf2fb; padding:8px 14px; margin:10px 0;">
<strong>重命名表 (<em>Rename Table</em>) 的值管理</strong><br>
重命名表是加速 tag 查找的<strong>推测微架构缓存</strong>,更新策略为<strong>贪婪</strong>。引发误推测的事件:<strong>异常与分支预测错误</strong>。响应方式:清空 valid 位;清空后须等流水<strong>排空 (drain)</strong> 才能再向 ROB 加指令。
</div>

<div style="border-left:4px solid #4a90d9; background:#eaf2fb; padding:8px 14px; margin:10px 0;">
<strong>定义:映射表快照 (<em>Rename Snapshots</em>)</strong><br>
在<strong>每个预测分支处对寄存器重命名表拍快照</strong>;分支预测错误时恢复到对应的较早快照。这是对微架构状态的<strong>贪婪</strong>式推测值管理——无需排空即可快速回滚。
</div>

---

## 4. 统一物理寄存器堆 (*Unified Physical Register File*)

<div style="border-left:4px solid #4a90d9; background:#eaf2fb; padding:8px 14px; margin:10px 0;">
<strong>定义:统一物理寄存器堆(MIPS R10K、Alpha 21264、Pentium 4)</strong><br>
用<strong>一个寄存器堆同时保存已提交值与推测值</strong>(ROB 中不再存数据)。要点:<br>
• Decode 时为指令结果分配新物理寄存器,源寄存器经重命名表译为物理寄存器号;<br>
• 指令在<strong>执行开始时</strong>(而非 Decode)从寄存器堆读数据;<br>
• 写回通过对 ROB 中指令的关联搜索更新 busy 位;<br>
• 每个分支拍重命名表快照以恢复误预测;<br>
• 异常时按发射逆序撤销重命名(MIPS R10000)。
</div>

**完整数据流**:`Fetch → Decode&Rename →(乱序)Reorder Buffer / 物理寄存器堆 / 各执行单元 → (按序)Commit`。前端按序、中段乱序、尾端按序,分支预测在前端、解析在执行段并更新预测器;kill 信号贯穿各段。

---

## 5. 物理寄存器生命周期与管理

<div style="border-left:4px solid #d9534f; background:#fbeaea; padding:8px 14px; margin:10px 0;">
<strong>核心问题:物理寄存器何时可回收?</strong><br>
答:<strong>当对同一架构寄存器的下一次写提交时</strong>,旧的物理寄存器才可释放。物理寄存器与 ROB 项解耦(ROB 不存数据)。
</div>

**管理结构**:ROB 项含 `... Rd | LPRd | PRd`(LPRd = 该架构寄存器之前映射的物理寄存器,提交时把 LPRd 归还 Free List;需重命名表第三个读端口)。配合**重命名表 + 空闲列表 (Free List)**,逐条指令完成"分配 PRd / 重命名源 / 记录 LPRd"。

<div style="border-left:4px solid #4a90d9; background:#eaf2fb; padding:8px 14px; margin:10px 0;">
<strong>ROB = 活动指令窗口 (Active Instruction Window)</strong><br>
ROB 大小该多大?——想 Little 定律 $N = T\times L$。可把 ROB 拆成两个队列:<br>
• <strong>提交队列 (Commit Queue)</strong>:Decode 分配、commit 释放;<br>
• <strong>发射队列 (Issue Queue)</strong>:Decode 分配、dispatch 释放。<br>
优点:发射队列更小、派发逻辑更简单;缺点:误推测恢复更复杂。
</div>

---

## 6. 发射时序与两种风格对比

<div style="border-left:4px solid #d9534f; background:#fbeaea; padding:8px 14px; margin:10px 0;">
<strong>提前发射靠延迟预测,但可能失败</strong><br>
利用已知执行延迟(旁路)可让相邻依赖指令背靠背发射;但若<strong>实际延迟与预期不符</strong>(如 <code>lw</code> 缓存缺失,而非定延迟的 <code>addi</code>),该调度就会失败。
</div>

发射队列按延迟类型处理:**定延迟**(延迟入队、可旁路)、**预测延迟**(推测)、**变延迟**(等完成信号、停顿)。

<div style="border-left:4px solid #3fa34d; background:#eafbe9; padding:8px 14px; margin:10px 0;">
<strong>Data-in-ROB vs 统一寄存器堆</strong><br>
缓存缺失等场景下,<strong>Data-in-ROB 风格的依赖环更短</strong>(读数据与写 ROB 更近);统一寄存器堆风格多一次"读寄存器堆"环节。两者在发射推测上的差异即源于此。
</div>

**超标量重命名**:同周期多条指令各分配新物理目的寄存器、源重命名为最新值;须**并行检测同周期发射指令间的 RAW 冒险**(与重命名查表并行进行)。MIPS R10K 每周期可重命名 4 条串行 RAW 依赖指令。

> **下一讲:** Advanced Memory Operations(高级访存操作)
