# Lec 4  RISC-V 汇编



本节内容：

我们从RISC-V的组成结构出发， 特别是一条指令的位宽只有32bit，需要将很多信息浓缩到这个32bit中，为此引出RISC-V指令集设计的三条原则出发，这是理解指令集 "为什么这样设计的前提"，接着我们学习全部6种指令格式的划分用途及示例等，补充关于符号扩展的细节，最后我们特别学习6种条件分支指令。







![image-20260613023554932](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260613023554932.png)

RISC-V处理器的组成结构（简易版，想要更进一步理解，可以看末尾扩展阅读），

## 指令集设计的三条原则



RISC-V 的指令集设计遵循三条核心原则：

原则一：简单源于规整（simplicity favors regularity）。所有算术指令都保持相同的格式——三个操作数（两个源、一个目的），这种规整性让硬件设计更简单。

原则二：越小越快（smaller is faster）。RISC-V 只有 32 个通用寄存器，而不是更多。寄存器数量越少，硬件中的信号传播距离越短，时钟周期越快。如果寄存器超过 32 个，每个寄存器字段就需要多于 5 位来编码，指令格式会更复杂，硬件也更慢。

原则三：优秀的设计需要好的折中（good design demands good compromises）。保持所有指令长度固定为 32 位和保持单一指令格式之间存在矛盾——不同类型的指令需要不同的字段划分。RISC-V 的折中是：所有指令都是 32 位长，但允许多种指令格式（R-type、I-type、S-type 等），由 opcode 字段区分。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong>存储程序概念</strong>　现代计算机建立在两个关键思想之上：指令以数字形式表示；程序像数据一样存储在内存中，可以被读写。这就是存储程序概念（<em>stored-program concept</em>）——同一块内存既可以存放程序代码，也可以存放数据，只要改变内存中的内容，同一台计算机就可以从做会计变成写文章。这也意味着指令和数据在内存中的二进制表示没有本质区别，区别仅在于处理器如何解读它们。 </div>



![image-20260622195336533](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260622195336533.png)

图2.1 记录完善 RISC-V 操作数 和 操作指令类型

伪指令是一种简写，转换后等效于实际的RISC-V 指令

例如，

| 伪指令              | 汇编                               | 作用                                                         |
| ------------------- | ---------------------------------- | ------------------------------------------------------------ |
| `mv x2, x1`         | `addi x2, x1, 0`                   | 将 x1 的值复制到 x2(寄存器拷贝)                              |
| `ble x1, x2, label` | `bge x2, x1, label`                | 如果 x1 ≤ x2,跳转到 label                                    |
| `j label`           | `jal x0, label`                    | 无条件跳转到 label,不保存返回地址                            |
|                     |                                    |                                                              |
| `li x2 3`           | `addi x2, x0, 3`                   | 将立即数 3 加载到 x2(直接用 12 位立即数即可表示)             |
| `li x3, 0x4321`     | `lui x3, 0x4` `addi x3, x3, 0x321` | 将立即数 0x4321 加载到 x3; 先用 lui 把高 20 位(0x4)放入 x3 的 高位并清零低 12 位,再用 addi 加上 低 12 位(0x321),拼出完整的 0x4321 |
|                     |                                    |                                                              |

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong>数据内存 vs 指令内存</strong> 他们是内存的不同部分， 如果PC指向一些地址，我们是假设只想指令的地址，PC永远跟踪下一个指令： 要么是非控制流情况：pc=pc+4 ；要么是控制流 </div>

## 控制流指令详解

计算机区别于计算器的核心能力就是做决策（decision making）。RISC-V 提供了六条条件分支指令，覆盖了所有有符号和无符号比较：

