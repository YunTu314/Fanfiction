<template>
  <div class="top-nav-container">
    <div class="nav-logo">
      <el-icon size="24" color="#409EFF" style="margin-right: 8px;"><EditPen /></el-icon>
      <span class="app-title">同人创作助手</span>
    </div>

    <el-menu
      :default-active="activePath"
      class="top-menu"
      mode="horizontal"
      router
      :ellipsis="false"
    >
      <el-menu-item index="/outline">
        <el-icon><collection /></el-icon>
        <span>剧情大纲</span>
      </el-menu-item>
      
      <el-menu-item index="/characters">
        <el-icon><user /></el-icon>
        <span>角色人设</span>
      </el-menu-item>

      <el-menu-item index="/writing">
        <el-icon><document-copy /></el-icon>
        <span>正文写作</span>
      </el-menu-item>

      <el-menu-item index="/calendar">
        <el-icon><calendar /></el-icon>
        <span>时间线</span>
      </el-menu-item>
    </el-menu>

    <div class="nav-actions">
      <el-button circle size="small" icon="Setting" title="设置" />
      <el-avatar :size="30" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" style="margin-left: 10px;" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { 
  EditPen, Collection, User, DocumentCopy, Calendar, Setting 
} from '@element-plus/icons-vue';

const route = useRoute();
const activePath = computed(() => route.path);
</script>

<style scoped>
.top-nav-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #dcdfe6;
  background-color: #fff;
  padding: 0 20px;
  box-sizing: border-box;
}

.nav-logo {
  display: flex;
  align-items: center;
  width: 200px; /* 固定宽度防止挤压 */
  flex-shrink: 0;
}

.app-title {
  font-weight: bold;
  font-size: 18px;
  color: #303133;
}

.top-menu {
  flex: 1;
  border-bottom: none !important; /* 去除 el-menu 默认底边框 */
  background-color: transparent;
  justify-content: center; /* 菜单居中显示，如果想居左可改为 flex-start */
  display: flex;
}

/* 调整菜单项的高度和选中样式，使其与顶栏高度一致 */
:deep(.el-menu-item) {
  height: 59px;
  line-height: 59px;
  font-size: 15px;
  border-bottom: 2px solid transparent;
}

:deep(.el-menu-item.is-active) {
  border-bottom: 2px solid #409EFF !important;
  color: #409EFF;
  background-color: transparent !important; /* 去除背景色，只留底部线条 */
}

:deep(.el-menu-item:hover) {
  background-color: #ecf5ff !important;
}

.nav-actions {
  width: 200px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>