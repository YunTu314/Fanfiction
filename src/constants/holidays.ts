// src/constants/holidays.ts
import type { HolidayInfo } from '@/types';

export const WEEK_DAYS = [
  '周一 (月)', '周二 (火)', '周三 (水)', '周四 (木)', '周五 (金)', '周六 (土)', '周日 (日)'
];

// key 严格对应 japanese-holidays 库返回的英文名称
export const HOLIDAY_MAP: Record<string, HolidayInfo> = {
  "New Year's Day": { 
    cnName: '元旦', 
    activity: '去神社初诣（Hatsumode），求签，拿压岁钱。高中生通常会和朋友互发“AkeOme”（新年快乐）消息，或者在家里吃御节料理。' 
  },
  "Coming of Age Day": { 
    cnName: '成人之日', 
    activity: '虽然是给20岁年轻人过的节日，但高中生也放假。临近期末，高三生通常在拼命备考，高一高二可能会去唱K放松。' 
  },
  "National Foundation Day": { 
    cnName: '建国纪念日', 
    activity: '2月的公休假。临近情人节（2.14），女生们可能正在家里试做本命或义理巧克力。' 
  },
  "The Emperor's Birthday": { 
    cnName: '天皇诞辰', 
    activity: '普通的休息日。如果是连休，可能会和家人出去吃饭或者去游乐园。' 
  },
  "Vernal Equinox Day": { 
    cnName: '春分', 
    activity: '正值春假期间！也是新学年分班前的最后假期。通常会进行社团的春季集训，或者去扫墓。' 
  },
  "Showa Day": { 
    cnName: '昭和之日', 
    activity: '黄金周（GW）的第一天！社团活动最密集的时期，运动部通常会有各种练习赛。' 
  },
  "Constitution Memorial Day": { 
    cnName: '宪法纪念日', 
    activity: '黄金周中段。没有社团活动的学生会去原宿、涩谷逛街，或者去迪士尼乐园。' 
  },
  "Greenery Day": { 
    cnName: '绿之日', 
    activity: '黄金周后半。可能会去公园野餐，或者被高三的学长学姐拉着去图书馆复习。' 
  },
  "Children's Day": { 
    cnName: '儿童节', 
    activity: '黄金周最后一天。在家里疯狂补没写完的作业，一边感叹“假期这就结束了吗”。' 
  },
  "Marine Day": { 
    cnName: '海之日', 
    activity: '通常标志着暑假的开始！会约好朋友去海边、江之岛或者市民泳池，也可能开始暑期打工。' 
  },
  "Mountain Day": { 
    cnName: '山之日', 
    activity: '暑假中期。很多学生会跟随父母回乡下老家探亲，准备迎接盂兰盆节。' 
  },
  "Respect for the Aged Day": { 
    cnName: '敬老之日', 
    activity: '9月的白银周。这时候通常是学校“文化祭”或“体育祭”的准备冲刺期，要在学校留到很晚做道具。' 
  },
  "Autumnal Equinox Day": { 
    cnName: '秋分', 
    activity: '秋高气爽，适合社团练习。如果是文化系社团，可能正在为秋季发表会做准备。' 
  },
  "Sports Day": { 
    cnName: '体育之日', 
    activity: '很多学校会在这前后举办体育祭。如果没有活动，就是普通的休息日，适合去这就去跑个步？' 
  },
  "Culture Day": { 
    cnName: '文化之日', 
    activity: '如果是著名的文化高中，这天可能会对外开放举办文化祭。如果闲着，可能会去看电影或Live。' 
  },
  "Labor Thanksgiving Day": { 
    cnName: '勤劳感谢之日', 
    activity: '11月底，期末考试逼近。大部分高中生这一天都会在补习班、图书馆或者家庭餐厅里死磕课本。' 
  },
};