| 指令                   | 含义                               | 类型                |
| ---------------------- | ---------------------------------- | ------------------- |
| `beq rs1, rs2, label`  | 如果 rs1 == rs2，跳转              | 有符号/无符号均适用 |
| `bne rs1, rs2, label`  | 如果 rs1 ≠ rs2，跳转               | 有符号/无符号均适用 |
| `blt rs1, rs2, label`  | 如果 rs1 < rs2，跳转（有符号比较） | 有符号              |
| `bge rs1, rs2, label`  | 如果 rs1 ≥ rs2，跳转（有符号比较） | 有符号              |
| `bltu rs1, rs2, label` | 如果 rs1 < rs2，跳转（无符号比较） | 无符号              |
| `bgeu rs1, rs2, label` | 如果 rs1 ≥ rs2，跳转（无符号比较） | 无符号              |

有符号和无符号的区别在于对最高位的解读：有符号比较中最高位为 1 表示负数（小于任何正数）；无符号比较中最高位为 1 表示一个很大的正数（大于任何最高位为 0 的数）。

> 数组越界检查的技巧：要检查 0≤x<y0 \leq x < y 0≤x<y（即数组索引 x 是否合法），只需一条无符号比较 `bgeu x20, x11, IndexOutOfBounds`。原理是：如果 x 是负数，它在无符号解读下会变成一个非常大的正数，一定 ≥ y；如果 x ≥ y，条件同样成立。一条指令同时完成了"x 是否为负"和"x 是否越界"两个检查。

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong>例题：编译 if-then-else</strong>　f、g、h、i、j 分别对应寄存器 x19 到 x23，编译 <code>if (i == j) f = g + h; else f = g - h;</code> </div>

编译的一般技巧是：测试与原始条件相反的条件，跳过 then 分支。这样代码效率更高（条件为真时不需要额外跳转）：

```asm
      bne  x22, x23, Else    ; 如果 i ≠ j，跳到 Else
      add  x19, x20, x21     ; f = g + h（i == j 时执行）
      beq  x0, x0, Exit      ; 无条件跳到 Exit
Else: sub  x19, x20, x21     ; f = g - h（i ≠ j 时执行）
Exit:
```

注意 `beq x0, x0, Exit` 是实现无条件跳转的一种方式（条件永远为真），等价于伪指令 `j Exit`。

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong>例题：编译 while 循环</strong>　i 对应 x22，k 对应 x24，数组 save 的基地址在 x25，编译 <code>while (save[i] == k) i += 1;</code> </div>

```asm
Loop: slli x10, x22, 3       ; x10 = i * 8（doubleword 偏移）
      add  x10, x10, x25     ; x10 = save + i*8 = &save[i]
      ld   x9, 0(x10)        ; x9 = save[i]
      bne  x9, x24, Exit     ; 如果 save[i] ≠ k，退出循环
      addi x22, x22, 1       ; i = i + 1
      beq  x0, x0, Loop      ; 跳回 Loop
Exit:
```

这里有一个常见易错点：数组索引 i 要乘以元素大小（doubleword 是 8 字节，int 是 4 字节），用左移代替乘法（左移 3 位等于乘以 8，左移 2 位等于乘以 4）。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong>基本块</strong>　以分支结尾、不含中间分支、也不含分支目标标签（除了开头可以有）的指令序列，叫做基本块（<em>basic block</em>）。编译器的第一步就是把程序分割成基本块。基本块是编译优化和流水线分析的基本单元。 </div>

### PC 相对寻址

条件分支和 jal 指令中的立即数并不是绝对地址，而是相对于当前指令地址（PC）的偏移量。实际跳转地址 = PC + 偏移量。这样设计的好处是：条件分支通常跳转到附近的指令（循环体、if-else 的另一个分支），用 12 位偏移量就足以覆盖大多数情况（SPEC 基准测试中约一半的条件分支跳转距离不超过 16 条指令）。

如果分支距离确实超出了 12 位偏移量的范围，汇编器会自动把一条远距离条件分支拆成两条指令：先用条件取反的分支跳过一条无条件跳转，再用 jal（20 位偏移，范围更大）跳到真正的目标。例如 `beq x10, x0, L1`（L1 太远）会被替换为：

