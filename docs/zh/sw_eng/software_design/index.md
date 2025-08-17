# Introduction

## Description

这门课是关于设计的。你将学习如何设计适合用途的软件：满足用户需求，并且灵活、强大且易于使用。

设计发生在技术与人之间的交汇点。这不仅仅是关于用户界面；课程的很大一部分内容是关于如何塑造用户体验的基本功能。

课程教授的设计材料包括经典的用户界面设计（例如启发式评估）和数据建模材料，也包括前沿的功能塑造（概念设计）和伦理学（价值敏感设计）材料。

这门课不是关于技术的，我们假设你已经熟练掌握了TypeScript，对HTML/CSS有基本的了解，并且在Node.js中进行过一些编程。先修课程6.1020（6.031）教授所有这些内容，并提供有用的复习笔记。

尽管如此，你还是会学习一些新工具和新技术，以确保你拥有成为熟练的web栈开发人员所需的所有工具。这些工具包括：用于维护代码库的GitHub和用于托管静态网站的GitHub Pages；静态网站生成器VitePress；用于部署Node.js的Heroku；用于线框图制作的Figma；用于持久存储的MongoDB；以及前端响应式框架Vue。

## Schedule

6.1040 Software Design

## Preps 

**Prerequisites** are 6.1020 **Software Construction** (6.031) and 6.1200[J] **Mathematics for Computer Science** (6.042)

### 1: Setting up Personal Website using Vitepress

**Background**: In this prep, you will set up a personal website that will be a kind of design portfolio for all your work this term, including blog posts and (the non-code parts of) your assignments. To do this, you will use a *static site generator* called VitePress. There are several popular generators, each of which is based on a particular programming language or framework; Hugo, for example, uses the Go language. We have chosen VitePress because it uses Vue.js, the same front-end framework you’ll be using in your assignments.

