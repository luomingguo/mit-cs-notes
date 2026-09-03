---
title: 领域特定语言 · 软件构造基础
type: lecture
lecture: 19
tags: ['DSL']
status: complete
---
# Lec 19 领域特定语言

核心目标

| 避免 Bug             | 易于理解                                   | 易于变更             |
| -------------------- | ------------------------------------------ | -------------------- |
| 今天正确，未来也正确 | 清晰地与未来的程序员（包括未来的自己）沟通 | 无需重写即可适应变化 |

本节核心思想：**当你需要解决某类问题时，与其编写一个解决单一问题的程序，不如构建一门能解决一类相关问题的语言。**

------

## 一、代码即数据（Representing Code as Data）

### 动机

TypeScript 中可以直接写：

```typescript
p && q
```

这个表达式一遇到就立即求值，无法被存储、传递或多次求值。

相比之下，定义一个 `Formula` 递归数据类型：

```
Formula = Variable(name: String)
          + Not(formula: Formula)
          + And(left: Formula, right: Formula)
          + Or(left: Formula, right: Formula)
```

则 `And(Variable("p"), Variable("q"))` 是一个**一等值**（*first-class value*）——可以被存储、传递、按需求值（一次或多次）。

这就是**代码即数据**（*representing code as data*）的核心思想。`Formula` 就是一棵**抽象语法树**（*abstract syntax tree, AST*）。

------

## 二、领域特定语言（Domain-Specific Language, DSL）

**语言**比**程序**更灵活：一门语言能解决一大类相关问题，而一个程序只能解决单一问题。

### DSL 的分类

| 类型                           | 定义                           | 示例                                   |
| ------------------------------ | ------------------------------ | -------------------------------------- |
| **外部 DSL**（*external DSL*） | 有独立语法，与宿主语言无关     | 正则表达式、ParserLib 语法、abc 记谱法 |
| **内部 DSL**（*internal DSL*） | 嵌入在通用语言中，复用宿主语法 | 本节的 Music 语言                      |

> 定义一个**抽象数据类型**（*ADT*）就是在扩展语言的类型宇宙——增加新的名词（值）和动词（操作）。

------

## 三、Music 语言

### 3.1 播放 MIDI

核心接口：

```typescript
// 调度一个音符在未来某时刻播放
addNote(player: SequencePlayer, instrument: Instrument,
        pitch: Pitch, atBeat: number, duration: number): void

// 真正开始播放
start(player: SequencePlayer): Promise<void>
```

- **`Instrument`**（*乐器*）：MIDI 乐器枚举
- **`Pitch`**（*音高*）：钢琴键盘上的音符，ADT

`Pitch.transpose(n)` 是一个 **producer**（生产者）操作，返回移调后的新 `Pitch` 对象。

### 3.2 Music 数据类型定义

```
Music = Note(duration: number, pitch: Pitch, instrument: Instrument)
        + Rest(duration: number)
        + Concat(first: Music, second: Music)
```

| 变体     | 含义                               |
| -------- | ---------------------------------- |
| `Note`   | 一个具体音符（音高 + 时值 + 乐器） |
| `Rest`   | 一段静音（时值）                   |
| `Concat` | 两段音乐依次拼接（树结构）         |

**空音乐**的表示：用 `Rest(0)` 代替引入 `Empty` 变体，也不使用 `null`。

### 3.3 组合模式（Composite Pattern）

`Music` 是**组合模式**（*composite pattern*）的典型例子：

- **原始元素**（*primitives*）：`Note`、`Rest`——叶节点
- **组合元素**（*composites*）：`Concat`——内部节点
- 两类都实现同一个 `Music` 接口，可以统一对待

其他例子：HTML DOM（`<img>` 是原始元素，`<div>` 是组合元素）。

### 3.4 abc 记谱法（外部 DSL）

简化版 abc 记谱法示例：

```
C D E F G A B C'        ← C 大调音阶，每音一拍（四分音符）
C/2 D/2 _E/2 F/2 ...    ← 八分音符，_E 表示降 E
```

语法要素：音名（`C`~`B`）、升降号（`^`升、`_`降）、八度（`'`升八度、`,`降八度）、时值（`/2` 减半）。

### 3.5 核心操作

```typescript
// 工厂函数（在 MusicLanguage 模块中）
notes(str: string, instrument: Instrument): Music   // 解析 abc 字符串
note(duration: number, pitch: Pitch, instrument: Instrument): Music
rest(duration: number): Music
concat(first: Music, second: Music): Music

// 实例方法（在 Music 接口中）
duration(): number      // 返回时值（拍数）
play(player: SequencePlayer, atBeat: number): void  // 调度播放
```

**`play` 为什么要传入 `atBeat`？** 因为 `addNote` 本身就是调度未来播放，`play` 需要知道当前音乐从哪一拍开始，从而正确计算每个音符的绝对时刻：

