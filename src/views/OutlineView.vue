<!-- src/views/OutlineView.vue -->
<template>
  <div class="outline-container">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="header-text">
        <h2>剧情大纲</h2>
        <span class="subtitle">规划您的故事脉络与节奏</span>
      </div>
      <div class="button-group">
        <el-button type="primary" icon="Plus" @click="addChapter">新建章节</el-button>
        <el-button type="success" plain icon="Download" @click="exportData">导出大纲</el-button>
        <el-popconfirm title="确定重置所有大纲数据吗？" @confirm="resetData">
          <template #reference>
            <el-button type="warning" link>重置</el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>

    <!-- 大纲主体内容 (拖拽区域) -->
    <el-scrollbar class="outline-content">
      <div class="chapter-list">
        <!-- 章节拖拽组件 -->
        <draggable 
          v-model="chapters" 
          item-key="id" 
          handle=".chapter-drag-handle"
          animation="300"
          group="chapters"
          @end="saveData"
        >
          <template #item="{ element: chapter, index: cIndex }">
            <div class="chapter-block">
              <!-- 章节头部 -->
              <div class="chapter-header">
                <div class="header-left">
                  <el-icon class="chapter-drag-handle"><Rank /></el-icon>
                  <el-button 
                    link 
                    @click="chapter.isExpanded = !chapter.isExpanded"
                  >
                    <el-icon :class="{ 'is-rotated': chapter.isExpanded }"><CaretRight /></el-icon>
                  </el-button>
                  <span class="chapter-title" @click="editChapter(chapter)">{{ chapter.title }}</span>
                  <span class="chapter-desc" v-if="chapter.description">{{ chapter.description }}</span>
                </div>
                <div class="header-right">
                  <el-button size="small" icon="Plus" @click="addScene(cIndex)">添加剧情</el-button>
                  <el-dropdown trigger="click" @command="(cmd) => handleChapterCmd(cmd, cIndex)">
                    <el-icon class="more-btn"><MoreFilled /></el-icon>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="edit">编辑章节信息</el-dropdown-item>
                        <el-dropdown-item command="delete" style="color: #f56c6c">删除章节</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>

              <!-- 场景(剧情)列表 - 支持折叠 -->
              <el-collapse-transition>
                <div v-show="chapter.isExpanded" class="scene-list-container">
                  <!-- 场景拖拽组件 -->
                  <draggable 
                    v-model="chapter.scenes" 
                    item-key="id" 
                    animation="200"
                    group="scenes"
                    handle=".scene-card"
                    @end="saveData"
                    class="scene-grid"
                  >
                    <template #item="{ element: scene, index: sIndex }">
                      <div class="scene-card" @click="editScene(scene, cIndex, sIndex)">
                        <!-- 节奏标签条 -->
                        <div class="scene-tag-bar" :style="{ backgroundColor: getTagColor(scene.tag) }"></div>
                        
                        <div class="scene-body">
                          <div class="scene-top">
                            <el-tag size="small" effect="plain" :color="getTagColorLight(scene.tag)" :style="{ borderColor: getTagColor(scene.tag), color: getTagColor(scene.tag) }">
                              {{ scene.tag }}
                            </el-tag>
                            <!-- 时间线关联显示 -->
                            <el-tooltip v-if="scene.date" content="点击跳转到时间线" placement="top">
                              <div class="date-badge" @click.stop="goToTimeline(scene.date)">
                                <el-icon><Calendar /></el-icon>
                                <span>{{ formatDateShort(scene.date) }}</span>
                              </div>
                            </el-tooltip>
                          </div>
                          
                          <h4 class="scene-title">{{ scene.title }}</h4>
                          <p class="scene-preview">{{ scene.content || '（暂无详细内容）' }}</p>
                        </div>
                      </div>
                    </template>
                  </draggable>
                  
                  <!-- 空状态提示 -->
                  <div v-if="chapter.scenes.length === 0" class="empty-scene-placeholder" @click="addScene(cIndex)">
                    <el-icon><Plus /></el-icon> 点击添加剧情片段
                  </div>
                </div>
              </el-collapse-transition>
            </div>
          </template>
        </draggable>
        
        <div v-if="chapters.length === 0" class="empty-state">
          <el-empty description="暂无大纲，点击右上角新建章节" />
        </div>
      </div>
    </el-scrollbar>

    <!-- 场景编辑抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="isEditing ? '编辑剧情片段' : '新建剧情片段'"
      direction="rtl"
      size="500px"
      destroy-on-close
    >
      <el-form :model="formScene" label-width="80px" layout="vertical">
        <el-form-item label="标题" required>
          <el-input v-model="formScene.title" placeholder="例如：朝日久与爱音的初遇" />
        </el-form-item>

        <el-form-item label="剧情节奏">
          <el-radio-group v-model="formScene.tag" size="small">
            <el-radio-button label="起" />
            <el-radio-button label="承" />
            <el-radio-button label="转" />
            <el-radio-button label="合" />
            <el-radio-button label="日常" />
            <el-radio-button label="伏笔" />
          </el-radio-group>
        </el-form-item>

        <el-form-item label="关联时间">
          <div class="date-link-row">
            <el-date-picker 
              v-model="formScene.date" 
              type="date" 
              placeholder="选择发生日期" 
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="flex: 1"
            />
            <el-button 
              v-if="formScene.date" 
              type="primary" 
              link 
              icon="Right"
              @click="goToTimeline(formScene.date!)"
            >
              查看当日
            </el-button>
          </div>
          <div class="form-tip">关联日期后，可在时间线视图中快速定位。</div>
        </el-form-item>

        <el-form-item label="剧情大纲">
          <el-input 
            v-model="formScene.content" 
            type="textarea" 
            :rows="12" 
            placeholder="在这里详细描述这段剧情发生了什么..." 
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="drawer-footer">
          <el-button type="danger" plain icon="Delete" v-if="isEditing" @click="handleDeleteScene">删除</el-button>
          <div style="flex: 1"></div>
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" @click="saveScene">保存</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 章节编辑弹窗 -->
    <el-dialog v-model="chapterDialogVisible" title="章节信息" width="400px">
      <el-form :model="formChapter">
        <el-form-item label="章节标题">
          <el-input v-model="formChapter.title" placeholder="例如：第一卷：春日影" />
        </el-form-item>
        <el-form-item label="章节简介">
          <el-input v-model="formChapter.description" type="textarea" placeholder="本卷主旨..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="chapterDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveChapter">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import draggable from 'vuedraggable';
