<template>
  <div class="app-layout">
    <header class="app-header">
      <TopNav />
    </header>

    <main class="app-main">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import TopNav from '@/components/TopNav.vue';
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  overflow: hidden; /* 防止整个页面出现滚动条 */
}

#app {
  height: 100%;
}
</style>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column; /* 关键：改为垂直排列 */
  height: 100vh;
  width: 100vw;
  background-color: #f5f7fa;
}

.app-header {
  flex-shrink: 0; /* 防止头部被压缩 */
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05); /* 给头部加一点阴影，更有层次感 */
}

.app-main {
  flex: 1; /* 占据剩余空间 */
  overflow: hidden; /* 关键：确保内部页面可以自己滚动，而不是撑开外层 */
  position: relative;
}
</style>