---
title: 6.590 计算机系统架构
type: course
course: 6.590 计算机系统架构
course_id: '6.590'
tags: []
status: complete
---
# 6.590 计算机系统架构

[6.5900/6.823 Computer System Architecture - Fall24](https://csg.csail.mit.edu/6.5900/lecnotes.html)

## 先行条件

6.1910/6.004  Computating Structures

## 课程描述

介绍现代计算机架构的基本原理。强调在计算机架构演进过程中，技术、硬件组织和编程系统之间的关系。主题包括流水线、乱序执行和推测执行；缓存、虚拟内存和异常处理，超标量、超长指令字（VLIW）、向量和多线程处理器；片上网络、内存模型、同步以及多处理器的缓存一致性协议。

*Daniel Sanchez*

### 主题

**L-01**: Introduction & History of Calculation and Computer Architecture ([handout pdf](http://csg.csail.mit.edu/6.5900/Lectures/L01handout.pdf)) ([split pdf](http://csg.csail.mit.edu/6.5900/Lectures/L01split.pdf)) ([pdf](http://csg.csail.mit.edu/6.5900/Lectures/L01.pdf))

- **L-01**: Introduction & History of Calculation and Computer Architecture ([handout pdf](https://csg.csail.mit.edu/6.5900/Lectures/L01handout.pdf)) ([split pdf](https://csg.csail.mit.edu/6.5900/Lectures/L01split.pdf)) ([pdf](https://csg.csail.mit.edu/6.5900/Lectures/L01.pdf))
- **L-02**: Instruction Set Architecture and Caches ([handout pdf](https://csg.csail.mit.edu/6.5900/Lectures/L02handout.pdf)) ([split pdf](https://csg.csail.mit.edu/6.5900/Lectures/L02split.pdf)) ([pdf](https://csg.csail.mit.edu/6.5900/Lectures/L02.pdf))
- **L-03**: Cache Organization and Memory Management ([handout pdf](https://csg.csail.mit.edu/6.5900/Lectures/L03handout.pdf)) ([split pdf](https://csg.csail.mit.edu/6.5900/Lectures/L03split.pdf)) ([pdf](https://csg.csail.mit.edu/6.5900/Lectures/L03.pdf))
- **L-04**: Modern Virtual Memory Systems ([handout pdf](https://csg.csail.mit.edu/6.5900/Lectures/L04handout.pdf)) ([split pdf](https://csg.csail.mit.edu/6.5900/Lectures/L04split.pdf)) ([pdf](https://csg.csail.mit.edu/6.5900/Lectures/L04.pdf))
- **L-05**: Instruction Pipelining: Hazard Resolution, Timing Constraints ([handout pdf](https://csg.csail.mit.edu/6.5900/Lectures/L05handout.pdf)) ([split pdf](https://csg.csail.mit.edu/6.5900/Lectures/L05split.pdf)) ([pdf](https://csg.csail.mit.edu/6.5900/Lectures/L05.pdf))
- **L-06**: Complex Pipelining ([handout pdf](https://csg.csail.mit.edu/6.5900/Lectures/L06handout.pdf)) ([split pdf](https://csg.csail.mit.edu/6.5900/Lectures/L06split.pdf)) ([pdf](https://csg.csail.mit.edu/6.5900/Lectures/L06.pdf))
- **L-07**: Complex Pipelining: Out-of-Order Execution, Register Renaming,and Exceptions ([handout pdf](https://csg.csail.mit.edu/6.5900/Lectures/L07handout.pdf)) ([split pdf](https://csg.csail.mit.edu/6.5900/Lectures/L07split.pdf)) ([pdf](https://csg.csail.mit.edu/6.5900/Lectures/L07.pdf))
- **L-08**: Branch Prediction ([handout pdf](https://csg.csail.mit.edu/6.5900/Lectures/L08handout.pdf)) ([split pdf](https://csg.csail.mit.edu/6.5900/Lectures/L08split.pdf)) ([pdf](https://csg.csail.mit.edu/6.5900/Lectures/L08.pdf))
- **L-09**: Speculative Execution ([handout pdf](https://csg.csail.mit.edu/6.5900/Lectures/L09handout.pdf)) ([split pdf](https://csg.csail.mit.edu/6.5900/Lectures/L09split.pdf)) ([pdf](https://csg.csail.mit.edu/6.5900/Lectures/L09.pdf))
- **L-10**: Advanced Memory Operations ([handout pdf](https://csg.csail.mit.edu/6.5900/Lectures/L10handout.pdf)) ([split pdf](https://csg.csail.mit.edu/6.5900/Lectures/L10split.pdf)) ([pdf](https://csg.csail.mit.edu/6.5900/Lectures/L10.pdf))
- **L-11**: Multithreading Architectures ([handout pdf](https://csg.csail.mit.edu/6.5900/Lectures/L11handout.pdf)) ([split pdf](https://csg.csail.mit.edu/6.5900/Lectures/L11split.pdf)) ([pdf](https://csg.csail.mit.edu/6.5900/Lectures/L11.pdf))
- **L-12**: Cache Coherence ([handout pdf](https://csg.csail.mit.edu/6.5900/Lectures/L12handout.pdf)) ([split pdf](https://csg.csail.mit.edu/6.5900/Lectures/L12split.pdf)) ([pdf](https://csg.csail.mit.edu/6.5900/Lectures/L12.pdf))
- **L-13**: Directory-Based Cache Coherence ([handout pdf](https://csg.csail.mit.edu/6.5900/Lectures/L13handout.pdf)) ([split pdf](https://csg.csail.mit.edu/6.5900/Lectures/L13split.pdf)) ([pdf](https://csg.csail.mit.edu/6.5900/Lectures/L13.pdf))
- **L-14**: Memory Consistency ([handout pdf](https://csg.csail.mit.edu/6.5900/Lectures/L14handout.pdf)) ([split pdf](https://csg.csail.mit.edu/6.5900/Lectures/L14split.pdf)) ([pdf](https://csg.csail.mit.edu/6.5900/Lectures/L14.pdf))
- **L-15**: On-chip Networks I: Topology and Flow Control ([handout pdf](https://csg.csail.mit.edu/6.5900/Lectures/L15-handout.pdf)) ([split pdf](https://csg.csail.mit.edu/6.5900/Lectures/L15-split.pdf)) ([pdf](https://csg.csail.mit.edu/6.5900/Lectures/L15.pdf))
- **L-16**: On-chip networks II: Router Microarchitecture and Routing ([handout pdf](https://csg.csail.mit.edu/6.5900/Lectures/L16-handout.pdf)) ([split pdf](https://csg.csail.mit.edu/6.5900/Lectures/L16-split.pdf)) ([pdf](https://csg.csail.mit.edu/6.5900/Lectures/L16.pdf))
- **L-17**: Transactional Memory ([handout pdf](https://csg.csail.mit.edu/6.5900/Lectures/L17handout.pdf)) ([split pdf](https://csg.csail.mit.edu/6.5900/Lectures/L17split.pdf)) ([pdf](https://csg.csail.mit.edu/6.5900/Lectures/L17.pdf))
- **L-18**: Microcoded and VLIW Processors ([handout pdf](https://csg.csail.mit.edu/6.5900/Lectures/L18handout.pdf)) ([split pdf](https://csg.csail.mit.edu/6.5900/Lectures/L18split.pdf)) ([pdf](https://csg.csail.mit.edu/6.5900/Lectures/L18.pdf))
- **L-19**: Reliability ([handout pdf](https://csg.csail.mit.edu/6.5900/Lectures/L19handout.pdf)) ([split pdf](https://csg.csail.mit.edu/6.5900/Lectures/L19split.pdf)) ([pdf](https://csg.csail.mit.edu/6.5900/Lectures/L19.pdf))
- **L-20**: Vector Computers ([handout pdf](https://csg.csail.mit.edu/6.5900/Lectures/L20handout.pdf)) ([split pdf](https://csg.csail.mit.edu/6.5900/Lectures/L20split.pdf)) ([pdf](https://csg.csail.mit.edu/6.5900/Lectures/L20.pdf))
- **L-21**: GPUs ([handout pdf](https://csg.csail.mit.edu/6.5900/Lectures/L21handout.pdf)) ([split pdf](https://csg.csail.mit.edu/6.5900/Lectures/L21split.pdf)) ([pdf](https://csg.csail.mit.edu/6.5900/Lectures/L21.pdf))
- **L-22**: Security ([handout pdf](https://csg.csail.mit.edu/6.5900/Lectures/L22handout.pdf)) ([split pdf](https://csg.csail.mit.edu/6.5900/Lectures/L22split.pdf)) ([pdf](https://csg.csail.mit.edu/6.5900/Lectures/L22.pdf))
- **L-23**: Accelerators (I) ([handout pdf](https://csg.csail.mit.edu/6.5900/Lectures/L23handout.pdf)) ([split pdf](https://csg.csail.mit.edu/6.5900/Lectures/L23split.pdf)) ([pdf](https://csg.csail.mit.edu/6.5900/Lectures/L23.pdf))
- **L-24**: Accelerators (II) ([handout pdf](https://csg.csail.mit.edu/6.5900/Lectures/L24handout.pdf)) ([split pdf](https://csg.csail.mit.edu/6.5900/Lectures/L24split.pdf)) ([pdf](https://csg.csail.mit.edu/6.5900/Lectures/L24.pdf))

### 参考书

- **H&P6:** *Computer Architecture: A Quantitative Approach*, 6th edition, by Hennessy and Patterson
- **P&H:** *Computer Organization & Design, by Patterson and Hennessy*
- **D&T:** *Principles and practices of interconnection networks* by Dally and Towles

![截屏 2024-06-23 23.15.58](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66783c47a6265.png)

![截屏 2024-06-23 23.16.41](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66783c6142f22.png)

- -

#### 学习材料

6.5900[6.823] Fall 2023 Study Materials

Prerequisite Self-Assessment Test ([pdf](http://csg.csail.mit.edu/6.5900/StudyMaterials/self-test/self-test.pdf)) and accompanying handout ([pdf](http://csg.csail.mit.edu/6.5900/StudyMaterials/self-test/self-test-handout.pdf)) [Posted on 9/6]

**Study Materials for Quiz 1 (L01-L09)**

- Problem Set Handouts
  - [Handout 1 - EDSACjr](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/handouts/handout1-edsac.pdf)
  - [Handout 2 - CISC x86](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/handouts/handout2-x86.pdf)
  - [Handout 3 - RISC MIPS](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/handouts/handout3-mips.pdf)
  - [Handout 4 - Cache](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/handouts/handout4-cache.pdf)
  - [Handout 5 - Victim Cache](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/handouts/handout5-victim-cache.pdf)
  - [Handout 6 - Virtual Memory](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/handouts/handout6-virtual-memory.pdf)
  - [Handout 7 - Nested Paging](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/handouts/handout7-nested-paging.pdf)
  - [Handout 8 - L-MIPS ISA](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/handouts/handout8-lmips.pdf)
  - [Handout 9 - BigMIPS ISA](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/handouts/handout9-bigmips.pdf)
  - [Handout 11 - In-order Scoreboarding](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/handouts/handout11-scoreboarding.pdf)
  - [Handout 12 - Out-of-order with Re-order Buffer (ROB)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/handouts/handout12-rob.pdf)
- Problem Sets
  - [Problem Set 1](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/pset1.pdf) (L01) [(Solution)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/pset1_sol.pdf)
  - [Problem Set 2](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/pset2.pdf) (R01) [(Solution)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/pset2_sol.pdf)
  - [Problem Set 3](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/pset3.pdf) (L02) [(Solution)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/pset3_sol.pdf)
  - [Problem Set 4](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/pset4.pdf) (L03-04) [(Solution)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/pset4_sol.pdf)
  - [Problem Set 5](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/pset5.pdf) (R02, L05) [(Solution)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/pset5_sol.pdf)
  - [Problem Set 6](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/pset6.pdf) (L06-07) [(Solution)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/pset6_sol.pdf)
  - [Problem Set 7](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/pset7.pdf) (L08) [(Solution)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/pset7_sol.pdf)
  - [Problem Set 8](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/pset8.pdf) (L09) [(Solution)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/pset8_sol.pdf)
- Past Quizzes & Related Handouts
  - [Spring 2021 Quiz 1 Handout - Predication](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/past_quizzes/handout-predication.pdf)
  - [Spring 2021 Quiz 1](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/past_quizzes/quiz1_sp2021.pdf) [(Solution)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/past_quizzes/quiz1_sp2021_sol.pdf)
  - [Spring 2021 Quiz 2 Handout - Reservation Stations](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/past_quizzes/handout-reservationstation.pdf)
  - [Spring 2021 Quiz 2 Handout - Store Sets](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/past_quizzes/handout-storesets.pdf)
  - [Spring 2021 Quiz 2](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/past_quizzes/quiz2_sp2021.pdf) (Skip part C, and any questions related to load/store buffers) [(Solution)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/past_quizzes/quiz2_sp2021_sol.pdf)
  - [Fall 2021 Quiz 1 Handout](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/past_quizzes/quiz1_fa2021_handout.pdf)
  - [Fall 2021 Quiz 1](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/past_quizzes/quiz1_fa2021.pdf) [(Solution)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/past_quizzes/quiz1_fa2021_sol.pdf)
- **Quiz 1 Handouts**
  - [Fall 2023 Quiz 1 Handout: OoO processor with reservation stations](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/handouts/handout-reservationstations.pdf)
  - [Fall 2023 Quiz 1 Handout: Predication](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/handouts/handout-predication.pdf)
- [Quiz 1 Solutions](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz1/quiz1-sol.pdf)

**Study Materials for Quiz 2 (L10-L16)**

- Handouts
  - [Handout 13 - Directory Protocol](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz2/handouts/handout13-directory.pdf)
  - [Handout 14 - Snoopy Protocol](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz2/handouts/handout14-snoopy-protocol.pdf)
  - [Handout 15 - Single-producer/Multi-consumer Shared-Memory Queues](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz2/handouts/handout15-queue.pdf)
  - [Handout 16 - Router Architecture](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz2/handouts/handout16-router_architecture.pdf)
- Problem Sets
  - [Problem Set 9 (L10)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz2/pset9.pdf) [(Solution)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz2/pset9_sol.pdf)
  - [Problem Set 10 (L11)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz2/pset10.pdf) [(Solution)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz2/pset10_sol.pdf)
  - [Problem Set 11 (L12-13)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz2/pset11.pdf) [(Solution)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz2/pset11_sol.pdf)
  - [Problem Set 12 (L15-L16)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz2/pset12.pdf) [(Solution)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz2/pset12_sol.pdf)
  - [Problem Set 13 (L14)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz2/pset13.pdf) [(Solution)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz2/pset13_sol.pdf)
- Past Quizzes & Related Handouts
  - [Spring 2021 Quiz 3 Handout](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz2/past_quizzes/quiz3_sp2021_handout.pdf)
  - [Spring 2021 Quiz 3](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz2/past_quizzes/quiz3_sp2021.pdf) [(Solution)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz2/past_quizzes/quiz3_sp2021_sol.pdf)
  - [Fall 2021 Quiz 2](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz2/past_quizzes/quiz2_fa2021.pdf) [(Solution)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz2/past_quizzes/quiz2_fa2021_sol.pdf)
- **Quiz 2 Handout**
  - [Fall 2023 Quiz 2 Handout: MSI Coherence Protocol](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz2/handouts/quiz2-handout.pdf)
- This Year's Quiz
  - [2023 Quiz 2](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz2/quiz2.pdf)
  - [(Solution)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz2/quiz2-sol.pdf)

**Study Materials for Quiz 3 (L17-L25)**

- Handouts

  - [Handout 17 - Bus-Based MIPS Implementation](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz3/handouts/handout17.pdf)

- Problem Sets

  - [Problem Set 14 (L17-18)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz3/pset14.pdf) [(Solution)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz3/pset14_sol.pdf)
  - [Problem Set 15 (L19)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz3/pset15.pdf) [(Solution)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz3/pset15_sol.pdf)
  - [Problem Set 16 (L21)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz3/pset16.pdf) [(Solution)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz3/pset16_sol.pdf)

- Past Quizzes & Related Handouts

  - [Fall 2021 Quiz 3 Handout](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz3/past_quizzes/quiz3_fa2021_handout.pdf)
  - [Spring 2021 Quiz 4](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz3/past_quizzes/quiz4_sp2021.pdf) [(Solution)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz3/past_quizzes/quiz4_sp2021_sol.pdf)
  - [Fall 2021 Quiz 3](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz3/past_quizzes/quiz3_fa2021.pdf) [(Solution)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz3/past_quizzes/quiz3_fa2021_sol.pdf)

- **Quiz 3 Handout**

  - [Fall 2023 Quiz 3 Handout: Hardware Transactional Memory Implementation](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz3/quiz3-tm-handout.pdf)

  This Year's Quiz

  - [2023 Quiz 3](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz3/quiz3.pdf)
  - [(Solution)](http://csg.csail.mit.edu/6.5900/StudyMaterials/quiz3/quiz3-sol.pdf)

### Recitation

- **Tutorial 1**: Hardwired, Single-Cycle ISA Implementation ([pdf](http://csg.csail.mit.edu/6.5900/Recitations/R01-SingleCycle.pdf)) ([split pdf](http://csg.csail.mit.edu/6.5900/Recitations/R01-SingleCycle-split.pdf))
- **Tutorial 2**: Instruction Pipelining ([pdf](http://csg.csail.mit.edu/6.5900/Recitations/R02-InstructionPipelining.pdf)) ([split pdf](http://csg.csail.mit.edu/6.5900/Recitations/R02-InstructionPipelining-split.pdf))
- **Tutorial 3**: Complex Pipelines ([pdf](http://csg.csail.mit.edu/6.5900/Recitations/R03-ComplexPipelines.pdf))
- **Tutorial 4**: Branch Prediction ([pdf](http://csg.csail.mit.edu/6.5900/Recitations/R04-BranchPrediction.pdf))
- **Review 1**: [Quiz 1 Review](http://csg.csail.mit.edu/6.5900/Recitations/Review1-Quiz1.pdf)
- **Tutorial 6**: [Cache Coherence](http://csg.csail.mit.edu/6.5900/Recitations/R06-CacheCoherence.pdf)
- **Tutorial 7**: [Memory Consistency](http://csg.csail.mit.edu/6.5900/Recitations/R07-MemoryConsistency.pdf)
- **Tutorial 8**: [Networks Problem Set Solutions](http://csg.csail.mit.edu/6.5900/Recitations/R08-solutions.pdf)
- **Review 2**: [Quiz 2 Review](http://csg.csail.mit.edu/6.5900/Recitations/Review2-Quiz2.pdf)
- **Tutorial 9**: [Vector Processors and GPUs](http://csg.csail.mit.edu/6.5900/Recitations/R09-VLIW_Vectors_GPUs.pdf) ([GPU puzzles](https://github.com/srush/GPU-Puzzles))
- **Review 3**: [Quiz 3 Review](http://csg.csail.mit.edu/6.5900/Recitations/Review3-Quiz3.pdf)

## Lab(MIT Authorization required)

- **Video Tutorial**: Introduction to Pin ([link](https://mit.zoom.us/rec/share/ePZvFKnyOxSH-BHoOu3e3PfD7PiT1JV1KIqr0cPzzXaV2FrowKkpb2za6gDoCG3-.j3KZ3vNt3JGQWXzT?startTime=1613758063000)) ([pdf](http://csg.csail.mit.edu/6.5900/Recitations/Pin-Intro.pdf))
- **Video Tutorial**: Pin Optimizations ([link](https://mit.zoom.us/rec/share/uKatO8vFk3kpZ7Pqkk4-19ll3dUUxtvNSfwbRSjEiojP46au9kHMgL8DB_TL0-iJ.LRQ3fZ_0eKxItK5E )) ([pdf](http://csg.csail.mit.edu/6.5900/Recitations/Pin-Optimizations.pdf))
- Lab1: [pdf](http://csg.csail.mit.edu/6.5900/labs/lab1.pdf). Due **Sep 29**.
- Lab2: [pdf](http://csg.csail.mit.edu/6.5900/labs/lab2.pdf). Due **Oct 20**.
- Lab3: [pdf](http://csg.csail.mit.edu/6.5900/labs/lab3.pdf). Due **Nov 8**.
- Lab4: [pdf](http://csg.csail.mit.edu/6.5900/labs/lab4.pdf). Due **Dec 8**.

## 相关课程

[苏黎世理工 Computer Architecture - Fall 2019](https://safari.ethz.ch/architecture/fall2019/doku.php?id=schedule)

# Lec 1 计算机体系架构的介绍

[lec1.md](./lec1.md)

# Lec 2 指令集架构和缓存

[lec2.md](./lec2.md)

# Lec 3 缓存组织和内存管理

[lec3.md](./lec3.md)

# Lec 4 现代虚拟存储系统

[lec4.md](./lec4.md)

# Lec 5 指令流水线： 危机解决，时间限制

[lec5.md](./lec5.md)

# Lec 6 复杂流水线

[lec6.md](./lec6.md)

# Lec 7 复杂流水线：乱序执行，寄存器重命名，异常

[lec7.md](./lec7.md)

# Lec 8 分支预测

[lec8.md](./lec8.md)

# Lec 9 推测执行

[lec9.md](./lec9.md)

# Lec 10 高级内存操作

[lec10.md](./lec10.md)

# Lec 11 多线程技术

[lec11.md](./lec11.md)

# Lec 12 缓存一致性

[lec12.md](./lec12.md)

# Lec 13 目录式缓存一致性

[lec13.md](./lec13.md)

# Lec 14 内存一致性模型

[lec14.md](./lec14.md)

# Lec 15 片上网络 I： 拓扑 & 流控

这节 Lec 我们将专注于连接共享内存处理器的缓存的片上网络。

[lec15.md](./lec15.md)

# Lec 16 片上网络 II：路由 & 架构

[lec16.md](./lec16.md)

# Lec 17 事务性内存

[lec17.md](./lec17.md)

# Lec 18 微码与 VLIW 处理器

[lec18.md](./lec18.md)

# Lec 19 可靠性

[lec19.md](./lec19.md)

# Lec 20 向量计算机

[lec20.md](./lec20.md)

# Lec 21 GPU

[lec21.md](./lec21.md)

# Lec 22 安全

[lec22.md](./lec22.md)

# Lec 23 加速器 I

[lec23.md](./lec23.md)

# Lec 24 加速器 II

[lec24.md](./lec24.md)