**Purpose**: To set up your portfolio website using [VitePress](https://vitepress.dev/) and [Github Pages](https://docs.github.com/en/pages). By the end of this prep, you will have a working site that is deployed in Pages and accessible on the web.

### 2: Node.js and Express.js

### 3: MongoDB

### 4: HTML + CSS

### 5: Vue.js 

## Assignments

Recitations are not assigned

[Assignment 1: Social Media Needfinding](https://61040-fa23.github.io/assignments/assignment-1)

[Assignment 2: Divergent Design](https://61040-fa23.github.io/assignments/assignment-2)

[Assignment 3: Convergent Design](https://61040-fa23.github.io/assignments/assignment-3)

[Assignment 4: Backend Design & Implementation](https://61040-fa23.github.io/assignments/assignment-4)

[Assignment 5: Frontend Design & Implementation](https://61040-fa23.github.io/assignments/assignment-5)

[Project 0: Team Formation](https://61040-fa23.github.io/assignments/assignment-p0)

[Assignment 6: User Testing & Analysis](https://61040-fa23.github.io/assignments/assignment-6)

## Project

[Project Overview](https://61040-fa23.github.io/assignments/assignment-p0-overview)

[Project Phase 1: Impact Case](https://61040-fa23.github.io/assignments/assignment-p1)

[Project Phase 2: Divergent Design](https://61040-fa23.github.io/assignments/assignment-p2)

[Project Phase 3: Convergent Design](https://61040-fa23.github.io/assignments/assignment-p3)

[Project Phase 4: Alpha Release](https://61040-fa23.github.io/assignments/assignment-p4)

[Project Phase 5: Beta Release](https://61040-fa23.github.io/assignments/assignment-p5)

[Project Phase 6: User Testing & Final Release](https://61040-fa23.github.io/assignments/assignment-p6)

## Textbook





### Vitepress

- [Vitepress Template](https://github.com/61040-fa23/vitepress-template)
- [Vitepress Documentation](https://vitepress.dev/)

### Logistics

- [6.1040 general feedback form](https://tinyurl.com/61040-fa23-feedback)
- [Slack day request form](https://forms.gle/6sDjGKzDy5h9Rq3L9)

### Guides

- [Implementing Concepts in TypeScript](https://61040-fa23.github.io/pages/concept-implementations.html)
- [Notes on Data Modeling](https://61040-fa23.github.io/pages/data-modeling.html)
- [Final project deployment guidance](https://61040-fa23.github.io/pages/deployment.html)
- [Final Project Domains](https://61040-fa23.github.io/pages/final-project-domains.html)
- [Final Project Goals & Scope](https://61040-fa23.github.io/pages/final-project-outline.html)
- [Git & GitHub & GitHub Classroom](https://61040-fa23.github.io/pages/git-github-classroom.html)
- [What I wish I’d known about website builders](https://61040-fa23.github.io/pages/site-builders.html)

### External Links

- [Express.js official documentation](https://expressjs.com/)
- [express-session official documentation](https://www.npmjs.com/package/express-session)
- [Introduction to backend programming (MDN)](https://developer.mozilla.org/en-US/docs/Learn/Server-side/First_steps/Introduction)
- [Express tutorial (MDN)](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs)



# Lec 1 建立静态网站



**静态网站(Static Sites)**

> 静态网站是指用户通过浏览器只能读取内容而不能修改内容的网站。
>
> 实现方式：
>
> - 从头开始使用 HTML + CS 
> - 使用网站构建工具（Website Builders）：Wix、Squarespace 等，提供了一种非常简单和直观的方式来创建网站，无需编写代码
> - 静态网站生成器: 将内容（如Markdown文件）转换为HTML文件的工具

**内容管理系统(CMS)**

> CMS（如Drupal或WordPress）允许较大的用户群查看网站内容，但只有一小部分用户可以修改网站内容。
>
> 静态网站通过常规的文件编辑机制编辑页面，而CMS则通过网站本身的编辑模式来编辑内容。

**网站生成器(Static Site Generator)**

> VitePress 将是我们用的框架，这个框架以Vue.js和Node.js为基础，风格可以用CSS和Vue来定制。

**VitePress**

> Frontmatter: 是关于一个网页的metadata，它位于markdown文件的顶部，如图
>
> ```markdown
> ---
> title: Blog 1
> ---
> ```
>
> Layout：代表某种产生网页的方式，VitePress 有三种默认的方式： doc，page和home
>
> Collection: 一个集合就是将一些文件视为一个集合，在集合目录里面，你可以用一个导出文件进行export

**练习**

> Exercise: Adding an about me page 1. 
>
> Find a partner and introduce yourself! 2. Work together to add an about me page to your site (each  partner should make a page for themselves) a. Step 1: create a new file, `about.md` and navigate to `/about.html` on your site b. Step 2: add a bio (who you are, where you’re from, and what  you’re looking forward to in 6.1040) c. Step 3: add a profile picture to your page d. Step 4: add a link to your about me page to the navbar
>
> Further Customization ● Further customization can be done by writing additional Vue or  CSS ● You can try playing around with this in a few weeks after  learning HTML + CSS!

# Lec 2 价值敏感设计(VSD)

学习目标

- 价值敏感设计(Value-Sensitive Design)

- 发散和收敛： 从功能到概念

  - 理解“分歧/汇聚”的概念

  - 通过进行分歧设计来进行实践

  - 学习概念作为软件模块的基本概念

  - 通过进行汇聚设计来进行实践

  - 学习如何使用依赖图表达子集

- 



## 价值敏感设计

主要是研究如何在設計資訊系統時如何將人的價值一併納入設計之中(an approach to account for human values in the design of information systems)。其初衷在於確保我們在設計一個系統、產品、或是服務之時，能夠給予直接和間接利害者(Stakeholder)正確且正向的價值，並減少其可能帶來的負面影響。VSD的研究對象則是利害者，他們可以是直接和產品/服務/系統的人或團體，但也包含因為這些互動而被影響到的其他人或是團體，其所強調的是設計出可以盡可能給予所有利害者最大正向價值(Value)的產品，並同時針對其可能帶來的負向影響預先做出規劃和解決。

价值敏感设计的4**个标准**

- Stakeholders 利益相关者： 直接利益相关者，间接利益相关者，非目标群青少年，能力的差异，转手，个人多职能
  - 比如导航，给direct Stakeholders选择一条便捷的路线同时，可能给原本安静的街道邻居indirect Stakeholders带来麻烦
  - 导航系统不仅要考虑一般驾驶员，还要考虑老年人，残疾人，驾驶经验不足者，确保能够适应不同的需求和能力。
- Time 时间：受城市规划的长期视角启发，时间标准帮助设计师考虑其工作的长期影响——这些影响只会在技术经历了初期的新奇阶段并逐渐融入社会后才会显现出来。
- Pervasiveness 普及性： 普及性标准强调了交互技术广泛采用后产生的系统性相互作用。技术可以在地理（例如，城市导航软件在城市地区的使用）、文化（例如，聋人社区内的短信交流）、人口统计学（例如，青少年在线社交网络）等方面变得普及；
- Value 价值：价值标准强调技术对人类价值观的影响。我们对价值的使用源自价值敏感设计文献，“人或一群人在生活中认为重要的事物”[3]



## 发散和收敛： 从功能到概念

![截屏2024-06-11 16.50.06](http://14.103.135.111:49153/i/66680fc8ad583.png)

### 发散设计的技术

- 头脑风暴

  - 产生好的主意，需要合作，多接纳想法

  **gap analysis**

  what’s missing in existing apps? 

  **viability**

  is critical mass needed?

  who will generate content? 

  where will revenue come from? 

  **analogies** 

  are there similar apps or features？

- 横向思考

  - 生成争议性的创意：采用一个糟糕的想法并追求它 ，用来识别和挑战假设 专注于问题被忽视的方面

- 搜寻灵感

  - 在商店和图书馆翻阅书籍 沉迷于互联网的兔子洞 专注于不寻常的事物

![截屏2024-06-11 16.57.42](http://14.103.135.111:49153/i/66681191195dc.png)

## 依赖的源头

> [!IMPORTANT]
>
> 如果依赖图展示了依赖关系，那独立的概念是什么呢？
>
> **两种依赖**
>
> 外部依赖： 使用的上下文角度看
>
> 内部依赖： 软件组件本身角度
>
> 这两种依赖是非耦合，他们呢之间没有任何依赖。
>
> 内部依赖的例子： 调用另一个函数的函数：一个调用另一个函数的函数。引用另一个对象的类：一个引用另一个对象的类

**允许内部依赖的标准**

当下面条件都满足时，  我们说A允许“使用”B

- 本质上A更加简单，因为它使用了B
- 本质上B不是更复杂，这是因为B不能使用A
- 有一个包含B但不包含A的子集
- 没有一个包含A但不包含B的有用子集合

![截屏2024-06-11 20.55.13](http://14.103.135.111:49153/i/6668493d67a9b.png)

## 原型图wireframe

![截屏2024-06-11 21.13.55](http://14.103.135.111:49153/i/66684dd3db155.png)

**定义**：What is a Wireframe? Wireframes are illustrations or other visual mockups that represent the skeletal framework of a website / other user interface

**作用**

Some important reasons:

 ● Faster Interaction Prototyping and Iterative Design

​	 ○ Writing code for interfaces often takes more time than drawing what they look like 

​	○ To this end, allows rounds of feedback to be given before anything is set in stone in code 

● Better visualization of potential usage and interactions

 ● Potentially better consistency and more intentional use of repeated elements



Our focus in this class is to use wireframes to dictate layout, functionality, and user experience

● Color and aesthetic elements, though useful, are less important for the class 

● The goal is to convey your idea and provide a visualization and basic interactive flow that is concrete enough for the viewer to fill in the remaining details with their imagination to understand what the webpage will eventually look like and feel like 



But why learn wireframing if I'll just be writing software? ● Knowing how to wireframe will allow you to interface better with designers/PMs ○ Allows you to potentially contribute to ideating as well, since you might have more specific technical knowledge that can add new perspectives ● You never know when you might be put in a position where you have to wear a designer "hat" ○ E.g. sometimes it's helpful to be able to throw together a quick visualization of an idea that you want feedback for – being able to create it yourself allows you to shorten the time it takes to achieve this ○ E.g. In cases where you might not be working in big teams with specific designers (i.e. you're creating a personal portfolio website or working on some other personal project), being able to create wireframes can make it much easier to implement your vision and to separate the designing and coding steps of the project ● Wireframing is a kind of prototyping, and just like how you can test a design by building a minimum viable product (MVP) or paper prototype, you can test a design with wireframes ○ Conceptual design tends to be very abstract, and it can be hard to anticipate the problems that will arise during actual use. However, when you build a wireframe, it becomes more concrete, and you can more easily see and address these potential problems

In industry settings, wireframes can be very detailed (high-fidelity), to the point where it's essentially visually identical to the eventual webpage that the engineer is supposed to build.



Wireframing Tools Figma: Industry standard and what we'll be using in class this semester 6.1040 Fall 2023, Recitation 2 ● Besides just wireframing, it can also be used for graphic design, prototyping, charts/visualizations, etc. Other tools: Adobe XD, Whimsical, Penpot

### Figma

Setup Create a free account at https://www.figma.com/. If you use your student email to sign up, you can upgrade to an Education plan for free: https://www.figma.com/education/ 

● Has the same benefits as a professional plan 

**Figma walkthrough**

 During recitation, we walked through basic Figma features by creating a simplified YouTube Homepage view using Figma. 

The final Figma file: https://www.figma.com/file/zoPLZDd6j9obwZCOasta8Z/R2-Wireframing-Intro?type=desig n&node-id=0%3A1&mode=design&t=unKXHEE2jJVExegj-1



**Important concepts** 

● Frames: containers for designs, often used to denote pages ○ Can be contained within other frames ● Inserting and manipulating shapes and text ● Components ○ Main component: Defines properties of the component ○ Instances of a component: Copies of a component that you can reuse in your own designs. Changes to the main component will affect all instances of the component ● Layers: Each object is a layer, but these objects can be grouped into more conceptually "layer-like" things (this is confusing terminology) ● User interactions (Prototype > Interactions) ○ Used to dictate interactive flow, which is one of the things we want to display in wireframes for this class ○ A set of interactions creates a user flow ● Plugin

### 相关链接

● https://www.figma.com/blog/how-to-wireframe/ 

● https://designlab.com/figma-101-course/introduction-to-figma/ 

● Figma for Beginners video

● Figma Documentation

 ● Components:  https://help.figma.com/hc/en-us/articles/360038662654-Guide-to-components-in-Figma 

● Prototyping, Interactions, Flows:  https://help.figma.com/hc/en-us/articles/360040314193-Guide-to-prototyping-in-Figma

## 总结

软件不是中立的。

软件开发涉及到一系列或多或少的设计选择和利弊权衡。

每个设计决定都

# Lec 3 概念设计基础

# Lec 4概念设计迁移

# Lec5 服务设计

# Lec6 数据设计

# Lec 8 反应式编程Reactive Programming 

![截屏2024-06-12 06.04.18](http://14.103.135.111:49153/i/6668c9f0f14d1.png)

```js
import {Sidebar} from './Sidebar.html'
ToggleBtn.addEventListener('click', (event)=>	{
  const opacity = Sidebar.style.opacity;                               if (opacity == 0) Sidebar.style.opacity = 1;
  else Sidebar.style.opacity = 0;
})
```

# Lec 9 UI交互设计

# Lec 10 UI虚拟设计

# Lec11 视觉设计

> [!IMPORTANT]
>
> What is good visual design?
>
> 让事物变得更加美观？
>
> 是的！但如果能做到以下会更佳
>
> 通过传达结构、相对重要性、关系来引导用户
>
> 通过吸引用户进入您的应用程序、定位他们并显示要去哪里来调整用户的速度。
>
> ![截屏2024-06-12 15.56.36](http://14.103.135.111:49153/i/666954d1f261b.png)
>
> ![截屏2024-06-12 15.56.56](http://14.103.135.111:49153/i/6669550493fd5.png)
>
> ![截屏2024-06-12 16.01.47](http://14.103.135.111:49153/i/666955f842303.png)
>
> 这里有几个关键点。
>
> 1. **传达结构**：好的视觉设计应该能够清晰地展示界面的组织结构。例如，使用一致的布局、颜色和字体来区分不同部分，让用户能够快速理解页面的层次和组成。
> 2. **相对重要性**：通过视觉元素的大小、颜色、对比度等来强调不同元素的重要性。例如，一个突出的按钮或标题应该在界面上更显眼，以引导用户的注意力。
> 3. **关系**：视觉设计可以通过排列、对齐和间距来表达元素之间的关系。例如，相关的内容应该靠近，不相关的内容应该分开。
> 4. **吸引用户**：好的视觉设计应该能够吸引用户的眼球，让他们愿意停留在界面上。这可以通过吸引人的颜色、图像、动画等来实现。
> 5. **定位和导航**：视觉设计应该帮助用户快速定位所需的信息，并指导他们前进的方向。例如，导航菜单、按钮和链接应该清晰明了，让用户知道如何继续操作。

> [!IMPORTANT]
>
> **Gestalt原则**是一组关于人类视觉感知的原则。
>
> - **Prägnanz法则**：这个法则强调，当人们面对复杂的形状或一组模糊的元素时，他们的大脑会选择以最简单的方式来解释它们。人们会自动地将这些形状中的多余细节去除，以形成一个统一的整体。这是一种快速且自动的过程，因为人类的大脑不喜欢混乱，而追求有序。
> - **接近性**（Proximity）：我们倾向于将靠近的元素视为一组，而不是孤立的元素。
> - **相似性**（Similarity）：相似的元素被视为属于同一组。
> - **对称性**（Symmetry）：对称的形状更容易被理解和接受。
> - **连续性**（Continuity）：我们倾向于将连续的线条视为一组，而不是断开的线条。
> - **封闭性**（Closure）：即使形状不完整，我们也会自动补全缺失的部分，形成一个完整的形状。
> - **连接性**（Connectedness）：靠近的元素被视为连接在一起的一组。
> - **共同命运**（Common Fate）：移动在同一方向上的元素被视为一组。

视觉设计的三要素

> Layout 布局
>
> ![截屏2024-06-12 16.30.26](http://14.103.135.111:49153/i/66695caec027c.png)
>
> ![截屏2024-06-12 17.36.24](http://14.103.135.111:49153/i/66696c2f7eea9.png)
>
> ![截屏2024-06-12 17.37.18](http://14.103.135.111:49153/i/66696c592154a.png)
>
> ![截屏2024-06-12 17.37.40](http://14.103.135.111:49153/i/66696c7236734.png)
>
> ![截屏2024-06-12 17.38.17](http://14.103.135.111:49153/i/66696c9627ccf.png)
>
> ![截屏2024-06-12 17.39.09](http://14.103.135.111:49153/i/66696cc863386.png)

Design Critique

> ![截屏2024-06-12 17.40.14](http://14.103.135.111:49153/i/66696d0ac3dfe.png)
>
> ![截屏2024-06-12 17.40.44](http://14.103.135.111:49153/i/66696d260b3b6.png)

### 字型

# Lec 12 评估设计

![截屏2024-06-12 15.37.19](http://14.103.135.111:49153/i/66695045c1b7b.png)

![截屏2024-06-12 15.38.30](http://14.103.135.111:49153/i/6669508a700e1.png)

![截屏2024-06-12 15.39.28](http://14.103.135.111:49153/i/666950c6ec6ce.png)

> [!NOTE]
>
> **Nielsen的十大可用性原则**是一组用于评估用户界面设计的启发式规则，由Jakob Nielsen提出。这些原则旨在帮助设计师创建易于使用、直观且高效的界面。让我们一起来看看这十大原则吧：
>
> 1. **系统状态可见**（Visibility of system status）：系统应该在用户操作后及时反馈，让用户知道自己当前所处的状态。例如，LinkedIn在用户点击“添加好友”按钮后，按钮状态会改变，告知用户申请已发送成功。
> 2. **系统与现实世界相匹配**（Match between system and the real world）：系统要符合用户的生活环境和认知习惯，使用用户熟悉的词语、概念等，而不是复杂难懂的术语或代码。例如，微信读书中的画线效果类似我们在书上用荧光笔划重点，网易云音乐运用黑胶唱片和唱针元素，切换歌曲时的动效类似换唱片的动作。
> 3. **用户的控制性和自由度**（User control and freedom）：用户有选错功能（误操作）的可能性，所以要给他们留有撤销和重做的权力，也要有清晰的退出机制，让用户有一定的自由度。例如，淘宝首页进入聚划算页面，导航栏有明显的出口，点击可返回上一级页面，底部的广告条有明显的关闭按钮，用户可自由决定其是否显现。
> 4. **一致性和标准化**（Consistency and standards）：同一个产品的设计语言和风格要一致，在不同页面或不同状态下，同一个功能要用相同的用语、图标，操作也要保持一致，这样用户才不会在页面跳转中产生疑惑。
> 5. **预防错误**（Error prevention）：相比出现错误后给出信息提示，通过精心设计防止问题发生显然要更好。在用户动作发生之前，就要防止用户混淆或者错误选择。例如，美团的【红包/抵用券】页面自动将失效的券剔除出页面。
> 6. [**识别而不是记忆-易取原则**（Recognition rather than recall）：尽量减少用户的记忆负荷，内容、动作和选项都应该是可见的。不要让用户在页面跳转时记信息。微信的【发红包】页面，输入金额后跳转到输入密码页时，金额数依然可见，不需要用户对上一页的内容进行记忆。
> 7. **使用的灵活高效性**（Flexibility and efficiency of use）：系统要灵活适用于不同经验水平、不同产品诉求的用户。可适应用户界面，支付宝首页的应用排布，用户可自由添加、删除应用或调整应用的顺序。
> 8. **审美和简约的设计**（Aesthetic and minimalist design）：页面中不应该包含无关紧要的信息。剔除和弱化与主流程无关的信息，去掉冗长的文字，能用图表信息展示的尽量使用图表，尽量减少用户在阅读过程中的压力。例如，ofo首页征用很大面积去强调关键功能【扫码用车】，其他辅助功能相对减小面积
> 9. **帮助用户识别诊断，并从错误中恢复**（Help users recognize, diagnose, and recover from errors）：当用户犯错时，系统应该清晰地告知用户发生了什么，提供解决方案，而不是仅仅报错。例如，支付宝在用户输入错误密码时，会提示“密码错误，请重新输入”，而不是简单地显示“错误”。
> 10. **帮助和文档**（Help and documentation）：尽量设计一个不需要用户查阅文档就能使用的系统，但如果需要文档，也要提供清晰、易懂的帮助文档。例如，微信小程序开发者文档提供了详细的接口说明和示例代码，帮助开发者理解和使用微信小程序的功能

# Lec 14 设计总结

# Lec 15设计的影响力

## 设计的影响

这些是《Ethical OS Toolkit》中提到的8个风险区（8 Risk Zones），这些风险区旨在帮助技术开发者识别和应对可能出现的社会风险和危害：

1. **真相、虚假信息和宣传**：虚假信息的传播及其对公众认知和民主的影响。
2. **成瘾与多巴胺经济**：利用心理触发机制设计的技术导致的成瘾问题。
3. **经济和资产不平等**：技术可能加剧经济差距。
4. **机器伦理与算法偏见**：人工智能和算法决策带来的伦理问题，包括偏见和歧视。
5. **监视国家**：政府或公司广泛监视的影响。
6. **数据控制与货币化**：与个人数据的控制、隐私和商业化相关的问题。
7. **隐含信任与用户理解**：用户对技术的误解或过度信任可能导致的误用或伤害。
8. **仇恨和犯罪行为者**：个人或群体利用技术实施或煽动有害或非法行为。



![截屏2024-06-12 14.48.21](http://14.103.135.111:49153/i/666944c1a9178.png)

> [!IMPORTANT]
>
> “Entrepreneurs are the designers of companies. Great startup CEOs recognize  very early that their job is not to build a product, but to build a  company—defined by mission, values, and culture.” 
>
> 企业家是公司设计者。优秀的初创公司CEO很早就意识到，他们的工作不仅仅是开发产品，而是建立一家有使命、价值观和文化的公司
>
> --Phin Barnes,

>[!NOTE]
>
>**Business Case for Responsible Tech** 
>
>- Attract and Retain the best talent
>- Generate user loyalty
>- Build social capital
>- Prevent disasters that cost time, money, and  reputation. 
>- Have a genuinely positive impact. Build  something you’re proud of.

> 这段文字涵盖了多方面的主题和相关人物、组织以及框架，旨在提供一个全面的参考，涉及负责任的人工智能、算法偏见、内容审核、道德供应链、数据隐私与安全等。具体表达了以下几个方面：
>
> 1. **深度探讨的主题**：
>    - **负责任的人工智能（Responsible AI）**：确保AI的开发和应用不会造成社会危害，并积极推动社会利益。
>    - **算法偏见（Algorithmic Bias）**：研究和解决算法中的系统性偏见问题，确保公平和公正。
>    - **内容审核（Content Moderation）**：如何管理和审核平台上的内容，防止有害信息传播。
>    - **道德供应链（Ethical Supply Chains）**：确保供应链的每个环节都符合道德标准。
>    - **数据隐私与安全（Data Privacy + Security）**：保护用户数据隐私，确保数据安全。
> 2. **推荐关注的人物**：
>    - **Safiya Noble**：关注算法压迫问题。
>    - **Ruha Benjamin**：研究技术中的种族问题。
>    - **Kamal Sinclair**：未来建筑师协会成员。
>    - **Mimi Onuoha**：AI人民指南的作者。
>    - **Ellen Pao**：包含项目的倡导者。
>    - **Joy Buolamwini**：算法正义联盟的创始人。
>    - **Eli Pariser**：公民信号的创始人。
>    - **Sarah Williams**：MIT公民数据实验室成员。
>    - **Kathy Pham**：Mozilla和哈佛的技术专家。
>    - **Wilneida Negron**：Coworker的成员。
>    - **Rumman Chowdhury**：Parity AI的创始人。
>    - **Shoshanna Ziboff**：监视资本主义的研究者。
> 3. **相关组织**：
>    - **福特基金会（Ford Foundation）**：公共利益技术倡议。
>    - **哈佛伯克曼克莱因中心（Berkman Klein Center at Harvard）**。
>    - **Zebras Unite**：倡导替代性退出机制。
>    - **长期股票交易所（Long Term Stock Exchange）**。
>    - **BLab**。
>    - **Dev/Color**：支持黑人技术人员。
>    - **Code2040**：在硅谷建立多元化人才管道。
>    - **负责任创新实验室（Responsible Innovation Labs）**。
>    - **初创企业与社会倡议（Startups & Society Initiative）**。
>    - **All Tech is Human**。
> 4. **框架**：
>    - **Ethical OS**。
>    - **Consequence Scanning**。
>    - **Ethical Data Canvas**。
>    - **社会中心设计（Society Centered Design）**。
>    - **设计正义网络（Design Justice Network）**。
>    - **Bcorp**。



## 社会创新

1. **社会创新的定义**：社会创新是创建和实施有效解决方案来应对重要社会和环境挑战的过程，旨在促进积极的社会变革。

2. **有意义的问题**：

   - 社会中的差距
   - 限制尊严、公正、包容性和自主权的问题

3. **有效解决方案**：

   - 可行的解决方案
   - 对受问题影响的人有明确且可衡量的附加值

4. **社会创新问题**：

   - 棘手问题（Wicked Problems）

     ：存在于复杂系统中的问题，特点包括：

     - 是另一个问题的症状
     - 没有明确定义或单一根本原因
     - 利益相关者有不同看法
     - 没有固定的解决方案

5. **影响案例模板**：

   - 问题的重要性
   - 解决方案
   - 证明解决方案有效的指标

6. **影响案例的作用**：

   - 确保社会影响创业公司能产生有意义的社会影响
   - 说服资助者、投资者、合作伙伴和其他利益相关者投入时间或资源