asm

```asm
bne x10, x0, L2    ; 条件取反，跳过下面一条
jal x0, L1          ; 无条件跳到远处的 L1
L2:
```

如果连 jal 的 20 位也不够（需要跳转到任意 32 位地址），可以用 lui + jalr 两条指令组合：lui 把目标地址的高 20 位放入临时寄存器，jalr 加上低 12 位并跳转。

## 四种寻址模式总结

| 寻址模式                          | 描述                         | 示例                |
| --------------------------------- | ---------------------------- | ------------------- |
| 立即数寻址（immediate）           | 操作数是指令中的常数         | `addi x5, x6, 4`    |
| 寄存器寻址（register）            | 操作数在寄存器中             | `add x5, x6, x7`    |
| 基址偏移寻址（base/displacement） | 地址 = 寄存器 + 指令中的常数 | `lw x5, 40(x6)`     |
| PC 相对寻址（PC-relative）        | 地址 = PC + 指令中的常数     | `beq x5, x6, Label` |

------

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong>例题： 数组求和</strong>　假设我们有一个数组 arr 有10个整数，起始内存地址是0x700，分析其汇编代码 </div>

伪指令是若干真实 RISC-V 指令的简写,汇编器会把它们展开成等价的真实指令:

`mv x2, x1` → `addi x2, x1, 0`(寄存器拷贝)。 `ble x1, x2, label` → `bge x2, x1, label`(小于等于,通过交换操作数实现)。 `j label` → `jal x0, label`(无条件跳转,rd 写 x0 表示不保存返回地址)。 `li x2, 3` → `addi x2, x0, 3`(立即数在 12 位范围内时单指令完成)。 `li x3, 0x4321` → `lui x3, 0x4` 加 `addi x3, x3, 0x321`(大于 12 位的立即数需 lui + addi 两条,占 64 位/两个字)。

注意:数据内存和指令内存是不同的内存区段,如果 PC 指向某处,就默认那里是指令,不要覆写。相邻内存位置相隔 4 个字节;例如一个长度 10 的 int 数组,相邻元素在内存中相隔 4 字节,整个数组占 40 字节。

RISC-V 的指令类型大致分为：

- 由ALU执行的计算指令
  - 寄存器-寄存器： `oper rd, rs1, rs2`
  - 寄存器-立即数： `oper rd, rs1, constant(12-bit)` 或者 `lui rd, luiConstant(20-bit)`
- 存取指令
  - `lw rd, offset(rs1)`
  - `sw rs2, offset(rs1)`
  - 内存地址 = `reg[rs1] + 符号扩展(offset)`
- 控制流指令
  - 条件型： `comp rs1, rs2, label`
  - 非条件型： `jal rd, label` 和 `jalr rd, offset(rs1)`
- 伪指令
  - 其他指令的简写形式

**指令格式（Instruction Formats）**

RISC-V 所有指令都是 32 位长。不同类型的指令需要不同的字段划分，因此有多种指令格式。每种格式由 opcode 字段区分，硬件据此决定如何解读剩余的位。

各字段的含义：opcode（操作码）标识指令的基本操作和格式；rd（destination register）是目的寄存器；rs1、rs2 是源寄存器；funct3 和 funct7 是辅助操作码字段，用来在同一 opcode 下区分不同的具体操作；immediate（立即数）是嵌入在指令中的常数。

R-type（寄存器型）：用于寄存器之间的算术/逻辑运算（如 add、sub、and、or、sll 等）。格式为 `[funct7(7位) | rs2(5位) | rs1(5位) | funct3(3位) | rd(5位) | opcode(7位)]`。三个寄存器字段加上 funct7 和 funct3 共同确定具体操作。例如 `add x9, x20, x21` 中，opcode=0110011，funct7=0000000，funct3=000，rs1=20，rs2=21，rd=9。

