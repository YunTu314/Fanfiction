// src/constants/events.ts
import type { StoryEvent } from '@/types';

export const INITIAL_EVENTS: StoryEvent[] = [
  {
    id: 'init_1',
    date: '2020-04-01',
    title: '夜游偶遇花音',
    characters: ['朝日久', '松原花音', '白鹭千圣'],
    description: '朝日久在周边夜游时，遇到迷路的松原花音，并将其送至白鹭千圣处。'
  },
  {
    id: 'init_2',
    date: '2020-04-06',
    title: '高中开学',
    characters: ['朝日久'],
    description: '立教池袋高等学校开学。'
  },
  { 
    id: 'init_3', 
    date: '2020-04-29', 
    title: '黄金周特训', 
    characters: ['千早爱音', '高松灯'], 
    description: '开始吉他特训。' 
  },
  { 
    id: 'init_4', 
    date: '2020-04-29', 
    title: '祥子回访', 
    characters: ['丰川祥子'], 
    description: '祥子独自来到音乐教室。' 
  }
];