```typescript
// Note.play
player.addNote(this.instrument, this.pitch, atBeat, this.duration);

// Rest.play
// 什么都不做，只推进时间

// Concat.play
this.first.play(player, atBeat);
this.second.play(player, atBeat + this.first.duration());
```

### 3.6 对象数量分析

对于 `notes("C D", PIANO)`（两个音符）：

- 2 个 `Note` 对象
- 1 个 `Rest(0)`（初始空音乐）
- 2 个 `Concat` 对象（每拼接一次创建一个）
- 共 **5 个** `Music` 对象

对于 27 个音符的乐曲：$27 \times 1 \text{（Note）} + 1 \text{（Rest(0)）} + 27 \text{（Concat）} = \mathbf{55}$ 个对象。

------

## 四、递归类型上的函数

### 4.1 解释器模式（Interpreter Pattern）

在接口中**声明操作**，在每个具体变体中**实现操作**：

```typescript
interface Formula {
    variables(): Set<string>;
}

class Variable implements Formula {
    variables(): Set<string> { return new Set([this.name]); }
}
class Not implements Formula {
    variables(): Set<string> { return this.formula.variables(); }
}
class And implements Formula {
    variables(): Set<string> {
        return setUnion(this.left.variables(), this.right.variables());
    }
}
```

**动态分派**（*dynamic dispatch*）是解释器模式的核心机制：

- **静态类型**（*static type*）：变量声明时的类型，编译期已知
- **动态类型**（*dynamic type*）：运行时对象的实际类，总是静态类型的子类型（*subtype*）
- 方法调用时，**动态类型**决定执行哪个方法体

### 4.2 解释器模式的缺点

1. **代码分散**：一个操作的代码分布在所有变体类中，难以整体阅读、调试或重构
2. **难以添加新操作**：需要修改接口和所有实现类

------

## 五、模式匹配（Pattern Matching）

理想中想写这样的 `switch`（但 TypeScript 不支持）：

```typescript
// 伪代码，非合法 TypeScript
function variables(f: Formula): Set<string> {
    switch(f) {
        case (v: Variable): return new Set([v.name]);
        case (n: Not):      return variables(n.formula);
        case (a: And):      return setUnion(variables(a.left), variables(a.right));
        case (o: Or):       return setUnion(variables(o.left), variables(o.right));
    }
}
```

> Python 3.10 的 `match-case` 语句支持这种写法。

### 用 `instanceof` 的问题

```typescript
function variables(f: Formula): Set<string> {
    if (f instanceof Variable) { ... }
    else if (f instanceof Not) { ... }
    else if (f instanceof And) { ... }
    else if (f instanceof Or)  { ... }
    else { throw new Error("unknown"); }
}
```

**缺陷**：`else` 分支只能在运行时报错，无法在编译期静态保证覆盖了所有变体。若新增变体（如 `Xor`），编译器不会警告，只会在运行时抛出异常。

------

## 六、访问者模式（Visitor Pattern）

### 6.1 核心思想：将函数表示为数据

将操作表示为一个实现了 `FormulaVisitor<R>` 接口的类：

```typescript
interface FormulaVisitor<R> {
    onVariable(variable: Variable): R;
    onNot(not: Not): R;
    onAnd(and: And): R;
    onOr(or: Or): R;
}
```

### 6.2 双重分派（Double Dispatch）

在 `Formula` 接口中添加 `accept` 方法作为入口：

```typescript
interface Formula {
    accept<R>(visitor: FormulaVisitor<R>): R;
    // ... 其他操作 ...
}
```

每个变体实现 `accept`，将自身（`this`）传给访问者：

```typescript
class Variable implements Formula {
    accept<R>(visitor: FormulaVisitor<R>): R { return visitor.onVariable(this); }
}
class Not implements Formula {
    accept<R>(visitor: FormulaVisitor<R>): R { return visitor.onNot(this); }
}
class And implements Formula {
    accept<R>(visitor: FormulaVisitor<R>): R { return visitor.onAnd(this); }
}
class Or implements Formula {
    accept<R>(visitor: FormulaVisitor<R>): R { return visitor.onOr(this); }
}
```

**双重分派的执行流程**：

1. 第一次分派：`f.accept(visitor)` → 根据 `f` 的动态类型，执行对应变体的 `accept`
2. 第二次分派：变体的 `accept` 调用 `visitor.onXxx(this)` → 执行访问者中对应方法

### 6.3 实现 `variables` 访问者