I-type（立即数型）：用于带一个常数操作数的运算（如 addi、andi）以及加载指令（如 lw、ld）。格式为 `[immediate(12位) | rs1(5位) | funct3(3位) | rd(5位) | opcode(7位)]`。12 位立即数以二补码解释，范围 −2048 到 2047。对于 load 指令，这 12 位就是相对于基地址寄存器 rs1 的字节偏移量。注意 RISC-V 没有 subi 指令，因为立即数是二补码表示，`addi x5, x5, -3` 就等价于减去 3。

S-type（存储型）：用于 store 指令（如 sw、sd）。store 需要两个源寄存器（基地址 rs1 和要存储的数据 rs2）加一个偏移量，没有目的寄存器。格式为 `[imm[11:5](7位) | rs2(5位) | rs1(5位) | funct3(3位) | imm[4:0](5位) | opcode(7位)]`。12 位立即数被拆成两段分布在指令两端——这样设计是为了让 rs1 和 rs2 字段在所有格式中保持在相同位置，简化硬件。

B-type（分支型，也叫 SB-type）：用于条件分支指令（如 beq、bne、blt、bge 等）。格式类似 S-type，12 位立即数编码了相对于当前 PC 的偏移量（以半字即 2 字节为单位），可以表示 −4096 到 +4094 字节的跳转范围。分支地址 = PC + 符号扩展后的偏移量，这种方式叫做 PC 相对寻址（*PC-relative addressing*）。

U-type（高位立即数型）：用于 lui 指令。格式为 `[imm[31:12](20位) | rd(5位) | opcode(7位)]`，20 位立即数放入目的寄存器的高 20 位，低 12 位清零。

J-type（跳转型，也叫 UJ-type）：用于 jal 指令。格式为 `[imm(20位) | rd(5位) | opcode(7位)]`，20 位立即数编码了 PC 相对偏移（以半字为单位），跳转范围 ±1 MiB。同时把 PC+4（下一条指令地址）写入 rd 作为返回地址。

| 格式   | 用途              | 示例指令                       |
| ------ | ----------------- | ------------------------------ |
| R-type | 寄存器-寄存器运算 | add、sub、and、or、sll、srl    |
| I-type | 立即数运算、加载  | addi、andi、lw、ld、jalr       |
| S-type | 存储              | sw、sd                         |
| B-type | 条件分支          | beq、bne、blt、bge、bltu、bgeu |
| U-type | 高位立即数        | lui、auipc                     |
| J-type | 无条件跳转        | jal                            |

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong>lui指令</strong>　RISC-V 是 32 位指令集,但 I-type 指令(寄存器-立即数运算、lw 等)中的立即数字段只有 12 位,而且会做符号扩展(sign extension),取值范围是 -2048 到 2047<br> lui 全称是 Load Upper Immediate(把立即数加载到高位)。`lui rd, luiConstant` 的作用是:把一个 20 位的立即数 luiConstant 放到目标寄存器 rd 的高 20 位(也就是第 31 位到第 12 位),同时把低 12 位全部清零。 </div>

> lui + addi 的符号扩展补偿：用 lui 和 addi 拼出一个 32 位常数时，如果低 12 位的第 11 位（最高位）恰好是 1，addi 会把这 12 位当作负数（因为符号扩展），等效于多减了 2122^{12} 212。为了补偿这个误差，需要在 lui 的 20 位常数上额外加 1（因为 lui 的常数会被左移 12 位，加 1 等于多加了 2122^{12} 212，恰好抵消）。汇编器在遇到 `li` 伪指令时会自动处理这个补偿，但手动拆分时必须自己注意。





RISC-V 的指令类型大致分为：

- 由ALU执行的计算指令
  - 寄存器-寄存器： `oper rd, rs1, rs2`
  - 寄存器-立即数： `oper rd, rs1, constant(12-bit)` 或者 `lui rd, luiConstant(20-bit)`
