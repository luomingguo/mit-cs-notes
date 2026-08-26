---
title: 语义（IMP）——完整大步操作语义
course: 6.112 动态计算机语言工程
course_id: '6.112'
lecture: 7
kind: theory
tags: []
status: complete
---
# Lec 7 语义（IMP）——完整大步操作语义

> 接 L6。给出 IMP 全部求值关系：布尔表达式、语句（赋值/顺序/if/while），并讨论"出错求值"
> 记号约定：<span>$\langle \cdot, f\rangle \Downarrow \cdot$</span> 为大步求值关系，<span>$f$</span> 为帧（变量→值映射）

---

## 1. IMP 回顾

IMP 含赋值、if-then-else、顺序组合、while。三类项各有一个求值关系：

- 算术表达式：<span>$\langle e, f\rangle \Downarrow n$</span>（求出整数）
- 布尔表达式：<span>$\langle b, f\rangle \Downarrow t$</span>（求出真值 true/false）
- 语句：<span>$\langle s, f\rangle \Downarrow f'$</span>（把帧 <span>$f$</span> 变换为 <span>$f'$</span>）

算术表达式规则已在 L6 给出（常量、变量、二元运算）。本讲补全布尔与语句，并把整套规则与递归解释器对照。

---

## 2. 布尔表达式的推理规则

::: definition 定义（布尔表达式大步语义）
常量：
$$\frac{}{\langle \text{true}, f\rangle \Downarrow \text{true}} \qquad \frac{}{\langle \text{false}, f\rangle \Downarrow \text{false}}$$
比较（先把两侧算术表达式求值，再比较）：
$$\frac{\langle e_1, f\rangle \Downarrow n_1 \quad \langle e_2, f\rangle \Downarrow n_2}{\langle e_1 = e_2, f\rangle \Downarrow (n_1 = n_2)} \qquad \frac{\langle e_1, f\rangle \Downarrow n_1 \quad \langle e_2, f\rangle \Downarrow n_2}{\langle e_1 < e_2, f\rangle \Downarrow (n_1 < n_2)}$$
逻辑联结（结果是真值上的对应布尔运算）：
$$\frac{\langle b_1, f\rangle \Downarrow t_1 \quad \langle b_2, f\rangle \Downarrow t_2}{\langle b_1 \wedge b_2, f\rangle \Downarrow (t_1 \wedge t_2)} \qquad \frac{\langle b, f\rangle \Downarrow t}{\langle \neg b, f\rangle \Downarrow \neg t}$$
:::

> 注意"语法层的 <span>$\wedge$</span>"（程序里的 `&&`）在结论右侧变成了"数学/元语言层的 <span>$\wedge$</span>"（真值表运算）——区分**对象语言**与**元语言**是操作语义的关键。

---

## 3. 语句的推理规则

语句改变帧，关系为 <span>$\langle s, f\rangle \Downarrow f'$</span>。

::: definition 定义（语句大步语义）
**空语句 skip**（帧不变）：
$$\frac{}{\langle \text{skip}, f\rangle \Downarrow f}$$
**赋值**（先求右侧表达式，再更新帧）：
$$\frac{\langle e, f\rangle \Downarrow n}{\langle x := e, f\rangle \Downarrow f[x \mapsto n]}$$
**顺序组合**（前一句的终态作为后一句的初态——这就是"状态线程"）：
$$\frac{\langle s_1, f\rangle \Downarrow f' \quad \langle s_2, f'\rangle \Downarrow f''}{\langle s_1 ; s_2, f\rangle \Downarrow f''}$$
**条件 if**（按条件真值选分支，两条互斥规则）：
$$\frac{\langle b, f\rangle \Downarrow \text{true} \quad \langle s_1, f\rangle \Downarrow f'}{\langle \text{if } b \text{ then } s_1 \text{ else } s_2, f\rangle \Downarrow f'} \qquad \frac{\langle b, f\rangle \Downarrow \text{false} \quad \langle s_2, f\rangle \Downarrow f'}{\langle \text{if } b \text{ then } s_1 \text{ else } s_2, f\rangle \Downarrow f'}$$
:::

### 3.1 while 循环（关键：自指规则）