import { 
  Plus, Download, Rank, CaretRight, MoreFilled, Calendar, Right, Delete 
} from '@element-plus/icons-vue';
import type { OutlineChapter, OutlineScene, OutlineTag } from '@/types';

const STORAGE_KEY = 'fanfic_outline_data';
const router = useRouter();

// --- 数据状态 ---
const chapters = ref<OutlineChapter[]>([]);

// 抽屉/弹窗状态
const drawerVisible = ref(false);
const chapterDialogVisible = ref(false);
const isEditing = ref(false);

// 当前操作索引
const currentChapterIndex = ref(-1);
const currentSceneIndex = ref(-1);

// 表单数据
const formScene = ref<OutlineScene>({ id: '', title: '', content: '', tag: '承' });
const formChapter = ref<OutlineChapter>({ id: '', title: '', scenes: [] });

// --- 初始化与持久化 ---
const loadData = () => {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    chapters.value = JSON.parse(cached);
  } else {
    // 默认初始数据
    chapters.value = [
      {
        id: 'c1',
        title: '第一卷：春日影',
        description: '朝日久与爱音的相遇，以及Crychic的往事。',
        isExpanded: true,
        scenes: [
          { id: 's1', title: '序章：转校生与吉他', content: '朝日久来到东京...', tag: '起', date: '2020-04-06' },
          { id: 's2', title: '偶遇：扭伤的脚踝', content: '在RiNG附近...', tag: '承', date: '2020-04-10' }
        ]
      }
    ];
  }
};

const saveData = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chapters.value));
};

const resetData = () => {
  localStorage.removeItem(STORAGE_KEY);
  loadData();
  ElMessage.success('数据已重置');
};

