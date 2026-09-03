---
title: 视觉设计
type: lecture
lecture: 14
tags: []
status: complete
---
# Lec 14 视觉设计

官方课件：[Visual Design](https://61040-fa25.github.io/assets/lecture-notes/visual-design-lec-export.pdf)。

本节 Lec 的目标：

- **理解** 视觉设计的核心要素——如何通过**布局**让界面易于理解； 如何运用**字体**排版，让界面兼具美感和逻辑清晰； 色彩如何影响界面的可用性和审美体验
- **实践** 学会在视觉设计中识别并综合运用这三大要素

## 理论篇

### 什么是好的视觉设计

好的视觉设计不仅仅是让界面"看起来漂亮"，更重要的是：

- 引导（*Guiding*）： 通过传达结构、表达元素的相对重要性、建立元素之间的关系来引导用户。
- 节奏（*Pacing*）：吸引用户进入应用， 帮助用户定位当前位置，指示下一步操作路径。

⚠ 视觉设计的挑战：它是**主观的**，涉及权衡取舍，不可能让每位用户都完全满意。但至少应做到：让用户清楚知道如何完成他们需要做的事。

🎯 **核心目标：**使界面自解释（*self-explanatory*）——在设计所用元素的前提下，清晰传达用户如何最好地实现他们的目标。

![截屏 2024-06-12 15.56.56](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/6669550493fd5.png)

上图又是自动门，都是拉门的、但是又没有拉环的设计，让人有点摸不着头脑。

### 布局

布局的核心原则：

- 对于网格系统，将元素对齐到网格，常用 12 列网格，配合留白（*Margin*）和兼具（*Guttter/Alley*）保证结构一致
- 尺寸= 层级： 元素大小传达重要性。大区域 = 主要操作（如搜索栏）；小区域 = 同等级的次要内容（如浏览网格）。
- 空白区分组： 留白可在视觉上区分不同的内容组，无需边框或分隔线，减少视觉噪音。

<div style="background: #fff7e6; border-radius:12px; padding: 12px 18px;">
<p>Margin： 页面两侧的外边距，保护内容不贴边；</p>
<p>Gutter / Alley： 列与列之间的间距；</p>
<p>标准 12 列：可灵活组合（1+11、4+8、6+6 等），适配多种布局需求</p>
</div>

![image-20260603073758091](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260603073758091.png)

-----

**用留白区分内容组**

![image-20260603073901170](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260603073901170.png)

不加留白：两组内容视觉上融合，用户难以区分边界，认知负担增加。

加入留白后： 无需边框，两组内容（Group 1 / Group 2）自然分离，结构清晰。

----

**用户如何浏览布局（*Navigation*）**

F 型扫描模式（*F-Pattern*）： 用户不会逐字阅读页面，而是**优先扫描**。

研究表明：

<div style="border:1px solid #ddd;border-radius:16px;overflow:hidden;margin:16px 0;">
<table style="width:100%;border-collapse:collapse;">
<tr>
<td style="width:25%;background:#e8f3ee;padding:20px;font-weight:bold;color:#2e8b57;border-right:1px solid #ddd;">起点</td>
<td style="padding:20px;">从页面左上角开始，向右水平扫描第一行</td>
</tr>
<tr>
<td style="padding:20px;font-weight:bold;color:#666;border-top:1px solid #ddd;border-right:1px solid #ddd;">第二行</td>
<td style="padding:20px;border-top:1px solid #ddd;">向下移动，再次向右扫描，但范围通常比第一行短</td>
</tr>
<tr>
<td style="padding:20px;font-weight:bold;color:#666;border-top:1px solid #ddd;border-right:1px solid #ddd;">竖向扫描</td>
<td style="padding:20px;border-top:1px solid #ddd;">沿左边缘垂直向下浏览，形成「F」形轨迹</td>
</tr>
<tr>
<td style="background:#e8f3ee;padding:20px;font-weight:bold;color:#2e8b57;border-top:1px solid #ddd;border-right:1px solid #ddd;">设计建议</td>
<td style="padding:20px;border-top:1px solid #ddd;">重要内容放左侧；避免居中对齐大段文字（左对齐更易扫描）</td>
</tr>
</table>
</div>

举几个例子：

![截屏 2024-06-12 17.36.24](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66696c2f7eea9.png)

![截屏 2024-06-12 17.37.40](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66696c7236734.png)

### 字体排印

字体排印（*Typography*）的几个术语

| 术语                             | 定义                                                         | 设计建议                                                     |
| :------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| 字号（*font size / point size*） | 字体的整体大小，从顶部到底部的测量值                         | 不同字体相同字号，视觉大小不同                               |
| x 高度（*x-height*）             | 小写字母"x"的高度，衡量字体的视觉大小                        | 小屏幕/低分辨率场景，优先选 x 高度大的字体（如 Lucida Grande） |
| 字重（*Weight*）                 | 字体笔画的粗细                                               | light / regular / semi-bold / bold / extra-bold / black，通过字重建立层级 |
| 衬线 vs 无衬线                   | Serif（如 Baskerville）有装饰性笔画；Sans-serif（如 Gill Sans）无装饰 | 两者可读性差异极小，选择主要影响**风格和调性**               |

![image-20260603083032112](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260603083032112.png)

----

文字对齐与空白

左对齐（推荐）：符合 F 型扫描习惯，易于快速扫读；课程名等列表信息的最佳对齐方式

居中对齐（谨慎使用）： 每行起点不固定，扫描困难；适合标题、短文字、对称布局；大段正文避免使用

排版中的层级示例（课程列表）

第一种，无层级， 课程号 + 课程名 + 教授名全部挤在一行，难以扫描

<img src="https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260603083248922.png" alt="image-20260603083248922" style="zoom:200%;" />

第二种， 教授名换行，但课程号和名称仍混在一起

![image-20260603083143005](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260603083143005.png)

第三种， 课程号加大加粗，课程名用正常字重，教授名用浅色字重，三层信息一目了然

![image-20260603083343052](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260603083343052.png)

### 色彩

#### 加色混合 vs 减色混合

- 加色混合（*Additive*）：用于数字显示屏。使用红、绿、蓝（RGB）三原色叠加，颜色相加变亮。 例：红 + 蓝 = 紫
- 见色混合（*Subtractive*）：用于印刷、电子纸。使用 CMYK 颜料，颜色相加变暗（吸收光线）

![image-20260603083537751](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260603083537751.png)

<div style="background:#fff5f5;border:1px solid #f2a0a0;border-radius:16px;padding:20px 28px;color:#c00;font-size:20px;line-height:1.8;margin:16px 0;"> ✕ RGB 有两大缺陷： ① 不符合我们自然表达颜色的方式； ② 并非感知均匀（perceptually uniform）——数值变化相同，但人眼感受到的变化不一致。 </div>

#### 颜色感知效应

同步对比（*Simultaneous Contrast*）： 两种颜色并排时会相互影响感知。Josef Albers 实验证明：同一颜色在不同背景下看起来完全不同。设计时需考虑颜色的**上下文环境**。

![image-20260603083842817](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260603083842817.png)

贝佐德效应（*Bezold Effect*）： 在颜色周围加深色边框，会使该颜色看起来更深。相同的颜色值，因边框不同而产生不同的视觉感受。

![image-20260603083947455](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260603083947455.png)

#### 颜色三属性

- 色调（*Hue*）： 我们通常所说的"颜色"本身：红、绿、蓝、黄等
- 饱和度（*Saturation*）： 颜色的"纯度"——含灰程度。饱和度越低，越接近灰色。
- 明度（*Lightness*）： 颜色的明暗程度。从暗到亮的连续变化。

##### 色温：暖色 vs 冷色

![image-20260603084142901](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260603084142901.png)

![image-20260603084222389](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260603084222389.png)

##### 色彩和谐

色彩和谐（*Color Harmonies*）

- 互补色（*Complementary*）
  - ✓高对比度，视觉冲击强
  - ✓吸引注意力
  - ✗不适合正文，阅读疲劳
- 类似色（*Analogous*）
  - ✓ 自然和谐，在自然界中常见
  - 选一个主色，其余为辅助/点缀色
  - 注意保证足够对比度
- 分裂互补（*Split Complementary*）
  - ✓ 类似互补色效果
  - ↑ 相邻颜色张力更小，更好驾驭
- 三角色 / 矩形色（*Triadic / Tetradic*）
  - 三角色：色环上均匀分布的三色
  - 矩形/正方形：四色组合
  - 更复杂，需控制好主次关系

### 设计批评框架

用这三个问题框架，进行建设性而非破坏性的设计反馈：

- **I like**: 指出设计中有效的部分，肯定已有的成功决策
- **I wish**：以期望而非批评的口吻，指出可以改进的方向
- **What if ?** ：提出探索性建议，激发设计者思考新的可能性

### 视觉设计速查表

<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; border: 2px solid #2b6cb0; border-radius: 16px; overflow: hidden; max-width: 800px; margin: 20px auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">

  <div style="background-color: #2b6cb0; color: #ffffff; padding: 18px 24px; font-size: 22px; font-weight: bold; text-align: left;">
    Visual Design Cheatsheet — 界面自解释目标
  </div>
  <div style="display: flex; flex-direction: row; min-height: 400px; line-height: 1.6;">
    <div style="flex: 1; padding: 24px; border-right: 1px solid #e2e8f0;">
      <h3 style="color: #2b6cb0; font-size: 20px; margin-top: 0; margin-bottom: 8px; font-weight: bold;">布局（Layout）</h3>
      <p style="color: #4a5568; font-style: italic; margin-bottom: 12px; font-size: 15px;">视觉组件如何组织和分组</p>
      <ul style="padding-left: 20px; color: #2d3748; font-size: 15px; margin: 0;">
        <li>将元素对齐到网格</li>
        <li>尺寸大小传达层级重要性</li>
        <li>留白区区分内容组</li>
        <li>用户优先扫描，从左上角开始</li>
        <li>遵循 F 型扫描路径</li>
      </ul>
    </div>
    <div style="flex: 1; padding: 24px; border-right: 1px solid #e2e8f0;">
      <h3 style="color: #2b6cb0; font-size: 20px; margin-top: 0; margin-bottom: 8px; font-weight: bold;">字体排印（Typography）</h3>
      <p style="color: #4a5568; font-style: italic; margin-bottom: 12px; font-size: 15px;">编排文字使语言易读且美观</p>
      <ul style="padding-left: 20px; color: #2d3748; font-size: 15px; margin: 0;">
        <li>字号因字体而异；小屏可用较大 x 高度</li>
        <li>衬线 vs 无衬线对可读性影响极小</li>
        <li>左对齐比居中更容易扫描</li>
        <li>留白区区分文字段落</li>
        <li>字重建立信息层级</li>
      </ul>
    </div>
    <div style="flex: 1; padding: 24px;">
      <h3 style="color: #2b6cb0; font-size: 20px; margin-top: 0; margin-bottom: 8px; font-weight: bold;">色彩（Color）</h3>
      <p style="color: #4a5568; font-style: italic; margin-bottom: 12px; font-size: 15px;">提升美感、建立氛围、传达分组</p>
      <ul style="padding-left: 20px; color: #2d3748; font-size: 15px; margin: 0;">
        <li>相邻颜色会相互影响感知</li>
        <li>颜色由色调、饱和度、明度定义</li>
        <li>数字界面用 RGB 或 hex 表达</li>
        <li>利用色轮定义调色板（Color Harmonies）</li>
      </ul>
    </div>
  </div></div>

## 实践篇

### Vue 进阶

官方教程入口：https://vuejs.org/tutorial

### 核心指令速查表

| 指令             | 简写     | 用途                                                    | Tutorial 步骤 |
| :--------------- | :------- | :------------------------------------------------------ | :------------ |
| `ref / reactive` | —        | 创建响应式变量。`ref` 用于基本类型；`reactive` 用于对象 | Step 2        |
| `v-bind:attr`    | `:attr`  | 将 HTML 属性绑定到动态 JS 变量，实现运行时赋值          | Step 3        |
| `v-on:event`     | `@event` | 绑定事件监听器，触发时调用对应函数                      | Step 4        |
| `v-if / v-else`  | —        | 条件渲染：根据变量值决定渲染哪个区块                    | Step 5        |
| 组件嵌套         | —        | 父子组件构成层级树结构，类似 DOM 树                     | Step 11       |
| `defineProps`    | —        | 父组件向子组件传递数据（Props）                         | Step 12       |
| `defineEmits`    | —        | 子组件向父组件发送数据（Emits）                         | Step 13       |

### 视觉设计分析

### 前端设计库

代表性工具：[Vuetify](https://vuetifyjs.com/en/)（Vue 生态中最流行的 Material Design 组件库）。

当我们知道什么是好的视觉设计之后，下一个问题是： 如何在代码中实现它？ 前端设计

## Rec 8：Visual Design Study 与前端设计库

官方课件：[More Vue + Visual Design Study + Visual Design Libraries](https://61040-fa25.github.io/assets/recitation_notes/61040-rec7.pdf)（2025 年 10 月 23 日）。

### 什么是"视觉设计研究"（Visual Design Study）

**定义**：一份视觉设计研究，探索色彩、布局、字体排印、图像等视觉选择，如何影响人们"看到什么、理解什么、感受到什么"。

**为什么要做**：目的是训练"设计师之眼"（*designer's eye*）——把前面讲的布局/字体/色彩这些抽象原则，放进具体案例里检验"什么有效、什么无效"。做完之后你会获得：

- **视觉素养**：学会分析字体、色彩、布局是如何共同起作用的
- **设计词汇**：能用"高对比度调色板""高 x 高度""强对齐"这类具体语言描述"为什么好看"，而不是只会说"好看"
- **灵感素材库**：收集可供自己设计时参考的视觉资料
- **有意图的设计选择**：能为自己选的颜色、字体说出理由，而不是凭直觉
- **模式识别能力**：在不同媒介、不同风格中发现反复出现的设计策略

### 三步做法

1. **收集灵感素材**：从海报、游戏、音乐专辑封面等任意视觉媒介中收集参考图（课件示例用了乐队 Parquet Courts 几张专辑封面：*Wide Awake!* 的鲜艳撞色插画风、*Human Performance* 的蓝色几何构图、*Neo-Politans* 的自然主题拼贴）
2. **组织成拼贴图并做批注**：把收集到的素材拼在一起，针对色彩标注主色、色彩关系与调色板选择（例如"冷蓝配三级色的绿与黄，营造都市自然感"）；针对字体排印标注字体、字号、位置、内容传达的情绪（例如"全大写、字距紧密，传递兴奋与混乱感，呼应封面内容"；"文字被切块打散分布在封面各处，传递失落感"）
3. **反思**：综合笔记，写出你学到了什么。课件示例的反思是：*Wide Awake!* 用大胆的互补色营造出适合朋克乐队的强烈能量感；转向 *Human Performance* 更冷的蓝绿黄色调，情绪随之软化为更安静的都市氛围；两张专辑的字体排印手法（紧凑大写 vs. 疏离破碎）恰好分别呼应了各自的情绪基调。

这个流程也正是 Assignment 4b/期末项目里"Visual Design Study"交付物（两页带标注的参考图收集）所要求的做法。

### 前端设计库（UI Component Libraries）

知道了什么是好的视觉设计之后，下一个问题是：怎么在代码里实现它？答案之一是使用**前端设计库**——预先写好、可直接复用的 UI 组件集合。Vue 生态里最常用的是 [Vuetify](https://vuetifyjs.com/en/)（一个"不需要设计技能"的开源 UI 库，提供大量精心设计好的 Vue 组件：按钮、卡片、列表、芯片标签、分割线、折叠面板等），此外还有 Chakra UI、MUI、Ant Design、React-Bootstrap 等（多数面向 React 生态）。

**优点**：

- 开箱即用大量样式和组件，减少从零造轮子的工作量
- 可复用组件保证界面视觉一致性（同一个 `v-btn` 在全站表现一致）
- 生成的代码更"可移植"，方便自己和协作者维护

**缺点**：

- 定制化可能很麻烦：想要"按钮不是灰色的"，往往要一路深入到主题配置（如 Material Design 的 `md.sys.color.primary` token）才能改动，改一个小细节可能牵涉一整套设计系统
- 组件默认样式可能和布局冲突（例如某些组件默认 `width: 100%`，在 flex 容器里会导致溢出问题，需要额外覆盖）
- 库本身可能过时或与所用框架版本不兼容（社区里常见"Vuetify 2 升级到 3 几乎没法迁移"这类抱怨）

选择是否使用设计库，本质上是"开发速度与视觉一致性"和"精细控制与长期维护成本"之间的权衡。

### Vue 补充：组件通信（Props 与 Emits）

延续 Lec 13 的响应式基础，这次习题课补充了父子组件之间双向传递数据的两种机制：

- **Props（父传子）**：父组件通过属性绑定把数据传给子组件，子组件用 `defineProps` 声明要接收的字段：
  ```vue
  <!-- Parent.vue -->
  <ChildComp :msg="greeting" />

  <!-- Child.vue -->
  <script setup>
  const props = defineProps({ msg: String })
  </script>
  ```
- **Emits（子传父）**：子组件通过 `defineEmits` 声明自己会触发哪些事件，调用 `emit(...)` 把数据"发射"回父组件；父组件用 `@事件名` 监听：
  ```vue
  <!-- Child.vue -->
  <script setup>
  const emit = defineEmits(['response'])
  emit('response', 'hello from child')
  </script>

  <!-- Parent.vue -->
  <ChildComp @response="(msg) => childMsg = msg" />
  ```

组件树的通信原则是：数据只能沿父子关系流动——父到子用 props，子到父用 emits，不存在跨层级的隐式共享状态；这与本课程"概念之间不共享状态、只能通过显式 Sync 通信"的设计哲学是一致的道理，只是发生在前端组件树这个更小的尺度上。
