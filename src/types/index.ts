// src/types/index.ts

export interface StoryEvent {
  id: string;
  date: string;       // YYYY-MM-DD
  title: string;
  characters: string[]; // 涉及角色名称数组
  description: string;
}

export interface HolidayInfo {
  cnName: string;
  activity: string;
}