- 存取指令
  - `lw rd, offset(rs1)`
  - `sw rs2, offset(rs1)`
  - 内存地址 = `reg[rs1] + 符号扩展(offset)`
- 控制流指令
  - 条件型： `comp rs1, rs2, label`
  - 非条件型： `jal rd, label` 和 `jalr rd, offset(rs1)`
- 伪指令
  - 其他指令的简写形式



<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;">
<strong>lui指令</strong>　RISC-V 是 32 位指令集,但 I-type 指令(寄存器-立即数运算、lw 等)中的立即数字段只有 12 位,而且会做符号扩展(sign extension),取值范围是 -2048 到 2047<br>
lui 全称是 Load Upper Immediate(把立即数加载到高位)。`lui rd, luiConstant` 的作用是:把一个 20 位的立即数 luiConstant 放到目标寄存器 rd 的高 20 位(也就是第 31 位到第 12 位),同时把低 12 位全部清零。
</div>

​	





伪指令是一种简写，转换后等效于实际的RISC-V 指令

![image-20260613025727077](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260613025727077.png)

例如，

| 伪指令              | 汇编                                    | 作用                                                         |
| ------------------- | --------------------------------------- | ------------------------------------------------------------ |
| `mv x2, x1`         | `addi x2, x1, 0`                        | 将 x1 的值复制到 x2(寄存器拷贝)                              |
| `ble x1, x2, label` | `bge x2, x1, label`                     | 如果 x1 ≤ x2,跳转到 label                                    |
| `j label`           | `jal x0, label`                         | 无条件跳转到 label,不保存返回地址                            |
|                     |                                         |                                                              |
| `li x2 3`           | `addi x2, x0, 3`                        | 将立即数 3 加载到 x2(直接用 12 位立即数即可表示)             |
| `li x3, 0x4321`     | `lui x3, 0x4`<br />`addi x3, x3, 0x321` | 将立即数 0x4321 加载到 x3;<br />先用 lui 把高 20 位(0x4)放入 x3 的<br />高位并清零低 12 位,再用 addi 加上<br />低 12 位(0x321),拼出完整的 0x4321 |
|                     |                                         |                                                              |



<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;">
<strong>数据内存 vs 指令内存</strong> 他们是内存的不同部分， 如果PC指向一些地址，我们是假设只想指令的地址，PC永远跟踪下一个指令： 要么是非控制流情况：pc=pc+4 ；要么是控制流
</div>



![image-20260613031944708](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260613031944708.png)



---

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong>例题： 数组求和</strong>　假设我们有一个数组 arr 有10个整数，起始内存地址是0x700，分析其汇编代码 </div>

![image-20260613032157368](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260613032157368.png)





----

伪指令是若干真实 RISC-V 指令的简写,汇编器会把它们展开成等价的真实指令:

`mv x2, x1` → `addi x2, x1, 0`(寄存器拷贝)。
`ble x1, x2, label` → `bge x2, x1, label`(小于等于,通过交换操作数实现)。
`j label` → `jal x0, label`(无条件跳转,rd 写 x0 表示不保存返回地址)。
`li x2, 3` → `addi x2, x0, 3`(立即数在 12 位范围内时单指令完成)。
`li x3, 0x4321` → `lui x3, 0x4` 加 `addi x3, x3, 0x321`(大于 12 位的立即数需 lui + addi 两条,占 64 位/两个字)。

注意:数据内存和指令内存是不同的内存区段,如果 PC 指向某处,就默认那里是指令,不要覆写。相邻内存位置相隔 4 个字节;例如一个长度 10 的 int 数组,相邻元素在内存中相隔 4 字节,整个数组占 40 字节。





## 扩展阅读： 单周期处理器数据通路

![riscv_processor_datapath](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/riscv_processor_datapath.svg)

图中展示的是一个单周期 RISC-V 处理器的数据通路（*datapath*），每个组件的作用如下：

