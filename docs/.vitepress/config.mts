import { defineConfig } from 'vitepress'

import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
// https://vitepress.dev/reference/site-config


export default defineConfig({
  base: '/mit-cs-notes',
  title: "MIT Notes",
  description: "TODO",
  lang: 'cn-zh',
  locales: {
    root: {
      label: '中文',
      lang: 'zh'
    },
    en: {
      label: 'English',
      lang: 'en',
      link: '/en/guide'
    }
  },
  head: [
    ['link' , {rel: 'icon', href: "/mit-cs-notes/logo.png"}],
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
    languages: ['asm'],

    toc: { level: [1, 2] },
    lineNumbers: true,
    image: {
      lazyLoading: true
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
      { 
        text: 'Language', 
        items: [
          {text: "English", link: "/index"},
          {text: "中文", link: "/index_zh"},
        ]
      },
      { text: 'Changelog', link: 'https://github.com/...' },
    ],
    logo: '/logo.png',
    sidebar: {
      '/': [
        {
          text: '编程与软件工程',
          collapsed: true,
          items: [
            { text: "编程基础(Python版)", link: "/zh/fundamentals_of_programming"},
            { text: "软件构造基础", link: "zh/element_of_software_construction"},
            { text: "软件设计", link: "zh/software_design"},
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
            {text: "操作系统工程"},
            {text: "计算机网络"},
            {text: "移动和传感计算"},
            {text: "计算机系统与社会"},
            {text: "数据库系统", link: "zh/database_systems"},
            {text: "分布式系统"},
            {text: "计算机系统原理"},
            {text: "数据中心计算", link: "zh/dc_computing"}
          ]
        },
        {
          text: '计算机架构',
          collapsed: true,
          items: [
            {text: "低级语言编程导论(C和汇编)"},
            {text: "计算结构"},
            {text: "结构化计算机设计"},
            {text: "计算机系统架构"},
            {text: "复杂数字系统设计"},
            {text: "并行计算"},
          ]
        },
        {
          text: "安全与加密",
          collapsed: true,
          items: [
            {text: "安全与加密应用"}
          ]
        },
      ],
      'zh/fundamentals_of_programming/': [
        {
          text: '⮐主页',
          collapsed: false,
          link: "../notes/",
        },
        {
          text: '软件构造要素',
          collapsed: false,
          link: "../notes/",
          items: [
            { "text": "lec0 设计程序指南 & 命令行工具", "link": "./lec0.md" },
            { "text": "lec1 运行环境模型", "link": "./lec1.md" },
            { "text": "lec2 函数的乐趣", "link": "./lec2.md" },
            { "text": "lec3 洪水填充和迷宫路径查找", "link": "./lec3.md" },
            { "text": "lec4 图搜索", "link": "./lec4.md" },
            { "text": "lec5 递归", "link": "./lec5.md" },
            { "text": "lec6 递归和迭代器", "link": "./lec6.md" },
            { "text": "lec7 递归回溯", "link": "./lec7.md" },
            { "text": "lec8 自定义类型", "link": "./lec8.md" },
            { "text": "lec9 继承和面向对象编程", "link": "./lec9.md" },
            { "text": "lec10 函数式编程", "link": "./lec10.md" }
          ],
        }
      ],
      "zh/element_of_software_construction/": [
        {
          text: '⮐主页',
          collapsed: false,
          link: "../notes/",
        },
        {
          text: '软件构造要素',
          collapsed: false,
          link: "../notes/",
          items: [
            { "text": "lec01 静态检查", "link": "./lec01.md" },
            { "text": "lec02 测试", "link": "./lec02.md" },
            { "text": "lec03 代码审查", "link": "./lec03.md" },
            { "text": "lec04 规范", "link": "./lec04.md" },
            { "text": "lec05 设计规范", "link": "./lec05.md" },
            { "text": "lec06 抽象数据类型", "link": "./lec06.md" },
            { "text": "lec07 抽象函数与表示不变式", "link": "./lec07.md" },
            { "text": "lec08 接口与子类型", "link": "./lec08.md" },
            { "text": "lec09 函数式编程", "link": "./lec09.md" },
            { "text": "lec10 相等性", "link": "./lec10.md" },
            { "text": "lec11 递归数据类型", "link": "./lec11.md" },
            { "text": "lec12 语法与解析", "link": "./lec12.md" },
            { "text": "lec13 调试", "link": "./lec13.md" },
            { "text": "lec14 并发", "link": "./lec14.md" },
            { "text": "lec15 Promises", "link": "./lec15.md" },
            { "text": "lec16 互斥", "link": "./lec16.md" },
            { "text": "lec17 回调与图形用户界面", "link": "./lec17.md" },
            { "text": "lec18 消息传递与网络", "link": "./lec18.md" },
            { "text": "lec19 小语言", "link": "./lec19.md" }
          ],
        },
      ],
      '/zh/software_performance_engineer/': [
        {
          text: '⮐主页',
          collapsed: false,
          link: "../notes/",
        },
        {
          text: '软件性能工程',
          collapsed: false,
          link: "./index",
          items: [
            { text: "lec0 课程介绍", link: "lec0"},
            { text: "lec01 引入和矩阵乘法", link: "./lec1" },
            { text: "lec02 Bentley Rule", link: "./lec2" },
            { text: "lec03 二进制的巧用方法", link: "./lec3" },
            { text: "lec04 汇编语言和计算机体系结构", link: "./lec4" },
            { text: "lec05 C 到 汇编", link: "./lec5" },
            { text: "lec06 多核编程", link: "./lec6" },
            { text: "lec07 竞态和并行", link: "./lec7" },
            { text: "lec08 多线程算法分析", link: "./lec8" },
            { text: "lec09 编译器能做什么和不能做什么", link: "./lec9" },
            { text: "lec10 测量和计时", link: "./lec10" },
            { text: "lec11 存储分配", link: "./lec11" },
            { text: "lec13 Cilk运行时系统", link: "./lec13" },
            { text: "lec14 缓存和高速缓存算法", link: "./lec14" },
            { text: "lec15 缓存无关算法", link: "./lec15" },
            { text: "lec12 存储分配的并行", link: "./lec12" },
            { text: "lec16 不确定性程序的并行", link: "./lec16" },
            { text: "lec20 投机性并行", link: "./lec20" },
            { text: "lec17 无锁同步", link: "./lec17" },
            { text: "lec18 特定领域语言和自动调优", link: "./lec18" },
            { text: "lec23 动态语言的高性能", link: "./lec23" },
            { text: "lec19 西洋棋代码走读", link: "./lec19" },
            { text: "lec21 旅行商问题", link: "./lec21" },
            { text: "lec22 图优化", link: "./lec22" }
          ]
        },
      ],
      '/zh/computer_sys_eng/': [
        {
          text: '⮐主页',
          collapsed: false,
          link: "../notes/",
        },
        {
          text: '计算机系统工程',
          collapsed: false,
          link: "./index",
          items: [
            { text: "lec01 复杂度，模块化，抽象思维", link: "./lec1" },
            { text: "lec02 命名系统", link: "./lec2" },
            { text: "lec03 虚拟内存", link: "./lec3" },
            { text: "lec04 有界缓冲区，锁", link: "./lec4" },
            { text: "lec05 线程", link: "./lec5" },
            { text: "lec06 虚拟机", link: "./lec6" },
            { text: "lec07 性能（存储）", link: "./lec7" },
            { text: "lec08 计算机网络介绍", link: "./lec8" },
            { text: "lec09 路由", link: "./lec9" },
            { text: "lec10 BGP", link: "./lec10" },
            { text: "lec11 TCP", link: "./lec11" },
            { text: "lec13 网络资源管理", link: "./lec13" },
            { text: "lec12 应用层", link: "./lec12" },
            { text: "lec14 数据中心和云", link: "./lec14" },
            { text: "lec15 可靠性", link: "./lec15" },
            { text: "lec16 原子性、隔离性、事务", link: "./lec16" },
            { text: "lec17 logging", link: "./lec17" },
            { text: "lec18 隔离性", link: "./lec18" },
            { text: "lec19 分布式事务", link: "./lec19" },
            { text: "lec20 复制", link: "./lec20" },
            { text: "lec21 身份认证", link: "./lec21" },
            { text: "lec22 低级别攻击", link: "./lec22" },
            { text: "lec23 安全通道", link: "./lec23" },
            { text: "lec24 ToR", link: "./lec24" },
            { text: "lec25 网络攻击", link: "./lec25" },
          ]
        },
      ],
      '/zh/database_systems/': [
        {
          text: '⮐主页',
          collapsed: false,
          link: "../notes/",
        },
        {
          text: '数据库系统',
          collapsed: false,
          link: "./index",
          items: [
            { text: "lec01 关系模型 & SQL(Part I)", link: "./lec1" },
            { text: "lec02 SQL(Part II)", link: "./lec2" },
            { text: "lec03 Schema设计", link: "./lec3" },
            { text: "lec04 数据库的内部架构", link: "./lec4" },
            { text: "lec05 数据库操作和查询处理", link: "./lec5" },
            { text: "lec06 索引和访问方法", link: "./lec6" },
            { text: "lec07 Join算法", link: "./lec7" },
            { text: "lec08 查询优化", link: "./lec8" },
            { text: "lec09 分析型数据库架构", link: "./lec9" },
            { text: "lec10 事务与加锁", link: "./lec10" },
            { text: "lec11 乐观并发控制与快照隔离", link: "./lec11" },
            { text: "lec12 故障恢复(Part I)", link: "./lec12" },
            { text: "lec13 故障恢复(Part II)", link: "./lec13" },
            { text: "lec14 高级基数估计", link: "./lec14" },
            { text: "lec15 并行数据库", link: "./lec15" },
            { text: "lec16 分布式事务", link: "./lec16" },
            { text: "lec17 最终一致性", link: "./lec17" },
            { text: "lec18 高性能事务", link: "./lec18" },
            { text: "lec19 集群计算(Spark)", link: "./lec19" },
            { text: "lec20 SnowFlake", link: "./lec20" }
          ]
          
        }
      ],
      '/zh/dc_computing/': [
        {
          text: '⮐主页',
          collapsed: false,
          link: "../notes/",
        },
        {
          text: '数据中心计算',
          collapsed: false,
          // link: "/dc_computing/",
          items: [
            { "text": "lec1 介绍", "link": "./lec1" },
            { "text": "lec2 数据中心硬件", "link": "./lec2" },
            { "text": "lec3 功耗管理", "link": "./lec3" },
            { "text": "lec4 硬件架构", "link": "./lec4" },
            { "text": "lec5 能源 & 功耗", "link": "./lec5" },
            { "text": "lec6 数据中心存储", "link": "./lec6" },
            { "text": "lec7 可靠性", "link": "./lec7" },
            { "text": "lec8 数据中心网络", "link": "./lec8" },
            { "text": "lec9 应用架构", "link": "./lec9" },
            { "text": "lec10 无服务器计算", "link": "./lec10" },
            { "text": "lec11 微服务", "link": "./lec11" },
            { "text": "lec12 性能分析", "link": "./lec12" },
            { "text": "lec13 尾时延", "link": "./lec13" },
            { "text": "lec14 安全和隐私", "link": "./lec14" },
            { "text": "lec15 监控", "link": "./lec15" },
            { "text": "lec16 性能Debugging", "link": "./lec16" },
            { "text": "lec17 低时延服务管理", "link": "./lec17" },
            { "text": "lec18 数据中心管理", "link": "./lec18" },
            { "text": "lec19 在系统方面的机器学习", "link": "./lec19" },
            { "text": "lec20 集群管理", "link": "./lec20" }
          ]
        }
      ],
      '/zsh/introduction_to_algorithms/': [
        {
          text: '算法导论',
          collapsed: false,
          link: "./index",
          items: [
            { text: "lec01 介绍", link: "./lec1" },
            { text: "lec02 数据结构", link: "./lec2" },
            { text: "lec03 排序", link: "./lec3" },
            { text: "lec04 哈希", link: "./lec4" },
            { text: "lec05 线性排序", link: "./lec5" },
            { text: "lec06 二叉树 Part 1", link: "./lec6" },
            { text: "lec07 二叉树，AVL树 Part 2", link: "./lec7" },
            { text: "lec08 二叉堆", link: "./lec8" },
            { text: "lec09 广度优先搜索", link: "./lec9" },
            { text: "lec10 深度优先搜索", link: "./lec10" },
            { text: "lec11 最短路径问题", link: "./lec11" },
            { text: "lec12 Bellman-Ford算法", link: "./lec12" },
            { text: "lec13 Dijkstra’s Algorithm算法", link: "./lec13" },
            { text: "lec14 Johnson’s Algorithm算法", link: "./lec14" },
            { text: "lec15 动态规划, Part 1: 递归算法", link: "./lec15" },
            { text: "lec16 动态规划, Part 2: 子问题", link: "./lec16" },
            { text: "lec17 动态规划, Part 3: APSP, Parens, Piano", link: "./lec17" },
            { text: "lec18 动态规划, Part 4: Pseudopolynomials", link: "./lec18" },
            { text: "lec19 复杂度", link: "./lec19" },
          ]
        }
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/luomingguo' },
    ],
  },

});
