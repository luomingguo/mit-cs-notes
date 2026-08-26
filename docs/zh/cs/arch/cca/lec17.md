---
title: 连接加速器
course: 6.1920 建构式计算机架构，CCA
course_id: '6.1920'
lecture: 17
kind: system
tags: []
status: complete
---
# Lec 17 连接加速器
> MIT 6.1920 · Constructive Computer Architecture
> 讲师：Martin Chan / Thomas Bourgeat · 日期：2024-04-11

## 1. 加速器的动机

::: definition
**定义 — 加速器（*Accelerator*）**

加速器是专门处理特定计算的硬件单元（ASIC 或 FPGA），在该类型计算上远比通用 CPU 高效。当计算具有**高算术强度（*high arithmetic intensity*）**（每次内存访问对应大量计算）时，加速器收益最大。例如：矩阵乘法（ML 推理）、AES 加密、信号处理等。
:::

常见加速器类型：网络接口卡（NIC）、加密（AES-NI）、矩阵/ML（Gemmini、TPU）、GPU（可编程加速器）、FPGA（可重配置加速器）。

---

## 2. 案例一：AESENC（寄存器到寄存器）

::: definition
**定义 — 寄存器到寄存器加速器（*Register-to-Register Accelerator*）**

AESENC 是 Intel x86 的 AES 加密指令，操作源寄存器和密钥寄存器，结果写回目标寄存器。加速器完全集成在 CPU 核心内部的向量执行单元中（复用 xmm 寄存器）。
:::

```asm
AESENC xmm1, xmm2
# 对 xmm1 中的 128 位状态执行一轮 AES 加密
# 使用 xmm2 中的 128 位轮密钥
```

**实现方式**：在向量单元中添加新的解码路径和执行逻辑（AES 一轮操作：SubBytes、ShiftRows、MixColumns、AddRoundKey），延迟约 4–8 周期，吞吐量较纯软件提升约 **10×**。

**BSV 集成位置**：在 Execute 阶段扩展 `exec` 函数或添加专用功能单元。

---

## 3. 案例二：伪 NIC（内存到内存加速器）

::: definition
**定义 — 内存映射 I/O（*MMIO, Memory-Mapped I/O*）**

CPU 通过将加速器的控制寄存器映射到物理地址空间（特定地址范围）来与加速器通信。普通 `store`/`load` 指令访问 MMIO 地址即可发送命令/读取状态，无需专用 I/O 指令。**MMIO 访问必须绕过缓存（*uncached*）**，否则数据写不到加速器。
:::

**NIC 工作流程**：

1. CPU 通过 MMIO 告知 NIC：发送缓冲区地址（`ToSend: 0x1000`）、接收缓冲区地址（`Received: 0x5000`）
2. CPU 将数据包写入 `ToSend` 区域，通知 NIC（<em>doorbell</em> 机制）
3. NIC 自主从 `ToSend` 读取数据并通过网络发送
4. NIC 将接收的数据包写入 `Received` 区域，通过中断（<em>interrupt</em>）通知 CPU

**CPU-NIC 通知机制**：
- CPU → NIC：写 MMIO 地址（<em>doorbell</em>）
- NIC → CPU：中断（<em>interrupt</em>）

**为什么 MMIO 必须绕过缓存？**：若 MMIO 写入被缓存，NIC 永远不会收到命令（写只在 CPU 缓存中，不在 NIC 可见的共享内存）。

---

## 4. 案例三：矩阵乘法加速器（类 Gemmini）

::: definition
**定义 — Gemmini（*General Matrix Multiply Accelerator*）**

Gemmini 是 UC Berkeley 开源的系统性空间阵列（*systolic array*）矩阵乘法加速器，专用于通用矩阵乘法（*GEMM*）。指令集分为数据移动和计算两类：

`mvin a sbase length`：从内存搬运数据到加速器暂存器（scratchpad）

`mvout a sbase length`：将结果搬回内存

`matmul.compute A B C D`：计算 $C = A \times B + D$
:::

**为什么分离数据移动和计算**：解耦可以流水线化——搬运 B 时计算 A，提高利用率；也更灵活（支持任意大小矩阵的分块计算）。

### 4.1 从软件发送加速器指令的两种方式

**方式 1：MMIO 映射**
```c
sw queue_arg1, r1    // 写 MMIO：参数1
sw queue_arg2, r2    // 写 MMIO：参数2
sw queue_opcode, r3  // 写 MMIO：操作码 → 触发加速器
```

**方式 2：新增处理器指令（RoCC 接口）**

在 RISC-V 处理器中添加自定义操作码：
- Decode 阶段：读取 rs1, rs2
- Execute 阶段：将（操作码, rs1 值, rs2 值）推送到加速器队列
- 直接写回（无目标寄存器）

```c
// C 内联汇编嵌入自定义指令
asm volatile(".insn r " opcode ", " fn2 ", " fn7 
             ", x0, %0, %1" : : "r"(rs1), "r"(rs2));
```

---

## 5. BSV MMIO 集成示例

```bsv
Bit#(32) addr_accel = 32'hF000C0FF;
Accelerator accel <- mkAccelerator;

rule requestMMIO;
    let req <- rv_core.getMMIOReq;
    if (req.byte_en == 'hf) begin
        if (req.addr == addr_accel)
            accel.put(req.data);       // 发送命令给加速器
        // 其他 MMIO 设备...
    end
endrule

// 共享缓存的多路复用
FIFO#(CoreOrAccel) who_uses_cache <- mkFIFO;

rule requestD;   // CPU 的数据缓存请求
    let req <- rv_core.getDReq;
    cache.put(req);
    who_uses_cache.enq(Core);
endrule

rule requestAcc; // 加速器的内存访问请求
    let req <- accel.memReq;
    cache.put(req);
    who_uses_cache.enq(Accel);
endrule

rule responseCache; // 根据来源分发缓存响应
    let x <- cache.get;
    let origin = who_uses_cache.first; who_uses_cache.deq;
    if (origin == Core) rv_core.getDResp(x);
    else                accel.getDResp(x);
endrule
```

---

## 6. 性能考量

::: definition 定义 — PCIe 带宽瓶颈
片外（如 PCIe 连接）的加速器延迟高达 1 µs（约 4000 个 CPU 周期），带宽约 1–2 GB/s（PCIe Gen3/Gen4 每通道）。而 CPU–DRAM 带宽为 60–150 GB/s，GPU 内部带宽可达 ~1 TB/s。

**关键结论**：若 CPU 已能饱和 DRAM 带宽，片外 FPGA 加速器因 PCIe 带宽更低，反而会更慢！
:::

::: theorem 推论 — 加速器的适用条件
加速器在以下条件下最有价值：（1）高算术强度（计算量 / 内存访问量大）；（2）访问加速器的延迟远低于计算节省的时间；（3）应用具有足够规律性（矩阵乘法、FFT、AES）使专用硬件能发挥优势。对于内存带宽受限或不规则的应用，加速器收益有限。
:::

---

## 本讲小结

三种加速器集成模式：（1）寄存器-寄存器（AESENC，嵌入 CPU 核）；（2）MMIO 内存映射（NIC，片外/片上均适用）；（3）新增处理器指令（Gemmini/RoCC，片上紧耦合）。MMIO 必须绕过缓存；加速器与 CPU 共享内存需在 BSV 中用多路复用队列协调；PCIe 带宽限制了片外加速器的适用场景；软件集成（设备驱动、编译器支持）是加速器落地的真正挑战。