```typescript
class VariablesInFormula implements FormulaVisitor<Set<string>> {
    onVariable(v: Variable): Set<string> {
        return new Set([v.name]);
    }
    onNot(n: Not): Set<string> {
        return n.formula.accept(this);   // 递归
    }
    onAnd(a: And): Set<string> {
        return setUnion(a.left.accept(this), a.right.accept(this));
    }
    onOr(o: Or): Set<string> {
        return setUnion(o.left.accept(this), o.right.accept(this));
    }
}

// 调用方式
const theVariables = f.accept(new VariablesInFormula());
```

### 6.4 带额外参数的访问者

将额外参数传入访问者的**构造函数**，存为字段：

```typescript
class EvaluateVisitor implements FormulaVisitor<boolean> {
    constructor(private readonly map: Map<string, boolean>) {}

    onVariable(v: Variable): boolean {
        return this.map.get(v.name) ?? assert.fail(v.name + ' undefined');
    }
    onNot(n: Not): boolean {
        return !n.formula.accept(this);
    }
    onAnd(a: And): boolean {
        return a.left.accept(this) && a.right.accept(this);
    }
    onOr(o: Or): boolean {
        return o.left.accept(this) || o.right.accept(this);
    }
}

function evaluate(formula: Formula, map: Map<string, boolean>): boolean {
    return formula.accept(new EvaluateVisitor(map));
}
```

### 6.5 对象字面量写法（利用结构化子类型）

TypeScript 支持用对象字面量实现接口，让写法更接近 `switch`：

```typescript
function evaluate(formula: Formula, map: Map<string, boolean>): boolean {
    return formula.accept({
        onVariable(v: Variable) { return map.get(v.name); },
        onNot(n: Not)           { return !n.formula.accept(this); },
        onAnd(a: And)           { return evaluate(a.left, map) && evaluate(a.right, map); },
        onOr(o: Or)             { return evaluate(o.left,  map) || evaluate(o.right,  map); },
    });
}
```

编译器静态检查确保所有 `onXxx` 方法都被实现，安全且紧凑。

------

## 七、解释器模式 vs. 访问者模式

将所有代码想象为一张表格，变体类横向排列，操作纵向排列：

|             | `Variable(name)` | `And(f1,f2)`          | `Or(f1,f2)`           | `Not(f)`   |
| ----------- | ---------------- | --------------------- | --------------------- | ---------- |
| `variables` | `{name}`         | `vars(f1) ∪ vars(f2)` | `vars(f1) ∪ vars(f2)` | `vars(f)`  |
| `evaluate`  | `map.get(name)`  | `eval(f1) ∧ eval(f2)` | `eval(f1) ∨ eval(f2)` | `¬eval(f)` |
| `cnf`       | ...              | ...                   | ...                   | ...        |

|                      | 解释器模式（*Interpreter*）          | 访问者模式（*Visitor*）                    |
| -------------------- | ------------------------------------ | ------------------------------------------ |
| 代码组织             | **按列**：每个变体类含所有操作       | **按行**：每个访问者类含一个操作的所有情况 |
| 添加新**变体**（列） | ✓ 容易：只需新建一个类，实现所有操作 | ✗ 困难：需修改访问者接口及所有实现         |
| 添加新**操作**（行） | ✗ 困难：需修改接口及所有变体类       | ✓ 容易：只需新建一个访问者类               |
| 静态安全性           | 编译器强制每个变体实现所有操作       | 编译器强制每个访问者实现所有变体情况       |

**选择原则**：

- 若未来更多地**增加新变体** → 解释器模式
- 若未来更多地**增加新操作** → 访问者模式
- 若希望**客户端自定义操作**（如 AST 遍历）→ 访问者模式

> 两种模式**不互斥**，一个接口可以同时提供 Interpreter 风格的方法 *和* `accept` 方法。

------

## 八、小结

```
小语言 = ADT（复合模式） + 操作（解释器/访问者模式） + 外部 DSL（语法 + 解析器）
```

| 概念           | 要点                                                         |
| -------------- | ------------------------------------------------------------ |
| **代码即数据** | 将表达式表示为 ADT 实例，可存储、传递、按需求值              |
| **DSL**        | 外部 DSL（独立语法）vs. 内部 DSL（嵌入宿主语言）             |
| **复合模式**   | 原始元素与组合元素实现同一接口，形成树结构                   |
| **解释器模式** | 按变体组织代码，易于添加新变体                               |
| **动态分派**   | 运行时根据对象动态类型选择方法体                             |
| **访问者模式** | 按操作组织代码，易于添加新操作；利用双重分派实现类型安全的 switch |
| **双重分派**   | `accept` → 变体的 `accept` → 访问者的 `onXxx`，两次动态分派  |

三个代码质量维度：

- **安全**：访问者模式用类型安全的方式对递归 ADT 实现函数，消除 `instanceof` 链的风险
- **易懂**：新操作的所有代码集中在一个访问者类中，无需在多个文件中穿梭
- **易变**：访问者接口为客户端提供了扩展操作的标准机制，无需修改现有类

------