- **PC（程序计数器）**：一个 32 位寄存器，保存当前正在执行的指令的内存地址。每个时钟周期结束时，PC 要么更新为 PC+4（顺序执行下一条指令），要么更新为分支/跳转的目标地址。图中底部的 MUX（多路选择器，标为 M）负责在这两个来源之间选择——控制信号决定走哪条路。
- **指令存储器（*Instr mem*）**：只读存储器，存放程序的机器码。PC 的值作为地址输入，输出对应地址处的 32 位指令。这条指令随后被拆解成各个字段（opcode、rs1、rs2、rd、funct3、funct7、immediate）分发给后续组件
- **控制单元（*Control*）**：接收指令的 opcode（和 funct3/funct7），译码后生成一组控制信号，告诉数据通路的其他部件"这一拍该做什么"。比如：ALU 应该做加法还是减法？数据存储器应该读还是写？寄存器堆的写入端口应该接 ALU 的输出还是数据存储器的输出？这些决策全部由控制单元根据 opcode 确定。
- **寄存器堆（*Register file*）**：32 个 32 位通用寄存器的集合。有两个读端口（同时读出 rs1 和 rs2 两个源寄存器的值）和一个写端口（把结果写回 rd）。读是组合逻辑（地址一给就出数据），写在时钟上升沿触发。
- **立即数生成器（*Imm gen*）**：从指令的不同位置抽取立即数字段，根据指令格式（I/S/B/U/J-type）做不同方式的拼接和符号扩展，输出一个完整的 32 位立即数。这个组件的存在是因为不同格式的立即数散布在指令的不同位置，需要统一整理。
- **算术逻辑单元（*ALU*）**：执行实际的运算。输入 A 始终来自 rs1 的值；输入 B 通过一个 MUX 选择，要么来自 rs2（R-type 指令），要么来自立即数生成器的输出（I-type/S-type/B-type 指令）。ALU 的具体操作（加、减、与、或、移位、比较等）由控制单元发来的 ALU op 信号决定。ALU 还输出一个"零标志"（zero flag），用于条件分支判断。
- **数据存储器（*Data mem*）**：读写存储器，存放程序运行时的数据（数组、变量等）。只有 load 和 store 指令会用到它。ALU 计算出的地址作为输入；store 时，rs2 的值通过 write data 通路写入该地址；load 时，从该地址读出的数据通过 write back 通路送回寄存器堆写入 rd。
- **MUX（多路选择器）**：图中标为 M 的小方块。数据通路中有多处需要根据指令类型选择不同的数据来源，MUX 就是做这个选择的开关。三个关键 MUX 分别是：ALU 输入 B 的 MUX（选 rs2 还是立即数）、写回寄存器堆的 MUX（选 ALU 结果还是数据存储器读出的值）、PC 更新的 MUX（选 PC+4 还是分支目标地址）。





**不同指令类型在数据通路上走的路径不同：**

- R-type（如 `add x9, x20, x21`）：PC → 指令存储器取指 → 寄存器堆读 rs1 和 rs2 → ALU 对两个寄存器值做运算 → 结果写回寄存器堆的 rd。数据存储器不参与。

- I-type 运算（如 `addi x5, x6, 3`）：和 R-type 类似，但 ALU 的 B 输入来自立即数生成器而不是 rs2。

- Load（如 `lw x9, 40(x10)`）：寄存器堆读 rs1 → ALU 计算基地址 + 偏移量 → 算出的地址送入数据存储器 → 读出的数据写回寄存器堆 rd。

- Store（如 `sw x9, 40(x10)`）：寄存器堆同时读 rs1（基地址）和 rs2（要存的数据）→ ALU 计算地址 → 地址和数据一起送入数据存储器写入。没有写回寄存器堆。

- Branch（如 `beq x5, x6, label`）：寄存器堆读 rs1 和 rs2 → ALU 做减法比较 → 如果结果为零（相等），PC 更新 MUX 选择分支目标地址（PC + 立即数偏移）；否则选 PC+4。
