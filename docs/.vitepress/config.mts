import { defineConfig } from 'vitepress'

import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
// https://vitepress.dev/reference/site-config


export default defineConfig({
  base: '/mit-cs-notes',
  title: "MIT Notes by Ron",
  description: "TODO",
  lang: 'zh',
  locales: {
    root: {
      label: '中文',
      lang: 'zh'
    },
    en: {
      label: 'English',
      lang: 'en'
    }
  },
  head: [
    ['link' , {rel: 'icon', href: "/mit-cs-notes/img/note_logo.svg", type: "image/svg+xml"}],
  ],
  rewrites :{
    "zh/:pkg/:subject/(.*)": "zh/:subject/(.*)",
  },
  markdown: {
    math: true,
    codeTransformers: [
      transformerTwoslash() 
    ],
    theme: 'nord', // or any other theme you want
    languages: ['asm', 'sql'],
    languageAlias: {
      'assembly': 'asm',
      'golang': 'go',
      'postgresql': 'sql',
      'bluespec': 'txt',
    },
    container: {
        tipLabel: '💁🏼‍♀️提示',
        warningLabel: '⚠️警告',
        dangerLabel: '❌危险',
        infoLabel: 'ℹ️信息',
        detailsLabel: '详细信息'
    },
    toc: { level: [1, 2] },
    lineNumbers: true,
    image: {
      lazyLoading: false,
    },
    config: (md) => {
      // md.use(<plugins>)
    }
  },
  lastUpdated: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
  
    search: {
      provider: "local"
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Changelog', link: 'https://github.com/...' },
    ],
    logo: '/img/note_logo.svg',
    sidebar: {
      '/': [
        {
          text: '编程与软件工程',
          collapsed: true,
          items: [
            { text: "编程基础(Python版)", link: "/zh/fundamentals_of_programming"},
            { text: "软件构造基础", link: "zh/element_of_software_construction"},
            { text: "软件设计", link: "zh/software_design"},
            { text: "Web技术与UI设计", link: "zh/designftw"},
            { text: "软件性能工程", link: "zh/software_performance_engineer"},
            { text: "算法工程", link: "zh/algorithm_engineer"},
            { text: "多核编程", link: "zh/multicore_programming"},
          ]
        },
        {
          text: '理论计算机',
          collapsed: true,
          items: [
            {text: "计算机数学"},
            {text: "算法导论", link: "zh/introduction_to_algorithms"},
            {text: "算法设计和分析"},
            {text: "可计算性和复杂度理论"},
            {text: "分布式算法"},
            {text: "高级数据结构"}
  
          ]
        },
        {
          text: '编程语言',
          collapsed: true,
          items: [
            {text: "计算机语言工程(编译原理)"},
            {text: "计算机动态语言工程(js版)"},
            {text: "计算机程序的结构与解释"},
          ]
        },
        {
          text: '计算机系统',
          collapsed: true,
          items: [
            {text: "计算机系统工程", link: "zh/computer_sys_eng"},
            {text: "操作系统工程", link: "zh/os"},
            {text: "计算机网络", link: "zh/network"},
            {text: "移动和传感计算", link: "zh/mobile"},
            {text: "数据库系统", link: "zh/database_system"},
            {text: "分布式系统", link: "zh/distributed_system"},
            {text: "存储系统", link: "zh/storage"},
            {text: "数据中心计算", link: "zh/dc_computing"}
          ]
        },
        {
          text: '计算机架构',
          collapsed: true,
          items: [
            {text: "C语言与汇编语言底层编程导论", link: "zh/llp"},
            {text: "计算结构", link: "zh/computation_structures"},
            {text: "构建式计算机体系结构（施工中）"},
            {text: "计算机系统架构（施工中）"},
            // {text: "复杂数字系统设计"},
            // {text: "深度学习的硬件架构"},
            // {text: "TinyML 和高效深度学习计算"},
            // {text: "硬件安全设计"},
          ]
        },
        {
          text: "安全与加密",
          collapsed: true,
          items: [
            {text: "计算机安全基础", link: "zh/foundation_of_security"},
            {text: "安全与加密应用（施工中）"},
            {text: "加密学基础（施工中）"},
            {text: "加密学的高级主题（施工中）"},
            {text: "计算机系统安全（施工中）"},
          ]
        },
      ],
      // 软件工程 & 编程
      'zh/fundamentals_of_programming/': [
        {
          text: '⮐主页',
          collapsed: false,
          link: "/zh/notes/index",
        },
        {
          text: '软件构造要素',
          collapsed: false,
          link: "/zh/fundamentals_of_programming/",
          items: [
            { "text": "lec0 设计程序指南 & 命令行工具", "link": "/zh/fundamentals_of_programming/lec0" },
            { "text": "lec1 运行环境模型", "link": "/zh/fundamentals_of_programming/lec1" },
            { "text": "lec2 函数的乐趣", "link": "/zh/fundamentals_of_programming/lec2" },
            { "text": "lec3 洪水填充和迷宫路径查找", "link": "/zh/fundamentals_of_programming/lec3" },
            { "text": "lec4 图搜索", "link": "/zh/fundamentals_of_programming/lec4" },
            { "text": "lec5 递归", "link": "/zh/fundamentals_of_programming/lec5" },
            { "text": "lec6 递归和迭代器", "link": "/zh/fundamentals_of_programming/lec6" },
            { "text": "lec7 递归回溯", "link": "/zh/fundamentals_of_programming/lec7" },
            { "text": "lec8 自定义类型", "link": "/zh/fundamentals_of_programming/lec8" },
            { "text": "lec9 继承和面向对象编程", "link": "/zh/fundamentals_of_programming/lec9" },
            { "text": "lec10 函数式编程", "link": "/zh/fundamentals_of_programming/lec10" }
          ],
        }
      ],
      "zh/element_of_software_construction/": [
        {
          text: '⮐主页',
          collapsed: false,
          link: "/zh/notes/index",
        },
        {
          text: '软件构造要素',
          collapsed: false,
          link: "/zh/element_of_software_construction/",
          items: [
            { "text": "lec00 TypeScript 基础", "link": "/zh/element_of_software_construction/lec0" },
            { "text": "lec01 静态检查", "link": "/zh/element_of_software_construction/lec1" },
            { "text": "lec02 测试", "link": "/zh/element_of_software_construction/lec2" },
            { "text": "lec03 代码审查", "link": "/zh/element_of_software_construction/lec3" },
            { "text": "lec04 规范", "link": "/zh/element_of_software_construction/lec4" },
            { "text": "lec05 设计规范", "link": "/zh/element_of_software_construction/lec5" },
            { "text": "lec06 抽象数据类型", "link": "/zh/element_of_software_construction/lec6" },
            { "text": "lec07 抽象函数与表示不变式", "link": "/zh/element_of_software_construction/lec7" },
            { "text": "lec08 接口与子类型", "link": "/zh/element_of_software_construction/lec8" },
            { "text": "lec09 函数式编程", "link": "/zh/element_of_software_construction/lec9" },
            { "text": "lec10 相等性", "link": "/zh/element_of_software_construction/lec10" },
            { "text": "lec11 递归数据类型", "link": "/zh/element_of_software_construction/lec11" },
            { "text": "lec12 语法与解析", "link": "/zh/element_of_software_construction/lec12" },
            { "text": "lec13 调试", "link": "/zh/element_of_software_construction/lec13" },
            { "text": "lec14 并发", "link": "/zh/element_of_software_construction/lec14" },
            { "text": "lec15 Promises", "link": "/zh/element_of_software_construction/lec15" },
            { "text": "lec16 互斥", "link": "/zh/element_of_software_construction/lec16" },
            { "text": "lec17 回调与图形用户界面", "link": "/zh/element_of_software_construction/lec17" },
            { "text": "lec18 消息传递与网络", "link": "/zh/element_of_software_construction/lec18" },
            { "text": "lec19 小语言", "link": "/zh/element_of_software_construction/lec19" }
          ],
        },
      ],
      '/zh/designftw/': [
        {
          text: '⮐主页',
          collapsed: false,
          link: "/zh/notes/index",
        },
        {
          text: 'Web技术与UI设计',
          collapsed: false,
          link: "/zh/designftw/",
          items: [
            { "text": "Lec 1 介绍 & 总览", "link": "/zh/designftw/lec1" },
            { "text": "Lec 2 Web网页结构：HTML", "link": "/zh/designftw/lec2" },
            { "text": "Lec 3 易学性", "link": "/zh/designftw/lec3" },
            { "text": "Lec 4 图形设计", "link": "/zh/designftw/lec4" },
            { "text": "Lec 5 高效性", "link": "/zh/designftw/lec5" },
            { "text": "Lec 6 CSS的基本概念 I", "link": "/zh/designftw/lec6" },
            { "text": "Lec 7 安全性", "link": "/zh/designftw/lec7" },
            { "text": "Lec 8 CSS的基本概念 II", "link": "/zh/designftw/lec8" },
            { "text": "Lec 9 启发式评估", "link": "/zh/designftw/lec9" },
            { "text": "Lec 10 布局", "link": "/zh/designftw/lec10" },
            { "text": "Lec 11 原型和用户测试", "link": "/zh/designftw/lec11" },
            { "text": "Lec 12 现代JS和DOM的介绍", "link": "/zh/designftw/lec12" },
            { "text": "Lec 13 统一Web设计", "link": "/zh/designftw/lec13" },
            { "text": "Lec 14 事件", "link": "/zh/designftw/lec14" },
            { "text": "Lec 15 设计范式 & 函数式JS", "link": "/zh/designftw/lec15" },
            { "text": "Lec 16 函数、类和this", "link": "/zh/designftw/lec16" },
            { "text": "Lec 17 字体", "link": "/zh/designftw/lec17" },
            { "text": "Lec 18 异步编程", "link": "/zh/designftw/lec18" },
            { "text": "Lec 19 色彩", "link": "/zh/designftw/lec19" },
            { "text": "Lec 20 Web API", "link": "/zh/designftw/lec20" },
            { "text": "Lec 21 路由 & 数据可视化", "link": "/zh/designftw/lec21" },
            { "text": "Lec 22 动画 & 反馈", "link": "/zh/designftw/lec22" },
            { "text": "Lec 23 Web标准", "link": "/zh/designftw/lec23" },
            { "text": "Lec 24 面向AI系统的设计", "link": "/zh/designftw/lec24" }
          ]
        },
      ],
      '/zh/software_performance_engineer/': [
        {
          text: '⮐主页',
          collapsed: false,
          link: "/zh/notes/index",
        },
        {
          text: '软件性能工程',
          collapsed: false,
          link: "/zh/software_performance_engineer/",
          items: [
            { text: "lec0 课程介绍", link: "/zh/software_performance_engineer/lec0"},
            { text: "lec01 引入和矩阵乘法", link: "/zh/software_performance_engineer/lec1" },
            { text: "lec02 Bentley Rule", link: "/zh/software_performance_engineer/lec2" },
            { text: "lec03 二进制的巧用方法", link: "/zh/software_performance_engineer/lec3" },
            { text: "lec04 汇编语言和计算机体系结构", link: "/zh/software_performance_engineer/lec4" },
            { text: "lec05 C 到 汇编", link: "/zh/software_performance_engineer/lec5" },
            { text: "lec06 多核编程", link: "/zh/software_performance_engineer/lec6" },
            { text: "lec07 竞态和并行", link: "/zh/software_performance_engineer/lec7" },
            { text: "lec08 多线程算法分析", link: "/zh/software_performance_engineer/lec8" },
            { text: "lec09 编译器能做什么和不能做什么", link: "/zh/software_performance_engineer/lec9" },
            { text: "lec10 测量和计时", link: "/zh/software_performance_engineer/lec10" },
            { text: "lec11 存储分配", link: "/zh/software_performance_engineer/lec11" },
            { text: "lec13 Cilk运行时系统", link: "/zh/software_performance_engineer/lec13" },
            { text: "lec14 缓存和高速缓存算法", link: "/zh/software_performance_engineer/lec14" },
            { text: "lec15 缓存无关算法", link: "/zh/software_performance_engineer/lec15" },
            { text: "lec12 存储分配的并行", link: "/zh/software_performance_engineer/lec12" },
            { text: "lec16 不确定性程序的并行", link: "/zh/software_performance_engineer/lec16" },
            { text: "lec20 投机性并行", link: "/zh/software_performance_engineer/lec20" },
            { text: "lec17 无锁同步", link: "/zh/software_performance_engineer/lec17" },
            { text: "lec18 特定领域语言和自动调优", link: "/zh/software_performance_engineer/lec18" },
            { text: "lec23 动态语言的高性能", link: "/zh/software_performance_engineer/lec23" },
            { text: "lec19 西洋棋代码走读", link: "/zh/software_performance_engineer/lec19" },
            { text: "lec21 旅行商问题", link: "/zh/software_performance_engineer/lec21" },
            { text: "lec22 图优化", link: "/zh/software_performance_engineer/lec22" }
          ]
        },
      ],
      // 计算机系统
      '/zh/os': [
        {
          text: '⮐主页',
          collapsed: false,
          link: "/zh/notes/index",
        },
        {
          text: '操作系统工程',
          collapsed: false,
          link: "/zh/os/",
          items: [
            { text: "lec01 OS总览", link: "/zh/os/lec1" },
            { text: "lec02 C语言和内存抽象", link: "/zh/os/lec2" },
            { text: "lec03 OS设计", link: "/zh/os/lec3" },
            { text: "lec04 虚拟内存 & 页表", link: "/zh/os/lec4" },
            { text: "lec05 系统调用的Entry & Exit", link: "/zh/os/lec5" },
            { text: "lec06 RISV-V调用约定", link: "/zh/os/lec6" },
            { text: "lec07 页错误", link: "/zh/os/lec7" },
            { text: "lec08 xv6介绍", link: "/zh/os/lec8" },
            { text: "lec09 设备驱动 & 中断", link: "/zh/os/lec9" },
            { text: "lec10 锁", link: "/zh/os/lec10" },
            { text: "lec11 调度", link: "/zh/os/lec11" },
            { text: "lec13 协调(Sleep & wakeup)", link: "/zh/os/lec13" },
            { text: "lec12 文件系统", link: "/zh/os/lec12" },
            { text: "lec14 崩溃恢复 & 日志记录", link: "/zh/os/lec14" },
            { text: "lec15 Linux Ext3的崩溃恢复", link: "/zh/os/lec15" },
            { text: "lec16 用户级虚拟内存", link: "/zh/os/lec16" },
            { text: "lec17 OS的组织 & 微内核", link: "/zh/os/lec17" },
            { text: "lec18 虚拟机", link: "/zh/os/lec18" },
            { text: "lec19 内核与高级语言", link: "/zh/os/lec19" },
            { text: "lec20 网络与OS", link: "/zh/os/lec20" },
            { text: "lec21 熔断", link: "/zh/os/lec21" },
            { text: "lec22 多核可扩展性 & RCU", link: "/zh/os/lec22" },
          ]
        },
      ],
      '/zh/network/': [
        {
          text: '⮐主页',
          collapsed: false,
          link: "/zh/notes/index",
        },
        {
          text: '计算机网络',
          collapsed: false,
          link: "/zh/network/",
          items: [
            { text: "lec1 互联网架构的演进", link: "/zh/network/lec1" },
            { text: "lec2 互联网路由协议 & 架构", link: "/zh/network/lec2" },
            { text: "lec3 端到端拥塞控制", link: "/zh/network/lec3" },
            { text: "lec4 网络辅助拥塞控制", link: "/zh/network/lec4" },
            { text: "lec5 数据中心网络架构", link: "/zh/network/lec5" },
            { text: "lec6 广域网", link: "/zh/network/lec6" },
            { text: "lec8 SDN 网络", link: "/zh/network/lec8" },
            { text: "lec9 视频流", link: "/zh/network/lec9" },
            { text: "实验", link: "/zh/network/lab" },
          ]
        },
      ],
      '/zh/mobile/': [
        {
          text: '⮐主页',
          collapsed: false,
          link: "/zh/notes/index",
        },
        {
          text: '移动和传感器计算',
          collapsed: false,
          link: "/zh/mobile/",
          items: [
            { text: "lec1 课程介绍与核心思想", link: "/zh/mobile/lec1" },
            { text: "lec2 物联网定位基础", link: "/zh/mobile/lec2" },
            { text: "lec3 GPS 与室内定位实战", link: "/zh/mobile/lec3" },
            { text: "lec4 穿墙感知", link: "/zh/mobile/lec4" },
            { text: "lec5 网络连接：BLE 与低功耗广域网", link: "/zh/mobile/lec5" },
            { text: "lec6 网状网络与多跳路由", link: "/zh/mobile/lec6" },
            { text: "lec7 无电池传感与智慧城市", link: "/zh/mobile/lec7" },
            { text: "lec8 自动驾驶汽车", link: "/zh/mobile/lec8" },
            { text: "lec9 惯性感知", link: "/zh/mobile/lec9" },
            { text: "lec10 坑洞检测", link: "/zh/mobile/lec10" },
            { text: "lec11 声学感知攻击", link: "/zh/mobile/lec11" },
            { text: "lec12 海洋物联网", link: "/zh/mobile/lec12" },
            { text: "lec13 农业物联网", link: "/zh/mobile/lec13" },
            { text: "lec14 无线神经辐射场", link: "/zh/mobile/lec14" },
          ]
        },
      ],
      '/zh/storage/': [
        {
          text: '⮐主页',
          collapsed: false,
          link: "/zh/notes/index",
        },
        {
          text: '存储系统',
          collapsed: false,
          link: "/zh/storage/",
          items: [
            { text: "lec1 概述 & Flash SSD操作 I", link: "/zh/storage/lec1" },
            { text: "lec2 Flash SSD 操作 II", link: "/zh/storage/lec2" },
            { text: "lec3 磁盘驱动操作", link: "/zh/storage/lec3" },
            { text: "lec4 文件系统存储布局", link: "/zh/storage/lec4" },
            { text: "lec5 文件系统的组织", link: "/zh/storage/lec5" },
            { text: "lec6 缓存和文件系统集成", link: "/zh/storage/lec6" },
            { text: "lec8 磁盘阵列组织", link: "/zh/storage/lec8" },
            { text: "lec9 磁盘阵列系统", link: "/zh/storage/lec9" },
            { text: "lec10 分布式FS & NAS接口", link: "/zh/storage/lec10" },
            { text: "lec13 加强可靠性技术", link: "/zh/storage/lec13" },
            { text: "lec16 LSM树及其应用", link: "/zh/storage/lec16" },
            { text: "lec17 Google文件系统革新", link: "/zh/storage/lec17" },
          ]
        },
      ],
      '/zh/computer_sys_eng/': [
        {
          text: '⮐主页',
          collapsed: false,
          link: "/zh/notes/index",
        },
        {
          text: '计算机系统工程',
          collapsed: false,
          link: "/zh/computer_sys_eng/",
          items: [
            { text: "lec01 复杂度，模块化，抽象思维", link: "/zh/computer_sys_eng/lec1" },
            { text: "lec02 命名系统", link: "/zh/computer_sys_eng/lec2" },
            { text: "lec03 虚拟内存", link: "/zh/computer_sys_eng/lec3" },
            { text: "lec04 有界缓冲区，锁", link: "/zh/computer_sys_eng/lec4" },
            { text: "lec05 线程", link: "/zh/computer_sys_eng/lec5" },
            { text: "lec06 虚拟机", link: "/zh/computer_sys_eng/lec6" },
            { text: "lec07 性能（存储）", link: "/zh/computer_sys_eng/lec7" },
            { text: "lec08 计算机网络介绍", link: "/zh/computer_sys_eng/lec8" },
            { text: "lec09 路由", link: "/zh/computer_sys_eng/lec9" },
            { text: "lec10 BGP", link: "/zh/computer_sys_eng/lec10" },
            { text: "lec11 TCP", link: "/zh/computer_sys_eng/lec11" },
            { text: "lec13 网络资源管理", link: "/zh/computer_sys_eng/lec13" },
            { text: "lec12 应用层", link: "/zh/computer_sys_eng/lec12" },
            { text: "lec14 数据中心和云", link: "/zh/computer_sys_eng/lec14" },
            { text: "lec15 可靠性", link: "/zh/computer_sys_eng/lec15" },
            { text: "lec16 原子性、隔离性、事务", link: "/zh/computer_sys_eng/lec16" },
            { text: "lec17 logging", link: "/zh/computer_sys_eng/lec17" },
            { text: "lec18 隔离性", link: "/zh/computer_sys_eng/lec18" },
            { text: "lec19 分布式事务", link: "/zh/computer_sys_eng/lec19" },
            { text: "lec20 复制", link: "/zh/computer_sys_eng/lec20" },
            { text: "lec21 身份认证", link: "/zh/computer_sys_eng/lec21" },
            { text: "lec22 低级别攻击", link: "/zh/computer_sys_eng/lec22" },
            { text: "lec23 安全通道", link: "/zh/computer_sys_eng/lec23" },
            { text: "lec24 ToR", link: "/zh/computer_sys_eng/lec24" },
            { text: "lec25 网络攻击", link: "/zh/computer_sys_eng/lec25" },
          ]
        },
      ],
      '/zh/database_system/': [
        {
          text: '⮐主页',
          collapsed: false,
          link: "/zh/notes/index",
        },
        {
          text: '数据库系统',
          collapsed: false,
          link: "/zh/database_system/",
          items: [
            { text: "lec01 关系模型 & SQL(Part I)", link: "/zh/database_system/lec1" },
            { text: "lec02 SQL(Part II)", link: "/zh/database_system/lec2" },
            { text: "lec03 Schema设计", link: "/zh/database_system/lec3" },
            { text: "lec04 数据库的内部架构", link: "/zh/database_system/lec4" },
            { text: "lec05 数据库操作和查询处理", link: "/zh/database_system/lec5" },
            { text: "lec06 索引和访问方法", link: "/zh/database_system/lec6" },
            { text: "lec07 Join算法", link: "/zh/database_system/lec7" },
            { text: "lec08 查询优化", link: "/zh/database_system/lec8" },
            { text: "lec09 分析型数据库架构", link: "/zh/database_system/lec9" },
            { text: "lec10 事务与加锁", link: "/zh/database_system/lec10" },
            { text: "lec11 乐观并发控制与快照隔离", link: "/zh/database_system/lec11" },
            { text: "lec12 故障恢复(Part I)", link: "/zh/database_system/lec12" },
            { text: "lec13 故障恢复(Part II)", link: "/zh/database_system/lec13" },
            { text: "lec14 高级基数估计", link: "/zh/database_system/lec14" },
            { text: "lec15 并行数据库", link: "/zh/database_system/lec15" },
            { text: "lec16 分布式事务", link: "/zh/database_system/lec16" },
            { text: "lec17 最终一致性", link: "/zh/database_system/lec17" },
            { text: "lec18 高性能事务", link: "/zh/database_system/lec18" },
            { text: "lec19 集群计算(Spark)", link: "/zh/database_system/lec19" },
            { text: "lec20 SnowFlake", link: "/zh/database_system/lec20" }
          ]
          
        }
      ],
      '/zh/dc_computing/': [
        {
          text: '⮐主页',
          collapsed: false,
          link: "/zh/notes/index",
        },
        {
          text: '数据中心计算',
          collapsed: false,
          // link: "/dc_computing/",
          items: [
            { "text": "lec1 介绍", "link": "/zh/dc_computing/lec1" },
            { "text": "lec2 数据中心硬件", "link": "/zh/dc_computing/lec2" },
            { "text": "lec3 功耗管理", "link": "/zh/dc_computing/lec3" },
            { "text": "lec4 硬件架构", "link": "/zh/dc_computing/lec4" },
            { "text": "lec5 能源 & 功耗", "link": "/zh/dc_computing/lec5" },
            { "text": "lec6 数据中心存储", "link": "/zh/dc_computing/lec6" },
            { "text": "lec7 可靠性", "link": "/zh/dc_computing/lec7" },
            { "text": "lec8 数据中心网络", "link": "/zh/dc_computing/lec8" },
            { "text": "lec9 应用架构", "link": "/zh/dc_computing/lec9" },
            { "text": "lec10 无服务器计算", "link": "/zh/dc_computing/lec10" },
            { "text": "lec11 微服务", "link": "/zh/dc_computing/lec11" },
            { "text": "lec12 性能分析", "link": "/zh/dc_computing/lec12" },
            { "text": "lec13 尾时延", "link": "/zh/dc_computing/lec13" },
            { "text": "lec14 安全和隐私", "link": "/zh/dc_computing/lec14" },
            { "text": "lec15 监控", "link": "/zh/dc_computing/lec15" },
            { "text": "lec16 性能Debugging", "link": "/zh/dc_computing/lec16" },
            { "text": "lec17 低时延服务管理", "link": "/zh/dc_computing/lec17" },
            { "text": "lec18 数据中心管理", "link": "/zh/dc_computing/lec18" },
            { "text": "lec19 在系统方面的机器学习", "link": "/zh/dc_computing/lec19" },
            { "text": "lec20 集群管理", "link": "/zh/dc_computing/lec20" }
          ]
        }
      ],
      '/zh/distributed_system/': [
        {
          text: '⮐主页',
          collapsed: false,
          link: "/zh/notes/index",
        },
        {
          text: '数据中心计算',
          collapsed: false,
          link: "/zh/distributed_system/",
          items: [
            { "text": "lec1 MapReduce", "link": "/zh/distributed_system/lec1" },
            { "text": "lec2 RPC & 线程", "link": "/zh/distributed_system/lec2" },
            { "text": "lec3 主从复制", "link": "/zh/distributed_system/lec3" },
            { "text": "lec4 一致性 & 可串行化", "link": "/zh/distributed_system/lec4" },
            { "text": "lec5 Golang 模式", "link": "/zh/distributed_system/lec5" },
            { "text": "lec6 Raft 容错（上）", "link": "/zh/distributed_system/lec6" },
            { "text": "lec7 Raft 容错（下）", "link": "/zh/distributed_system/lec7" },
            { "text": "lec8 谷歌文件系统", "link": "/zh/distributed_system/lec8" },
            { "text": "lec9 Zookeeper", "link": "/zh/distributed_system/lec9" },
            { "text": "lec10 分布式事务", "link": "/zh/distributed_system/lec10" },
            { "text": "lec11 Lab 3A+B", "link": "/zh/distributed_system/lec11" },
            { "text": "lec12 Spark", "link": "/zh/distributed_system/lec12" },
            { "text": "lec13 Spanner", "link": "/zh/distributed_system/lec13" },
            { "text": "lec14 乐观并发控制", "link": "/zh/distributed_system/lec14" },
            { "text": "lec15 Chardonnay", "link": "/zh/distributed_system/lec15" },
            { "text": "lec16 DynamoDB", "link": "/zh/distributed_system/lec16" },
            { "text": "lec17 Ray", "link": "/zh/distributed_system/lec17" },
            { "text": "lec18 缓存一致性", "link": "/zh/distributed_system/lec18" },
            { "text": "lec19 Grove", "link": "/zh/distributed_system/lec19" },
            { "text": "lec20 AWS Lambda：按需容器加载", "link": "/zh/distributed_system/lec20" },
            { "text": "lec21 Boki", "link": "/zh/distributed_system/lec21" },
            { "text": "lec22 分叉一致性 & SUNDR", "link": "/zh/distributed_system/lec22" },
            { "text": "lec23 比特币", "link": "/zh/distributed_system/lec23" },
            { "text": "lec24 拜占庭容错", "link": "/zh/distributed_system/lec24" }
          ]
        },
      ],
      '/zh/storage_systems/': [
        {
          text: '⮐主页',
          collapsed: false,
          link: "/zh/notes/index",
        },
        {
          text: '存储系统',
          collapsed: false,
          link: "/zh/storage_systems/",
          items: [
            { "text": "lec1 MapReduce", "link": "/zh/storage_systems/lec1" },
          ]
        },
      ],
      // TCS
      '/zh/introduction_to_algorithms/': [
        {
          text: '⮐主页',
          collapsed: false,
          link: "/zh/notes/index",
        },
        {
          text: '算法导论',
          collapsed: false,
          link: "/zh/introduction_to_algorithms/",
          items: [
            { text: "lec01 介绍", link: "/zh/introduction_to_algorithms/lec1" },
            { text: "lec02 数据结构", link: "/zh/introduction_to_algorithms/lec2" },
            { text: "lec03 排序", link: "/zh/introduction_to_algorithms/lec3" },
            { text: "lec04 哈希", link: "/zh/introduction_to_algorithms/lec4" },
            { text: "lec05 线性排序", link: "/zh/introduction_to_algorithms/lec5" },
            { text: "lec06 二叉树 Part 1", link: "/zh/introduction_to_algorithms/lec6" },
            { text: "lec07 二叉树，AVL树 Part 2", link: "/zh/introduction_to_algorithms/lec7" },
            { text: "lec08 二叉堆", link: "/zh/introduction_to_algorithms/lec8" },
            { text: "lec09 广度优先搜索", link: "/zh/introduction_to_algorithms/lec9" },
            { text: "lec10 深度优先搜索", link: "/zh/introduction_to_algorithms/lec10" },
            { text: "lec11 最短路径问题", link: "/zh/introduction_to_algorithms/lec11" },
            { text: "lec12 Bellman-Ford算法", link: "/zh/introduction_to_algorithms/lec12" },
            { text: "lec13 Dijkstra’s Algorithm算法", link: "/zh/introduction_to_algorithms/lec13" },
            { text: "lec14 Johnson’s Algorithm算法", link: "/zh/introduction_to_algorithms/lec14" },
            { text: "lec15 动态规划, Part 1: 递归算法", link: "/zh/introduction_to_algorithms/lec15" },
            { text: "lec16 动态规划, Part 2: 子问题", link: "/zh/introduction_to_algorithms/lec16" },
            { text: "lec17 动态规划, Part 3: APSP, Parens, Piano", link: "/zh/introduction_to_algorithms/lec17" },
            { text: "lec18 动态规划, Part 4: Pseudopolynomials", link: "/zh/introduction_to_algorithms/lec18" },
            { text: "lec19 复杂度", link: "/zh/introduction_to_algorithms/lec19" },
          ]
        }
      ],
      // 安全
      '/zh/foundation_of_security/': [
        {
          text: '⮐主页',
          collapsed: false,
          link: "/zh/notes/index",
        },
        {
          text: '计算机安全基础',
          collapsed: false,
          link: "/zh/foundation_of_security/",
          items: [
            { "text": "Lec 1 什么是计算机安全？", "link": "/zh/foundation_of_security/lec1" },
            { "text": "Lec 2 身份认证", "link": "/zh/foundation_of_security/lec2" },
            { "text": "Lec 3 碰撞抵抗和文件认证", "link": "/zh/foundation_of_security/lec3" },
            { "text": "Lec 4 消息认证码（MAC）", "link": "/zh/foundation_of_security/lec4" },
            { "text": "Lec 5 数字签名：基于哈希", "link": "/zh/foundation_of_security/lec5" },
            { "text": "Lec 6 数字签名：RSA", "link": "/zh/foundation_of_security/lec6" },
            { "text": "Lec 7 案例研究：公钥基础设施（PKI）", "link": "/zh/foundation_of_security/lec7" },
            { "text": "Lec 8 传输层安全介绍", "link": "/zh/foundation_of_security/lec8" },
            { "text": "Lec 9 认证加密", "link": "/zh/foundation_of_security/lec9" },
            { "text": "Lec 10 密钥交换与公钥加密", "link": "/zh/foundation_of_security/lec10" },
            { "text": "Lec 11 加密的实际应用", "link": "/zh/foundation_of_security/lec11" },
            { "text": "Lec 12 安全系统架构", "link": "/zh/foundation_of_security/lec12" },
            { "text": "Lec 13 隔离", "link": "/zh/foundation_of_security/lec13" },
            { "text": "Lec 14 软件信任", "link": "/zh/foundation_of_security/lec14" },
            { "text": "Lec 15 CPU 时序攻击", "link": "/zh/foundation_of_security/lec15" },
            { "text": "Lec 16 案例研究：iOS 安全", "link": "/zh/foundation_of_security/lec16" },
            { "text": "Lec 17 软件安全", "link": "/zh/foundation_of_security/lec17" },
            { "text": "Lec 18 特权分离", "link": "/zh/foundation_of_security/lec18" },
            { "text": "Lec 19 运行时防御", "link": "/zh/foundation_of_security/lec19" },
            { "text": "Lec 20 隐私与零知识证明", "link": "/zh/foundation_of_security/lec20" }
          ]
        },
      ],
      // 编程语言

      // 计算机架构
      '/zh/computation_structures/': [
        {
          text: '⮐主页',
          collapsed: false,
          link: "/zh/notes/index",
        },
        {
          text: '计算结构',
          collapsed: false,
          link: "/zh/computation_structures/",
          items: [

          ]
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/luomingguo' },
    ],
  },

});
