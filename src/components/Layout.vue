<template>
  <el-container class="common-layout">
    <el-aside width="200px" class="aside-menu">
      <el-menu :default-active="activeMenu" class="el-menu-vertical-demo" @select="handleMenuSelect" router>
        <h3 class="menu-title">📚 小说创作助手</h3>

        <el-menu-item index="/calendar">
          <el-icon>
            <Calendar />
          </el-icon>
          <span>时间线/日历</span>
        </el-menu-item>

        <el-menu-item index="/characters">
          <el-icon>
            <UserFilled />
          </el-icon>
          <span>角色人设</span>
        </el-menu-item>
        <el-menu-item index="/outline">
          <el-icon>
            <Management />
          </el-icon>
          <span>剧情大纲</span>
        </el-menu-item>
        <el-menu-item index="/writing">
          <el-icon>
            <Edit />
          </el-icon>
          <span>写作</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="main-header">
        <h1>{{ headerTitle }}</h1>
      </el-header>
      <el-main class="main-content">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Calendar, UserFilled, Edit } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();

// 使用当前路由路径作为菜单的激活状态
const activeMenu = computed(() => route.path);

const headerTitle = computed(() => {
  // 从路由 meta 中获取标题
  const matchedRoute = route.matched.find(r => r.path === route.path);
  if (matchedRoute && matchedRoute.meta.title) {
    return `📋 ${matchedRoute.meta.title}`;
  }
  return '小说创作助手';
});

const handleMenuSelect = (index: string) => {
  router.push(index);
};
</script>

<style scoped>
/* 样式保持不变 */
.common-layout {
  height: 100vh;
  /* 强制占满视口高度 */
  width: 100vw;
  overflow: hidden;
}

.aside-menu {
  background-color: #545c64;
}

.el-menu-vertical-demo {
  border-right: none;
  height: 100%;
}

.menu-title {
  color: #fff;
  text-align: center;
  padding: 20px 0;
  margin: 0;
  font-size: 18px;
  background-color: #4a5157;
}

.main-header {
  height: 60px;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: #fff;
}

.main-content {
  /* 修改这里：去除 padding，让内部组件自己决定边距，以便计算高度 */
  padding: 10;
  background-color: #f0f2f5;
  overflow: hidden;
  /* 禁止主内容区滚动，强制内容自适应 */
  display: flex;
  flex-direction: column;
}
</style>