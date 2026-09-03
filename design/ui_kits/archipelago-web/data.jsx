/* Wrapped in an IIFE: every text/babel script in this kit shares one top-level
   scope, so bare consts would collide across files. Exports go on window. */
(() => {
  /* Sample content for the Archipelago kit. Public courses, plausible Chinese notes. */
  const DOMAINS = [
    { id: 'pp', name: '政治哲学', latin: 'Political philosophy',
      summary: '从社会契约到分配正义：这片海域关心的是权力凭什么正当。',
      concepts: ['无知之幕', '自然状态', '分配正义', '消极自由'], courseCount: 3, noteCount: 46 },
    { id: 'sys', name: '计算机系统', latin: 'Computer systems',
      summary: '把机器拆到能重装回去：从算法的代价一路读到操作系统的取舍。',
      concepts: ['摊还分析', '虚拟内存', '缓存一致性'], courseCount: 4, noteCount: 61 },
    { id: 'econ', name: '经济学', latin: 'Economics',
      summary: '价格是一种信息，博弈是一种结构。两者都在解释人为什么这样选。',
      concepts: ['纳什均衡', '信息不对称', '机制设计'], courseCount: 2, noteCount: 28 },
    { id: 'mind', name: '认知科学', latin: 'Cognitive science',
      summary: '大脑既是器官也是模型。这片海域在两种描述之间来回航行。',
      concepts: ['预测编码', '工作记忆', '双系统'], courseCount: 2, noteCount: 19 }
  ];

  const COURSES = [
    { id: 'justice', domain: '政治哲学', code: 'ER 22', institution: 'Harvard', title: '正义论导读',
      summary: '从功利主义到罗尔斯，十二讲的主线与分歧。', noteCount: 12, conceptCount: 31, progress: '已整理 8 / 12' },
    { id: 'liberty', domain: '政治哲学', code: 'PHIL 181', institution: 'Yale', title: '自由的两种概念',
      summary: '伯林那篇演讲之后，「自由」这个词分裂成了两条航线。', noteCount: 9, conceptCount: 18, progress: '已整理 9 / 9' },
    { id: 'algo', domain: '计算机系统', code: '6.006', institution: 'MIT', title: '算法导论',
      summary: '不是背模板，而是学会给一个做法算价钱。', noteCount: 24, conceptCount: 44, progress: '已整理 15 / 24' },
    { id: 'game', domain: '经济学', code: 'ECON 159', institution: 'Yale', title: '博弈论',
      summary: '当结果取决于别人怎么选，理性本身就变成了一个结构问题。', noteCount: 16, conceptCount: 27, progress: '已整理 11 / 16' }
  ];

  const NOTES = [
    { id: 'veil', course: '正义论导读', courseId: 'justice', lecture: '第 3 讲', title: '无知之幕',
      summary: '梳理这个思想装置的作用，以及它为什么不是论证的终点。',
      concepts: ['原初状态', '分配正义'], readingTime: '约 12 分钟', updated: '三天前更新' },
    { id: 'nozick', course: '正义论导读', courseId: 'justice', lecture: '第 5 讲', title: '诺齐克的反驳',
      summary: '持有正义论如何把「分配」这个提法本身当成问题。',
      concepts: ['持有正义', '自我所有'], readingTime: '约 9 分钟', updated: '上周更新' },
    { id: 'amort', course: '算法导论', courseId: 'algo', lecture: '第 7 讲', title: '摊还分析',
      summary: '一次昂贵的操作可以被很多次便宜的操作摊平——前提是你算得清。',
      concepts: ['势能法', '动态数组'], readingTime: '约 15 分钟', updated: '两天前更新' },
    { id: 'nash', course: '博弈论', courseId: 'game', lecture: '第 4 讲', title: '纳什均衡为什么存在',
      summary: '不动点定理给了一个存在性答案，但没有给出如何到达。',
      concepts: ['不动点', '混合策略'], readingTime: '约 11 分钟', updated: '四天前更新' },
    { id: 'liberty2', course: '自由的两种概念', courseId: 'liberty', lecture: '第 2 讲', title: '消极自由的边界',
      summary: '「不被干涉」听起来清楚，落到制度上却需要一整套前提。',
      concepts: ['消极自由', '干涉'], readingTime: '约 8 分钟', updated: '上月更新' }
  ];

  const LECTURE_TOC = [
    { id: 'setup', label: '问题的设置', level: 2 },
    { id: 'veil', label: '无知之幕是什么', level: 3 },
    { id: 'orig', label: '原初状态里的人', level: 3 },
    { id: 'why', label: '为什么需要这层遮蔽', level: 2 },
    { id: 'crit', label: '两种反驳', level: 2 }
  ];

  const BACKLINKS = [
    { course: '正义论导读 · 第 5 讲', title: '诺齐克的反驳',
      context: '…他认为无知之幕本身已经预设了一种分配观。', href: '#' },
    { course: '博弈论 · 第 9 讲', title: '不确定下的选择',
      context: '…把幕后的人当作一个极端风险厌恶的决策者来读。', href: '#' },
    { course: '自由的两种概念 · 第 6 讲', title: '平等与自由的取舍',
      context: '…如果幕后没人知道自己的位置，自由与平等的冲突会推迟出现。', href: '#' }
  ];

  const COURSE_LECTURES = [
    { value: 'l1', label: '第 1 讲 · 功利主义的诱惑', depth: 1 },
    { value: 'l2', label: '第 2 讲 · 契约论的复活', depth: 1 },
    { value: 'veil', label: '第 3 讲 · 无知之幕', depth: 1 },
    { value: 'l4', label: '第 4 讲 · 两个正义原则', depth: 1 },
    { value: 'nozick', label: '第 5 讲 · 诺齐克的反驳', depth: 1 },
    { value: 'l6', label: '第 6 讲 · 能力路径', depth: 1 }
  ];

  Object.assign(window, { DOMAINS, COURSES, NOTES, LECTURE_TOC, BACKLINKS, COURSE_LECTURES });

})();