const exportData = () => {
  const dataStr = JSON.stringify(chapters.value, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `outline_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

onMounted(loadData);

// --- 章节操作 ---
const addChapter = () => {
  formChapter.value = { id: Date.now().toString(), title: '', description: '', scenes: [], isExpanded: true };
  currentChapterIndex.value = -1; // -1 表示新增
  chapterDialogVisible.value = true;
};

const editChapter = (chapter: OutlineChapter) => {
  const idx = chapters.value.findIndex(c => c.id === chapter.id);
  currentChapterIndex.value = idx;
  formChapter.value = JSON.parse(JSON.stringify(chapter));
  chapterDialogVisible.value = true;
};

const saveChapter = () => {
  if (!formChapter.value.title) return ElMessage.error('标题不能为空');
  
  if (currentChapterIndex.value === -1) {
    chapters.value.push({ ...formChapter.value });
  } else {
    // 仅更新元数据，保留 scenes
    const target = chapters.value[currentChapterIndex.value];
    target.title = formChapter.value.title;
    target.description = formChapter.value.description;
  }
  saveData();
  chapterDialogVisible.value = false;
};

const handleChapterCmd = (cmd: string, index: number) => {
  if (cmd === 'edit') {
    editChapter(chapters.value[index]);
  } else if (cmd === 'delete') {
    ElMessageBox.confirm('确定删除该章节及其所有剧情吗？', '警告', { type: 'warning' })
      .then(() => {
        chapters.value.splice(index, 1);
        saveData();
      });
  }
};

// --- 场景(剧情)操作 ---
const addScene = (cIndex: number) => {
  currentChapterIndex.value = cIndex;
  currentSceneIndex.value = -1; // 新增
  formScene.value = { id: Date.now().toString(), title: '', content: '', tag: '承' };
  isEditing.value = false;
  drawerVisible.value = true;
};

const editScene = (scene: OutlineScene, cIndex: number, sIndex: number) => {
  currentChapterIndex.value = cIndex;
  currentSceneIndex.value = sIndex;
  formScene.value = JSON.parse(JSON.stringify(scene));
  isEditing.value = true;
  drawerVisible.value = true;
};

const saveScene = () => {
  if (!formScene.value.title) return ElMessage.error('标题不能为空');
  
  const chapter = chapters.value[currentChapterIndex.value];
  if (currentSceneIndex.value === -1) {
    chapter.scenes.push({ ...formScene.value });
  } else {
    chapter.scenes[currentSceneIndex.value] = { ...formScene.value };
  }
  saveData();
  drawerVisible.value = false;
};

const handleDeleteScene = () => {
  ElMessageBox.confirm('确定删除这段剧情吗？', '提示').then(() => {
    const chapter = chapters.value[currentChapterIndex.value];
    chapter.scenes.splice(currentSceneIndex.value, 1);
    saveData();
    drawerVisible.value = false;
  });
};

// --- 跳转逻辑 ---
const goToTimeline = (date: string) => {
  // 利用 Vue Router 跳转，并带上 query 参数
  // 需要在 CalendarView 中监听 query 变化来响应
  router.push({ path: '/calendar', query: { date } });
};

// --- 样式辅助 ---
const formatDateShort = (dateStr: string) => {
  return dateStr.slice(5); // 只显示 MM-DD
};

const getTagColor = (tag: OutlineTag) => {
  switch (tag) {
    case '起': return '#409EFF'; // 蓝
    case '承': return '#E6A23C'; // 黄
    case '转': return '#F56C6C'; // 红
    case '合': return '#67C23A'; // 绿
    case '伏笔': return '#909399'; // 灰
    case '日常': return '#d1edc4'; // 浅绿
    default: return '#409EFF';
  }
};

const getTagColorLight = (tag: OutlineTag) => {
  // 简单的淡色处理，用于Tag背景
  return 'transparent'; 
};
</script>

<style scoped>
.outline-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 20px;
  background-color: #f5f7fa;
}

/* 工具栏 */
.toolbar {
  padding: 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-text h2 { margin: 0 0 5px 0; color: #303133; }
.subtitle { font-size: 13px; color: #909399; }
.button-group { display: flex; gap: 10px; }

/* 内容区 */
.outline-content {
  flex: 1;
}

/* 章节块 */
.chapter-block {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  border: 1px solid #ebeef5;
  overflow: hidden;
}

.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background-color: #fff;
  border-bottom: 1px solid #f2f6fc;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chapter-drag-handle {
  cursor: grab;
  color: #909399;
  margin-right: 5px;
}
.chapter-drag-handle:active { cursor: grabbing; }

.chapter-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  cursor: pointer;
}
.chapter-title:hover { color: #409EFF; }

.chapter-desc {
  font-size: 12px;
  color: #909399;
  margin-left: 10px;
  border-left: 1px solid #dcdfe6;
  padding-left: 10px;
}

.is-rotated { transform: rotate(90deg); transition: transform 0.2s; }

.header-right { display: flex; align-items: center; gap: 10px; }
.more-btn { cursor: pointer; color: #909399; transform: rotate(90deg); }

/* 场景列表容器 */
.scene-list-container {
  padding: 15px;
  background-color: #fafafa;
}

/* 场景 Grid 布局 */
.scene-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 15px;
}

/* 场景卡片 */
.scene-card {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.2s;
  border: 1px solid transparent;
  height: 140px; /* 固定高度 */
  display: flex;
  flex-direction: column;
}

.scene-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-color: #c6e2ff;
}

.scene-tag-bar {
  height: 4px;
  width: 100%;
}

.scene-body {
  padding: 10px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.scene-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.date-badge {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f4f4f5;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s;
}
.date-badge:hover { color: #409EFF; background: #ecf5ff; }

.scene-title {
  margin: 0 0 6px 0;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scene-preview {
  font-size: 13px;
  color: #606266;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

/* 空状态占位符 */
.empty-scene-placeholder {
  border: 2px dashed #e4e7ed;
  border-radius: 6px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.empty-scene-placeholder:hover {
  border-color: #409EFF;
  color: #409EFF;
}

.empty-state { margin-top: 50px; }

/* 抽屉内样式 */
.date-link-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.form-tip { font-size: 12px; color: #909399; margin-top: 4px; }
.drawer-footer { display: flex; gap: 10px; }
</style>