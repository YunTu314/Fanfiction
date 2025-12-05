// src/views/Outline/outline.ts
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { OutlineChapter, OutlineScene, OutlineTag } from '@/types';
import { INITIAL_OUTLINE } from '@/constants/outline';

const STORAGE_KEY = 'fanfic_outline_data';
const INBOX_ID = 'inbox_chapter';

export function useOutline() {
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
  const saveData = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allChapters.value));
  };

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

  const resetData = () => {
    localStorage.removeItem(STORAGE_KEY);
    loadData();
    ElMessage.success('数据已重置');
  };

  // --- 导出功能 ---
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

  // --- 导入功能 ---
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
        if (parsedData.length > 0 && (!parsedData[0].id || !parsedData[0].scenes)) {
          throw new Error('格式错误：缺少必要的字段');
        }

        allChapters.value = parsedData;
        
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
      target.value = '';
    };
    reader.readAsText(file, 'utf-8');
  };

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

  // --- 场景操作 ---
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

  onMounted(loadData);

  return {
    allChapters,
    inboxChapter,
    normalChapters,
    quickInput,
    fileInputRef,
    drawerVisible,
    chapterDialogVisible,
    isEditing,
    formScene,
    formChapter,
    saveData,
    resetData,
    exportData,
    triggerImport,
    handleImport,
    handleQuickAdd,
    addChapter,
    editChapter,
    saveChapter,
    handleChapterCmd,
    addScene,
    editScene,
    saveScene,
    handleDeleteScene,
    goToTimeline,
    formatDateShort,
    getTagColor,
    getTagColorLight
  };
}