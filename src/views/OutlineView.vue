<template>
  <div class="outline-container">
    <div class="toolbar">
      <div class="header-text">
        <h2>剧情大纲</h2>
        <span class="subtitle">规划您的故事脉络与节奏</span>
      </div>
      <div class="button-group">
        <el-button type="primary" icon="Plus" @click="addChapter">新建章节</el-button>
        
        <el-tooltip content="覆盖当前大纲数据" placement="top">
          <el-button type="warning" plain icon="Upload" @click="triggerImport">导入大纲</el-button>
        </el-tooltip>
        <input 
          type="file" 
          ref="fileInputRef" 
          style="display: none" 
          accept=".json" 
          @change="handleImport" 
        />

        <el-button type="success" plain icon="Download" @click="exportData">导出大纲</el-button>
        
        <el-popconfirm title="确定重置所有大纲数据吗？" @confirm="resetData">
          <template #reference>
            <el-button type="danger" link>重置初始</el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>

    <el-scrollbar class="outline-content" view-class="scrollbar-view">
      <div class="chapter-list">
        
        <div class="inbox-area" v-if="inboxChapter">
          <div class="inbox-header">
            <span class="inbox-title">灵感收集箱</span>
            <span class="inbox-tip">（未分类的灵感暂存处，可拖拽至下方章节）</span>
          </div>
          <draggable 
            v-model="inboxChapter.scenes" 
            item-key="id" 
            animation="200"
            group="scenes"
            handle=".scene-card"
            @end="saveData"
            class="scene-grid inbox-grid"
          >
            <template #item="{ element: scene, index: sIndex }">
              <div class="scene-card inbox-card" @click="editScene(scene, -1, sIndex)">
                <div class="scene-body">
                  <div class="scene-top">
                    <el-tag size="small" effect="dark" type="warning" round>灵感</el-tag>
                  </div>
                  <h4 class="scene-title">{{ scene.title }}</h4>
                  <p class="scene-preview">{{ scene.content || '...' }}</p>
                </div>
              </div>
            </template>
          </draggable>
          <div v-if="inboxChapter.scenes.length === 0" class="inbox-placeholder">
            暂无灵感，试着在下方快速输入一条吧 👇
          </div>
        </div>

        <el-divider content-position="center">正文章节</el-divider>

        <draggable 
          v-model="normalChapters" 
          item-key="id" 
          handle=".chapter-drag-handle"
          animation="300"
          group="chapters"
          @end="saveData"
        >
          <template #item="{ element: chapter, index: cIndex }">
            <div class="chapter-block">
              <div class="chapter-header">
                <div class="header-left">
                  <el-icon class="chapter-drag-handle"><Rank /></el-icon>
                  <el-button link @click="chapter.isExpanded = !chapter.isExpanded">
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

              <el-collapse-transition>
                <div v-show="chapter.isExpanded" class="scene-list-container">
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
                        <div class="scene-tag-bar" :style="{ backgroundColor: getTagColor(scene.tag) }"></div>
                        <div class="scene-body">
                          <div class="scene-top">
                            <el-tag size="small" effect="plain" :color="getTagColorLight(scene.tag)" :style="{ borderColor: getTagColor(scene.tag), color: getTagColor(scene.tag) }">
                              {{ scene.tag }}
                            </el-tag>
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
                  
                  <div v-if="chapter.scenes.length === 0" class="empty-scene-placeholder" @click="addScene(cIndex)">
                    <el-icon><Plus /></el-icon> 点击添加剧情片段
                  </div>
                </div>
              </el-collapse-transition>
            </div>
          </template>
        </draggable>
        
        <div class="bottom-spacer"></div>
      </div>
    </el-scrollbar>

    <div class="quick-add-bar">
      <div class="quick-add-content">
        <el-input 
          v-model="quickInput" 
          placeholder="💡 捕捉到一个灵感？输入内容后按 Enter 快速保存..." 
          @keyup.enter="handleQuickAdd"
          clearable
        >
          <template #prefix>
            <el-icon><EditPen /></el-icon>
          </template>
          <template #append>
            <el-button type="primary" @click="handleQuickAdd">
              保存灵感 (Enter)
            </el-button>
          </template>
        </el-input>
      </div>
    </div>

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
            <el-button v-if="formScene.date" type="primary" link icon="Right" @click="goToTimeline(formScene.date!)">
              查看当日
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="剧情大纲">
          <el-input v-model="formScene.content" type="textarea" :rows="12" placeholder="在这里详细描述这段剧情发生了什么..." />
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

    <el-dialog v-model="chapterDialogVisible" title="章节信息" width="400px">
      <el-form :model="formChapter">
        <el-form-item label="章节标题"><el-input v-model="formChapter.title" placeholder="例如：第一卷：春日影" /></el-form-item>
        <el-form-item label="章节简介"><el-input v-model="formChapter.description" type="textarea" placeholder="本卷主旨..." /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="chapterDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveChapter">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import draggable from 'vuedraggable';