::: definition 定义（while 大步语义）
**条件为假**（直接结束，帧不变）：
$$\frac{\langle b, f\rangle \Downarrow \text{false}}{\langle \text{while } b \text{ do } s, f\rangle \Downarrow f}$$
**条件为真**（执行一次循环体，再**对整个 while 递归求值**）：
$$\frac{\langle b, f\rangle \Downarrow \text{true} \quad \langle s, f\rangle \Downarrow f' \quad \langle \text{while } b \text{ do } s, f'\rangle \Downarrow f''}{\langle \text{while } b \text{ do } s, f\rangle \Downarrow f''}$$
:::

> while-true 规则的第三个前提**又是 while 自身**——这正是循环的本质。若循环不终止，则**不存在有限的推导树**，即该配置与任何 <span>$f''$</span> 都不在求值关系中（大步语义对不停机程序"无话可说"，这是它相对小步语义的局限）。

---

## 4. 出错求值（Errant Evaluations）

::: definition 定义（卡住 / 无规则适用）
当**没有任何推理规则可应用**时，求值"卡住 (stuck)"，配置与任何结果都不在关系中。典型情形：除以零（$\langle e_2,f\rangle\Downarrow 0$ 时除法无对应规则）、访问未定义变量（$f(x)$ 无定义）、类型不匹配。
:::

> 这把求值关系刻画为**部分函数 (partial function)**：并非每个 <span>$\langle s, f\rangle$</span> 都有结果。语言设计者可选择：让它卡住（未定义行为）、显式定义"错误"结果、或用类型系统在求值前排除这些情形（下一讲引入 Types）。

---

## 5. 与递归解释器的对应

每条推理规则**精确对应**解释器的一段代码：前提 = 递归调用，结论 = 返回/状态更新。

```cpp
int eval_plus(Frame* f, Binop* e) {
    int n1 = eval_expr(f, e->left);    // 前提 ⟨e1,f⟩⇓n1
    int n2 = eval_expr(f, e->right);   // 前提 ⟨e2,f⟩⇓n2
    return n1 + n2;                    // 结论 ⟨e1+e2,f⟩⇓n1+n2
}
```

语句解释器同理：`eval_seq` 先 `f' = eval_stmt(f, s1)` 再 `return eval_stmt(f', s2)`（对应顺序规则的状态线程）；`eval_while` 用一个循环或递归实现两条 while 规则。**操作语义就是解释器的数学规格，解释器是操作语义的可执行实现。**

---

## 6. 完整示例

::: example
**例题（推导 `if (x == 1) { y = 2; }` 在 $f=\{x\mapsto1,\ y\mapsto0\}$ 下）**
目标：$\langle \text{if } (x{=}1) \text{ then } (y{:=}2) \text{ else skip},\ f\rangle \Downarrow\ ?$

```text
(1) ⟨x, f⟩ ⇓ 1            [变量规则, f(x)=1]
(2) ⟨1, f⟩ ⇓ 1            [常量规则]
(3) ⟨x = 1, f⟩ ⇓ true     [比较规则, 由(1)(2), 1=1]
(4) ⟨2, f⟩ ⇓ 2            [常量规则]
(5) ⟨y := 2, f⟩ ⇓ f[y↦2]  [赋值规则, 由(4)]
(6) ⟨if (x=1) then (y:=2) else skip, f⟩ ⇓ f[y↦2]   [if-真规则, 由(3)(5)]
```

结论：终态 $f' = \{x\mapsto1,\ y\mapsto2\}$。整个推导是一棵以（6）为根的**推导树 (derivation tree)**。
:::

---

## 7. 本讲小结

- IMP 完整大步语义：布尔表达式（常量/比较/联结）+ 语句（skip/赋值/顺序/if/while）。
- 顺序组合"线程化"帧（前句终态 = 后句初态）；while-true 规则在前提中**递归引用 while 自身**，不停机程序无有限推导树。
- 出错求值 = 无规则适用（除零、未定义变量），求值关系是部分函数；可用类型系统提前排除。
- 推理规则与递归解释器一一对应（前提=递归调用、结论=返回/更新）。
- 下一讲：堆（Heaps）与布尔/类型——把语义扩展到引用与可变数据。
