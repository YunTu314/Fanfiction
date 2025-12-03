// src/utils/holidayHelper.ts
import * as JapaneseHolidays from 'japanese-holidays';
import { HOLIDAY_MAP } from '@/constants/holidays';
import type { HolidayInfo } from '@/types';

export const getHolidayInfo = (dateStrOrDate: string | Date): HolidayInfo | null => {
  const date = new Date(dateStrOrDate);
  const englishName = JapaneseHolidays.isHoliday(date);
  
  if (!englishName) return null;

  // 1. 尝试直接匹配字典
  let info = HOLIDAY_MAP[englishName];

  // 2. 处理字典中没有的特殊情况 (如补假)
  if (!info) {
    if (englishName.includes("Substitute") || englishName.includes("Observer")) {
      return { 
        cnName: '补假 (振替休日)', 
        activity: '因为假期刚好撞上周日而获得的额外休息日。通常会睡个懒觉或者去逛街。' 
      };
    }
    return { 
      cnName: englishName, 
      activity: '公休假。' 
    };
  }
  return info;
};