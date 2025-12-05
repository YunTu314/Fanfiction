// src/router/index.ts

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import CalendarView from '../views/CalendarView.vue';
import CharactersView from '../views/CharactersView.vue';
import WritingView from '@/views/WritingView.vue';
import OutlineView from '@/views/OutlineView.vue'; // 新增

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/calendar',
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('@/views/Calendar/Calendar.vue'),
    meta: { title: '时间线/日历' },
  },
  {
    path: '/characters',
    name: 'Characters',
    component: () => import('@/views/Characters/Characters.vue'),
    meta: { title: '角色人设' },
  },
  {
    path: '/outline',
    name: 'Outline',
    component: () => import('@/views/Outline/Outline.vue'),
    meta: { title: '剧情大纲' },
  },
  {
    path: '/writing',
    name: 'Writing',
    component: () => import('@/views/Writing/Writing.vue'),
    meta: { title: '写作' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;