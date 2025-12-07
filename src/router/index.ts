// src/router/index.ts

import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
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
  // 使用 Hash 模式 (URL 会带 # 号)
  history: createWebHashHistory(), 
  routes
})

export default router;