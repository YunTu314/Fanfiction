// src/constants/characters.ts
import type { CharacterProfile } from '@/types';

// 简易选项列表 (供日历、大纲等下拉菜单使用)
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

// 详细设定数据 (根据上传的人设文件整理)
export const CHARACTERS_DATA: CharacterProfile[] = [
  {
    id: 'asahi',
    name: '朝日 久',
    romaji: 'Asahi Hisashi',
    school: '立教池袋高等学校',
    role: 'Gt. / Ba.',
    color: '#60a5fa', // 淡蓝色 (对应吉他"古兰")
    basicInfo: {
      height: '170cm',
      birthday: '未知',
      age: '16岁',
      class: '1年B组'
    },
    tags: ['穿越者', '被动交友', '富二代', '吉他高手'],
    description: '从横滨来到东京独自上学的少年。为了拥有多彩的高中生活而开始探索，性格温和但保持距离感。',
    likes: '八音盒纯音乐、便利店限定饮料',
    dislikes: '无特别厌恶',
    detail: `
      <p><b>外貌：</b>淡金色短碎发，琥珀色瞳孔，体重62kg。额头左上方别着一枚初中后辈送的发卡。</p>
      <p><b>背景：</b>老家在埼玉县秩父，父母在横滨创业成功的高管。6岁前以为家里很穷，后来才知道是祖父母节俭。初中时因过于沉迷学习被老师指出孤僻，在父亲引导下开始接触吉他。为了追求不一样的高中生活，独自来到东京池袋居住。</p>
      <p><b>性格：</b>温和有礼，很好说话，班级人气不错。但因为频繁转学而习惯了“断舍离”式的人际关系，认为高中朋友毕业后就会断联，所以只保持浅交。</p>
      <p><b>乐器：</b>拥有一把蓝色的吉他取名“古兰”（Guran），一把贝斯取名“姬塔”（Jita）。技术高超但只当做散心，没有完整弹过曲子，也不主动告诉别人自己会弹琴。</p>
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
    description: '成绩优秀、精力充沛的粉发少女。为了在班级里受人欢迎而计划组建乐队，虽然有点小心机但本性善良。',
    likes: '熏三文鱼、水果三明治、流行的东西',
    dislikes: '梅干、酸的东西',
    detail: `
      <p><b>经历：</b>初中时是完美优等生，学生会长，吉他手（自称）。初中毕业后前往英国留学，但因无法适应而迅速归国，这对她来说是想要隐瞒的“黑历史”。</p>
      <p><b>现状：</b>入学羽丘后，为了快速融入集体并成为焦点，决定组建乐队。虽然自称有经验，但其实吉他水平仅限于C和弦，目前正在朝日久和祥子的指导下特训《春日影》。</p>
      <p><b>性格：</b>有点爱慕虚荣和想出风头，但心思细腻，会为了朋友挺身而出。对待异性的态度和同性差不多，既不过于亲密也不疏远。</p>
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
    description: '性格内向、感受独特的“企鹅”系少女。拥有触动人心的歌声和作词能力，对人际关系极为敏感。',
    likes: '金平糖、收集石头/落叶/西瓜虫',
    dislikes: '生鱼子、生鸡蛋 (像在吃生命)',
    detail: `
      <p><b>背景：</b>前CRYCHIC乐队主唱。因为乐队的解散而留下了深刻的心理阴影，认为是因为自己唱得不好才导致祥子退队。一直将自己封闭在天文部。</p>
      <p><b>性格：</b>感情细腻，有着独特的内心世界。容易感到寂寞。在KTV对爱音脱口而出“能一辈子和我组乐队吗”，被爱音误解。</p>
      <p><b>转机：</b>被爱音强行拉着成为了朋友，并被朝日久和祥子（暗中）推动，正在尝试重新面对音乐。内心渴望着“一辈子”的羁绊。</p>
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
    description: 'RiNG前店长的孙女。神出鬼没的吉他天才，只做自己觉得“有趣”的事情，行事作风像猫一样。',
    likes: '抹茶、荞麦面、猫',
    dislikes: '无聊、韭菜、山药泥',
    detail: `
      <p><b>背景：</b>原LIVE HOUSE SPACE店长都筑诗船的外孙女。从小受外婆影响喜欢吉他。父亲在伦敦，母亲也要去伦敦，但乐奈选择留在日本。</p>
      <p><b>特点：</b>经常擅自闯入别人的排练室弹吉他然后离开。技术超群，一眼就能记住乐谱。左撇子。</p>
      <p><b>动机：</b>正在寻找有意思的乐队。被朝日久和爱音关于“一辈子”的讨论吸引。经常被安和昂当做玩偶抱着投喂。</p>
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
    description: '著名影星安和天童的孙女。为了反抗被规划的人生而独自来到东京。表面是完美大小姐，私下是暴躁游戏宅。',
    likes: '电子游戏',
    dislikes: '被安排的人生',
    detail: `
      <p><b>背景：</b>兵库县神户出身。为了小小反抗家族安排，偷偷加入轻音部。在池袋租房独居。</p>
      <p><b>性格：</b>善于处世，懂得察言观色。虽然被安排就读艺能学校，但内心抗拒成为演员。为了发泄压力开始打鼓。</p>
      <p><b>人际：</b>崇拜白鹭千圣，经常去千圣家玩。被千圣推荐加入朝日久的乐队（为了解决她太粘人的问题）。</p>
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
    description: '曾是CRYCHIC的组建者。因家庭变故而不得不退出，现在隐藏身份独自背负一切，暗中帮助爱音。',
    detail: `
      <p><b>背景：</b>原丰川集团大小姐。初三时父亲失误导致集团损失168亿日元，家道中落。父亲酗酒，祥子带着母亲的人偶离家出走照顾父亲。</p>
      <p><b>CRYCHIC：</b>为了走出母亲去世的阴影而组建乐队，却因家庭变故被迫解散。为了不让队友担心，故意表现得冷酷绝情。</p>
      <p><b>行动：</b>在音乐教室结识爱音。为了让灯走出阴影，暗中利用爱音重组乐队，并指导爱音练习《春日影》。</p>
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
      <p><b>背景：</b>单亲家庭，随母姓。为了母亲的期望努力维持大小姐形象，害怕“不被需要”。</p>
      <p><b>动机：</b>无法接受CRYCHIC的解散，一直在寻找祥子。接近爱音和朝日久，是为了将祥子重新拉回乐队。对新乐队的态度是“跳板”。</p>
    `
  },
  {
    id: 'mutsumi',
    name: '若叶 睦',
    romaji: 'Wakaba Mutsumi',
    school: '月之森女子学园',
    role: 'Gt.',
    color: '#86efac', // 绿色
    basicInfo: {
      height: '153cm',
      birthday: '1月14日',
      age: '16岁',
      class: '高中一年级'
    },
    tags: ['沉默寡言', '园艺部', '黄瓜', '重金属'],
    description: '祥子的青梅竹马，父母是知名艺人。表情稀薄，话语极少。',
    likes: '黄瓜、芒果汁',
    detail: `
      <p><b>背景：</b>父亲是搞笑艺人，母亲是演员。家里经常有社会名流。从小练习吉他，使用的是七弦重型吉他。</p>
      <p><b>CRYCHIC：</b>被祥子拉进乐队。在祥子退队时说了一句“我从没觉得玩乐队开心过”，给C团下了死刑判决。内心对祥子抱有深重的负罪感。</p>
      <p><b>特点：</b>在学校种黄瓜。祥子的“半身”。</p>
    `
  },
  {
    id: 'kanon',
    name: '松原 花音',
    romaji: 'Matsubara Kanon',
    school: '庆鹏女子大学',
    role: 'Dr.',
    color: '#93c5fd', // 浅蓝
    basicInfo: {
      height: '156cm',
      birthday: '未知',
      age: '18岁',
      class: '文学部'
    },
    tags: ['迷宫水母', '弱气', '甜点控', '大学生'],
    description: '朝日久认识的学姐，Hello, Happy World!的鼓手。性格内向笨拙，是个超级路痴。',
    likes: '甜点、蛋糕、咖啡、红茶、水母',
    dislikes: '蘑菇',
    detail: `
      <p><b>人际：</b>朝日久刚来东京时帮迷路的她找到了路，因此成为朋友。白鹭千圣的挚友兼室友。在快餐店兼职。</p>
      <p><b>特点：</b>非常喜欢水母。性格软弱容易被卷入麻烦，但在关键时刻很可靠。推荐了RiNG给朝日久。</p>
    `
  },
  {
    id: 'chisato',
    name: '白鹭 千圣',
    romaji: 'Shirasagi Chisato',
    school: '四叶女子大学',
    role: 'Ba.',
    color: '#fef08a', // 浅金
    basicInfo: {
      height: '152cm',
      birthday: '4月6日',
      age: '18岁',
      class: '文学部'
    },
    tags: ['微笑的铁假面', '童星', '腹黑', '现实主义'],
    description: 'Pastel*Palettes的贝斯手。童星出身，有着深不可测的微笑。对朝日久抱有微妙的戒备心。',
    likes: '清淡口味、巴西莓碗、红茶',
    dislikes: '纳豆、虫子',
    detail: `
      <p><b>性格：</b>现实主义者，懂得利用他人。很珍惜把她当普通人看待的朋友（如花音）。</p>
      <p><b>人际：</b>花音的室友。安和昂崇拜的前辈。为了解决昂太粘人的问题，同时也为了防止朝日久过多接触花音，撮合昂加入朝日久的乐队。</p>
    `
  }
];