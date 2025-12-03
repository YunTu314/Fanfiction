// src/constants/characters.ts
import type { CharacterProfile } from '@/types';

// 简易选项列表 (供日历等下拉菜单使用)
export const CHARACTER_OPTIONS = [
  { name: '朝日久', id: 'asahi' },
  { name: '千早爱音', id: 'anon' },
  { name: '高松灯', id: 'tomori' },
  { name: '要乐奈', id: 'rana' },
  { name: '安和昂', id: 'subaru' },
  { name: '丰川祥子', id: 'sakiko' },
  { name: '长崎素世', id: 'soyo' },
  { name: '椎名立希', id: 'rikki' },
  { name: '若叶睦', id: 'mutsumi' },
  { name: '松原花音', id: 'kanon' },
  { name: '白鹭千圣', id: 'chisato' },
];

// 详细设定数据
export const CHARACTERS_DATA: CharacterProfile[] = [
  {
    id: 'asahi',
    name: '朝日 久',
    romaji: 'Asahi Hisashi',
    school: '立教池袋高等学校',
    role: 'Gt. / Ba.',
    color: '#60a5fa', // 淡蓝色
    basicInfo: {
      height: '170cm',
      birthday: '未知',
      age: '16岁',
      class: '1年B组'
    },
    tags: ['穿越者', '被动交友', '富二代', '吉他高手'],
    description: '从横滨来到东京独自上学的少年，为了拥有多彩的高中生活而开始探索。',
    likes: '八音盒纯音乐、便利店限定饮料',
    dislikes: '无特别厌恶',
    detail: `
      <p><b>背景：</b>父母在横滨创业成功的高管，家境富裕。初中时因过于沉迷学习被老师指出孤僻，在父亲引导下开始接触吉他。为了追求不一样的高中生活，独自来到东京池袋居住。</p>
      <p><b>性格：</b>温和有礼，但也因为频繁转学而习惯了“断舍离”式的人际关系。属于被动交友型，不会拒绝别人的好意，但内心保持着一种疏离的清醒。</p>
      <p><b>乐器：</b>拥有一把蓝色的Fender吉他“古兰”和一把贝斯“姬塔”。技术高超，但只把音乐当做调节心情的手段，没有组乐队的执念。</p>
    `
  },
  {
    id: 'anon',
    name: '千早 爱音',
    romaji: 'Chihaya Anon',
    school: '羽丘女子学园',
    role: 'Gt. (新手) / Vo.',
    color: '#ff90b2', // 粉色
    basicInfo: {
      height: '160cm',
      birthday: '9月8日',
      age: '16岁',
      class: '高中一年级'
    },
    tags: ['爱慕虚荣', '行动力强', '前学生会长', '留学归国'],
    description: '成绩优秀、精力充沛的粉发少女。为了在班级里受人欢迎而计划组建乐队。',
    likes: '熏三文鱼、水果三明治、流行的东西',
    dislikes: '梅干、酸的东西',
    detail: `
      <p><b>经历：</b>初中时是完美优等生，学生会长。曾前往英国留学但因无法适应而失败归国，这对她来说是想要隐瞒的“黑历史”。</p>
      <p><b>现状：</b>入学羽丘后，为了快速融入集体并成为焦点，决定组建乐队。虽然自称有经验，但其实吉他水平仅限于C和弦，目前正在朝日久和祥子的指导下特训《春日影》。</p>
      <p><b>性格：</b>虽然有点小虚荣和算计，但本性善良，关心朋友，关键时刻很有行动力。</p>
    `
  },
  {
    id: 'tomori',
    name: '高松 灯',
    romaji: 'Takamatsu Tomori',
    school: '羽丘女子学园',
    role: 'Vo.',
    color: '#778899', // 灰蓝色
    basicInfo: {
      height: '155cm',
      birthday: '11月22日',
      age: '16岁',
      class: '高中一年级'
    },
    tags: ['天文部', '收集癖', '作词', 'CRYCHIC'],
    description: '性格内向、感受独特的“企鹅”系少女。拥有触动人心的歌声和作词能力。',
    likes: '金平糖、收集石头/落叶/西瓜虫',
    dislikes: '生鱼子、生鸡蛋 (像在吃生命)',
    detail: `
      <p><b>背景：</b>前CRYCHIC乐队主唱。因为乐队的解散而留下了深刻的心理阴影，认为是因为自己唱得不好才导致祥子退队。一直将自己封闭在天文部。</p>
      <p><b>转机：</b>被爱音强行拉着成为了朋友，并被朝日久和祥子（暗中）推动，正在尝试重新面对音乐。内心渴望着“一辈子”的羁绊。</p>
    `
  },
  {
    id: 'sakiko',
    name: '丰川 祥子',
    romaji: 'Togawa Sakiko',
    school: '羽丘女子学园',
    role: 'Key. / Comp.',
    color: '#fcd34d', // 琥珀色/金色
    basicInfo: {
      height: '155cm',
      birthday: '2月14日',
      age: '16岁',
      class: '高中一年级'
    },
    tags: ['伪装的大小姐', '落魄千金', '作曲天才', '高自尊'],
    description: '曾是CRYCHIC的组建者。因家庭变故而不得不退出，现在隐藏身份独自背负一切。',
    detail: `
      <p><b>现状：</b>家道中落，父亲酗酒，背负着巨大的生活压力。表面上维持着高岭之花的形象，实际上在拼命打工维持生计。</p>
      <p><b>行动：</b>为了让灯走出阴影，同时也为了彻底切断过去的羁绊，正在暗中利用爱音，引导她们重组乐队。</p>
    `
  },
  {
    id: 'subaru',
    name: '安和 昂',
    romaji: 'Awa Subaru',
    school: '花咲川女子学园',
    role: 'Dr.',
    color: '#a855f7', // 紫色
    basicInfo: {
      height: '158cm',
      birthday: '4月27日',
      age: '16岁',
      class: '高中一年级'
    },
    tags: ['星二代', '游戏宅', '叛逆期', '演技派'],
    description: '著名影星的孙女，为了反抗被规划的人生而独自来到东京。表面是完美大小姐，私下是暴躁游戏宅。',
    likes: '电子游戏',
    dislikes: '被安排的人生',
    detail: `
      <p><b>性格：</b>善于处世，懂得察言观色。虽然被安排就读艺能学校，但内心抗拒成为演员。为了发泄压力开始打鼓。</p>
      <p><b>人际：</b>崇拜白鹭千圣，经常去千圣家玩。被千圣推荐加入朝日久的乐队（为了解决她太粘人的问题）。</p>
    `
  },
  {
    id: 'rana',
    name: '要 乐奈',
    romaji: 'Kaname Rana',
    school: '花咲川女子学园',
    role: 'Gt.',
    color: '#d1d5db', // 银色
    basicInfo: {
      height: '150cm',
      birthday: '2月22日',
      age: '14岁',
      class: '初中三年级'
    },
    tags: ['猫系', '天才', '自由人', 'LiveHouse孙女'],
    description: 'RiNG前店长的孙女。神出鬼没的吉他天才，只做自己觉得“有趣”的事情。',
    likes: '抹茶、荞麦面、猫',
    dislikes: '无聊、韭菜',
    detail: `
      <p><b>特点：</b>经常擅自闯入别人的排练室弹吉他然后离开。技术超群，一眼就能记住乐谱。</p>
      <p><b>动机：</b>正在寻找有意思的乐队。被朝日久和爱音关于“一辈子”的讨论吸引。</p>
    `
  },
  {
    id: 'soyo',
    name: '长崎 素世',
    romaji: 'Nagasaki Soyo',
    school: '月之森女子学园',
    role: 'Ba.',
    color: '#fde047', // 鹅黄色
    basicInfo: {
      height: '162cm',
      birthday: '5月27日',
      age: '16岁',
      class: '高中一年级'
    },
    tags: ['妈妈属性', '腹黑', '重女', '复辟派'],
    description: '吹奏乐部成员。表面温柔体贴，内心却执着于恢复旧的CRYCHIC，为此不惜利用他人。',
    detail: `
      <p><b>动机：</b>无法接受CRYCHIC的解散，一直在寻找祥子的下落。接近爱音和朝日久，是为了将祥子重新拉回乐队。</p>
    `
  }
];