import { 
  Plus, Download, Rank, CaretRight, MoreFilled, Calendar, Right, Delete, EditPen, Upload
} from '@element-plus/icons-vue';
import type { OutlineChapter, OutlineScene, OutlineTag } from '@/types';
import { INITIAL_OUTLINE } from '@/constants/outline';

const STORAGE_KEY = 'fanfic_outline_data';
const INBOX_ID = 'inbox_chapter';
const router = useRouter();

// --- 数据状态 ---
const allChapters = ref<OutlineChapter[]>([]);
const quickInput = ref('');
const fileInputRef = ref<HTMLInputElement | null>(null);

// 计算属性：分离 Inbox 和普通章节
const inboxChapter = computed(() => allChapters.value.find(c => c.id === INBOX_ID));
const normalChapters = computed({
  get: () => allChapters.value.filter(c => c.id !== INBOX_ID),
  set: (val) => {
    const inbox = allChapters.value.find(c => c.id === INBOX_ID);
    if (inbox) {
      allChapters.value = [inbox, ...val];
    } else {
      allChapters.value = val;
    }
  }
});

// 抽屉/弹窗状态
const drawerVisible = ref(false);
const chapterDialogVisible = ref(false);
const isEditing = ref(false);

const currentChapterIndex = ref<number | 'inbox'>(-1); 
const currentSceneIndex = ref(-1);

const formScene = ref<OutlineScene>({ id: '', title: '', content: '', tag: '承' });
const formChapter = ref<OutlineChapter>({ id: '', title: '', scenes: [] });

// --- 初始化与持久化 ---
const loadData = () => {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    try {
      allChapters.value = JSON.parse(cached);
    } catch (e) {
      console.error('缓存数据损坏，重置为默认');
      allChapters.value = JSON.parse(JSON.stringify(INITIAL_OUTLINE));
    }
  } else {
    allChapters.value = JSON.parse(JSON.stringify(INITIAL_OUTLINE));
  }

  // 确保 Inbox 存在
  if (!allChapters.value.find(c => c.id === INBOX_ID)) {
    allChapters.value.unshift({
      id: INBOX_ID,
      title: '灵感收集箱',
      description: '未分类的灵感暂存处',
      isExpanded: true,
      scenes: []
    });
  }
};

const saveData = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allChapters.value));
};

const resetData = () => {
  localStorage.removeItem(STORAGE_KEY);
  loadData();
  ElMessage.success('数据已重置');
};

