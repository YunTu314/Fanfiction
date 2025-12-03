<template>
  <Layout />
</template>

<script lang="ts" setup>
import Layout from './components/Layout.vue';
</script>

<style>
/* 全局样式保持不变 */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
/* src/style.css 或 src/App.vue */
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden; /* 禁止整个页面的滚动条 */
}
</style>