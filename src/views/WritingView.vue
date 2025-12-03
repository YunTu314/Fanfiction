<template>
  <div class="writing-container">
    <el-alert title="写作中心" type="warning" description="内容已自动保存至本地，请放心创作。" show-icon closable />
    <el-input
      v-model="writingContent"
      :autosize="{ minRows: 20, maxRows: 30 }"
      type="textarea"
      placeholder="开始您的创作..."
      style="margin-top: 20px;"
    />
    <div style="margin-top: 20px; text-align: right;">
      <el-button type="primary" @click="saveContent">手动保存</el-button>
      <el-button type="danger" @click="clearContent">清除缓存</el-button>
    </div>
    <el-alert :title="statusMessage" :type="statusType" style="margin-top: 10px;" :closable="false" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, Ref } from 'vue';
import { ElMessage } from 'element-plus';

const STORAGE_KEY = 'fanfic_draft_content';
const writingContent: Ref<string> = ref('');
const statusMessage = ref('内容已从本地加载。');
const statusType = ref('success'); // success | warning | info | error

// --- 本地存储操作函数 ---

const loadContent = () => {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    writingContent.value = cached;
    ElMessage.success('写作内容已从本地加载！');
  } else {
    ElMessage.info('本地暂无缓存，请开始创作。');
    statusMessage.value = '请开始创作，内容将自动保存。';
    statusType.value = 'info';
  }
};

const saveContent = () => {
  if (writingContent.value.trim() === '') {
    localStorage.removeItem(STORAGE_KEY);
    statusMessage.value = '内容为空，缓存已清除。';
    statusType.value = 'warning';
    ElMessage.warning('内容为空，无法保存。');
    return;
  }
  localStorage.setItem(STORAGE_KEY, writingContent.value);
  statusMessage.value = `自动保存成功！上次保存时间: ${new Date().toLocaleTimeString()}`;
  statusType.value = 'success';
};

const clearContent = () => {
  writingContent.value = '';
  localStorage.removeItem(STORAGE_KEY);
  statusMessage.value = '缓存已清除，当前内容为空。';
  statusType.value = 'error';
  ElMessage.error('写作内容本地缓存已清空！');
};

// --- 生命周期与监听 ---

onMounted(() => {
  loadContent();
});

// 使用 watch 监听内容变化，实现自动保存（防抖优化）
let saveTimer: number | null = null;

watch(writingContent, () => {
  if (saveTimer !== null) {
    clearTimeout(saveTimer);
  }
  
  // 3秒后自动保存（防抖）
  saveTimer = setTimeout(() => {
    saveContent();
    statusMessage.value = `自动保存中...`;
    statusType.value = 'info';
  }, 3000) as unknown as number; 
}, { deep: true });
</script>

<style scoped>
.writing-container {
  min-height: 80vh;
}
</style>