const exportData = () => {
  const dataStr = JSON.stringify(allChapters.value, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `outline_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// --- 新增：导入功能 ---
const triggerImport = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
};

const handleImport = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const parsedData = JSON.parse(content);

      if (!Array.isArray(parsedData)) {
        throw new Error('格式错误：导入的数据必须是数组');
      }

      // 简单的格式校验：检查第一项是否有 id 和 scenes
      if (parsedData.length > 0 && (!parsedData[0].id || !parsedData[0].scenes)) {
        throw new Error('格式错误：缺少必要的字段');
      }

      // 覆盖当前数据
      allChapters.value = parsedData;
      
      // 再次确保 Inbox 存在（防止导入的数据没有 Inbox）
      if (!allChapters.value.find(c => c.id === INBOX_ID)) {
        allChapters.value.unshift({
          id: INBOX_ID,
          title: '灵感收集箱',
          description: '未分类的灵感暂存处',
          isExpanded: true,
          scenes: []
        });
      }

      saveData();
      ElMessage.success('大纲导入成功！');
    } catch (err) {
      console.error(err);
      ElMessage.error('导入失败：文件格式不正确');
    }
    
    // 清空 input，允许重复导入同名文件
    target.value = '';
  };

  reader.readAsText(file, 'utf-8');
};

onMounted(loadData);

// --- 快速添加灵感 ---
const handleQuickAdd = () => {
  const content = quickInput.value.trim();
  if (!content) return;

  const newScene: OutlineScene = {
    id: Date.now().toString(),
    title: content, 
    content: '',
    tag: '伏笔' 
  };

  const inbox = allChapters.value.find(c => c.id === INBOX_ID);
  if (inbox) {
    inbox.scenes.unshift(newScene); 
    saveData();
    quickInput.value = '';
    ElMessage.success('灵感已捕获！');
  }
};

// --- 章节操作 ---
const addChapter = () => {
  formChapter.value = { id: Date.now().toString(), title: '', description: '', scenes: [], isExpanded: true };
  currentChapterIndex.value = -1;
  chapterDialogVisible.value = true;
};

const editChapter = (chapter: OutlineChapter) => {
  if (chapter.id === INBOX_ID) return;
  const idx = normalChapters.value.findIndex(c => c.id === chapter.id);
  currentChapterIndex.value = idx;
  formChapter.value = JSON.parse(JSON.stringify(chapter));
  chapterDialogVisible.value = true;
};

const saveChapter = () => {
  if (!formChapter.value.title) return ElMessage.error('标题不能为空');
  
  if (typeof currentChapterIndex.value === 'number') {
    if (currentChapterIndex.value === -1) {
      allChapters.value.push({ ...formChapter.value });
    } else {
      const targetId = normalChapters.value[currentChapterIndex.value].id;
      const target = allChapters.value.find(c => c.id === targetId);
      if (target) {
        target.title = formChapter.value.title;
        target.description = formChapter.value.description;
      }
    }
  }
  saveData();
  chapterDialogVisible.value = false;
};

const handleChapterCmd = (cmd: string, index: number) => {
  const chapter = normalChapters.value[index];
  if (cmd === 'edit') editChapter(chapter);
  else if (cmd === 'delete') {
    ElMessageBox.confirm('确定删除该章节及其所有剧情吗？', '警告', { type: 'warning' })
      .then(() => {
        allChapters.value = allChapters.value.filter(c => c.id !== chapter.id);
        saveData();
      });
  }
};

// --- 场景(剧情)操作 ---
const addScene = (cIndex: number) => {
  currentChapterIndex.value = cIndex;
  currentSceneIndex.value = -1;
  formScene.value = { id: Date.now().toString(), title: '', content: '', tag: '承' };
  isEditing.value = false;
  drawerVisible.value = true;
};

const editScene = (scene: OutlineScene, cIndex: number, sIndex: number) => {
  currentChapterIndex.value = cIndex === -1 ? 'inbox' : cIndex;
  currentSceneIndex.value = sIndex;
  formScene.value = JSON.parse(JSON.stringify(scene));
  isEditing.value = true;
  drawerVisible.value = true;
};

const saveScene = () => {
  if (!formScene.value.title) return ElMessage.error('标题不能为空');
  
  let targetChapter: OutlineChapter | undefined;

  if (currentChapterIndex.value === 'inbox') {
    targetChapter = allChapters.value.find(c => c.id === INBOX_ID);
  } else {
    const normalIdx = currentChapterIndex.value as number;
    targetChapter = normalChapters.value[normalIdx]; 
    if (targetChapter) {
      targetChapter = allChapters.value.find(c => c.id === targetChapter!.id);
    }
  }

  if (targetChapter) {
    if (currentSceneIndex.value === -1) {
      targetChapter.scenes.push({ ...formScene.value });
    } else {
      targetChapter.scenes[currentSceneIndex.value] = { ...formScene.value };
    }
    saveData();
    drawerVisible.value = false;
  }
};

const handleDeleteScene = () => {
  ElMessageBox.confirm('确定删除这段剧情吗？', '提示').then(() => {
    let targetChapter: OutlineChapter | undefined;
    if (currentChapterIndex.value === 'inbox') {
      targetChapter = allChapters.value.find(c => c.id === INBOX_ID);
    } else {
      const targetId = normalChapters.value[currentChapterIndex.value as number].id;
      targetChapter = allChapters.value.find(c => c.id === targetId);
    }

    if (targetChapter) {
      targetChapter.scenes.splice(currentSceneIndex.value, 1);
      saveData();
      drawerVisible.value = false;
    }
  });
};

const goToTimeline = (date: string) => {
  router.push({ path: '/calendar', query: { date } });
};

// --- 样式辅助 ---
const formatDateShort = (dateStr: string) => dateStr.slice(5);
const getTagColor = (tag: OutlineTag) => {
  switch (tag) {
    case '起': return '#409EFF'; case '承': return '#E6A23C'; 
    case '转': return '#F56C6C'; case '合': return '#67C23A'; 
    default: return '#909399';
  }
};
const getTagColorLight = (tag: OutlineTag) => 'transparent';
</script>

<style scoped>
.outline-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 20px;
  background-color: #f5f7fa;
  position: relative;
}

/* 工具栏 */
.toolbar { padding: 20px 0; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
.header-text h2 { margin: 0 0 5px 0; color: #303133; }
.subtitle { font-size: 13px; color: #909399; }
.button-group { display: flex; gap: 10px; }

/* 内容区 */
.outline-content { flex: 1; padding-bottom: 100px; }
.scrollbar-view { padding-bottom: 80px; }

/* 灵感收集箱样式 */
.inbox-area {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 30px;
  background-color: #fafafa;
  transition: all 0.3s;
}
.inbox-area:hover { border-color: #409EFF; background-color: #fff; }

.inbox-header { display: flex; align-items: center; gap: 8px; margin-bottom: 15px; color: #E6A23C; }
.inbox-title { font-weight: bold; font-size: 16px; }
.inbox-tip { font-size: 12px; color: #909399; }

.inbox-grid { display: flex; flex-wrap: wrap; gap: 10px; }
.inbox-card { width: 200px; height: 100px; background: #fff; border: 1px solid #e4e7ed; box-shadow: none; }
.inbox-card:hover { border-color: #E6A23C; box-shadow: 0 2px 8px rgba(230, 162, 60, 0.2); }
.inbox-placeholder { text-align: center; color: #909399; font-size: 13px; padding: 20px 0; }

/* 章节块 */
.chapter-block {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  border: 1px solid #ebeef5;
  overflow: hidden;
}
.chapter-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; background-color: #fff; border-bottom: 1px solid #f2f6fc; }
.header-left { display: flex; align-items: center; gap: 8px; }
.chapter-drag-handle { cursor: grab; color: #909399; margin-right: 5px; }
.chapter-title { font-size: 16px; font-weight: bold; color: #303133; cursor: pointer; }
.chapter-desc { font-size: 12px; color: #909399; margin-left: 10px; border-left: 1px solid #dcdfe6; padding-left: 10px; }
.is-rotated { transform: rotate(90deg); transition: transform 0.2s; }
.header-right { display: flex; align-items: center; gap: 10px; }
.more-btn { cursor: pointer; color: #909399; transform: rotate(90deg); }

/* 场景列表 */
.scene-list-container { padding: 15px; background-color: #fafafa; }
.scene-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 15px; }
.scene-card { background: #fff; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); cursor: pointer; position: relative; overflow: hidden; transition: all 0.2s; border: 1px solid transparent; height: 140px; display: flex; flex-direction: column; }
.scene-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-color: #c6e2ff; }
.scene-tag-bar { height: 4px; width: 100%; }
.scene-body { padding: 10px; display: flex; flex-direction: column; flex: 1; }
.scene-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.date-badge { font-size: 12px; color: #909399; display: flex; align-items: center; gap: 4px; background: #f4f4f5; padding: 2px 6px; border-radius: 4px; transition: all 0.2s; }
.date-badge:hover { color: #409EFF; background: #ecf5ff; }
.scene-title { margin: 0 0 6px 0; font-size: 15px; font-weight: 600; color: #303133; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.scene-preview { font-size: 13px; color: #606266; margin: 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; flex: 1; }
.empty-scene-placeholder { border: 2px dashed #e4e7ed; border-radius: 6px; height: 60px; display: flex; align-items: center; justify-content: center; color: #909399; font-size: 14px; cursor: pointer; transition: all 0.2s; }
.empty-scene-placeholder:hover { border-color: #409EFF; color: #409EFF; }

/* 底部留白 */
.bottom-spacer { height: 80px; }

/* 底部快速添加栏 */
.quick-add-bar {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  justify-content: center;
}
.quick-add-content {
  width: 100%;
  max-width: 800px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}

.drawer-footer { display: flex; gap: 10px; }
.date-link-row { display: flex; align-items: center; gap: 10px; }
</style>