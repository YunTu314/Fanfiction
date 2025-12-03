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

export interface CharacterProfile {
  id: string;
  name: string;       // 姓名
  romaji: string;     // 罗马音
  school: string;     // 学校/所属
  role: string;       // 担当位置 (Gt. / Ba. / Dr. / Key. / Vo.)
  color: string;      // 印象色 (Hex Code)
  avatar?: string;    // 头像图片路径 (预留)
  
  // 基础档案
  basicInfo: {
    height: string;
    birthday: string;
    age?: string;
    class?: string;   // 班级
    cv?: string;      // 声优 (原设信息)
  };

  // 设定详情
  tags: string[];     // 标签 (e.g. "猫系", "学生会长")
  description: string; // 一句话简介
  detail: string;      // 详细设定/背景故事 (支持 HTML 或换行)
  likes?: string;
  dislikes?: string;
}

// src/types/index.ts (追加内容)

// ... 原有的 StoryEvent, CharacterProfile ...

export type OutlineTag = '起' | '承' | '转' | '合' | '日常' | '伏笔';

export interface OutlineScene {
  id: string;
  title: string;
  content: string;      // 大纲摘要/正文
  tag: OutlineTag;      // 节奏标签
  date?: string;        // 关联日期 (YYYY-MM-DD)
  characters?: string[]; // 涉及角色
}

export interface OutlineChapter {
  id: string;
  title: string;        // 章节名 (e.g. 第一卷：春日影)
  description?: string; // 章节简介
  scenes: OutlineScene[];
  isExpanded?: boolean; // UI状态：是否展开
}