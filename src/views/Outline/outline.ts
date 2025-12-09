
// src/views/Outline/outline.ts
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { OutlineChapter, OutlineScene, OutlineTag, StoryEvent } from '@/types';

const STORAGE_KEY = 'fanfic_outline_data';
const INBOX_ID = 'inbox_chapter';
const STORAGE_CALENDAR_SETTINGS_KEY = 'fanfic_calendar_settings';
const STORAGE_CALENDAR_EVENTS_KEY = 'fanfic_calendar_events';

export function useOutline() {
  const router = useRouter();

  // --- 大纲数据 ---
  const allChapters = ref<OutlineChapter[]>([]);
  const quickInput = ref('');
  const fileInputRef = ref<HTMLInputElement | null>(null);

  // --- 场景编辑弹窗状态 ---
  const sceneDialogVisible = ref(false);
  const isEditing = ref(false);
  
  // --- 日历数据状态 ---
  const calendarEvents = ref<Map<string, StoryEvent[]>>(new Map());
  const calendarCurrentDate = ref(new Date()); 

  // --- 索引与表单 ---
  const inboxChapter = computed(() => allChapters.value.find(c => c.id === INBOX_ID));
  const normalChapters = computed({
    get: () => allChapters.value.filter(c => c.id !== INBOX_ID),
    set: (val) => {
      const inbox = allChapters.value.find(c => c.id === INBOX_ID);
      allChapters.value = inbox ? [inbox, ...val] : val;
    }
  });

  const chapterDialogVisible = ref(false);
  const currentChapterIndex = ref<number | 'inbox'>(-1); 
  const currentSceneIndex = ref(-1);

  // 初始化增加 endDate
  const formScene = ref<OutlineScene>({ id: '', title: '', content: '', tag: '承', date: '', endDate: '' });
  const formChapter = ref<OutlineChapter>({ id: '', title: '', scenes: [] });

  // --- 计算属性：天数统计 ---
  const durationDays = computed(() => {
    if (!formScene.value.date) return 0;
    const start = new Date(formScene.value.date);
    const end = formScene.value.endDate ? new Date(formScene.value.endDate) : start;
    // 计算天数差，+1 是因为包含当天
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays + 1;
  });

  // --- 初始化与持久化 ---
  const saveData = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(allChapters.value));
  
  const loadData = () => {
    const cached = localStorage.getItem(STORAGE_KEY);
    allChapters.value = cached ? JSON.parse(cached) : [];
    if (!allChapters.value.find(c => c.id === INBOX_ID)) {
      allChapters.value.unshift({ id: INBOX_ID, title: '灵感收集箱', description: '', isExpanded: true, scenes: [] });
    }
  };

  const resetData = () => {
    allChapters.value = allChapters.value.filter(c => c.id === INBOX_ID);
    saveData();
    ElMessage.success('数据已清空');
  };

  // --- 核心逻辑：加载日历数据 ---
  const loadCalendarEvents = () => {
    const cachedEvents = localStorage.getItem(STORAGE_CALENDAR_EVENTS_KEY);
    if (cachedEvents) {
      try {
        calendarEvents.value = new Map(JSON.parse(cachedEvents));
      } catch (e) { calendarEvents.value = new Map(); }
    } else {
      calendarEvents.value = new Map();
    }

    if (formScene.value.date) {
      calendarCurrentDate.value = new Date(formScene.value.date);
    } else {
      const cachedSettings = localStorage.getItem(STORAGE_CALENDAR_SETTINGS_KEY);
      if (cachedSettings) {
        try {
          const settings = JSON.parse(cachedSettings);
          calendarCurrentDate.value = settings.startDate ? new Date(settings.startDate) : new Date();
        } catch (e) { calendarCurrentDate.value = new Date(); }
      } else {
        calendarCurrentDate.value = new Date();
      }
    }
  };

  // --- 切换日历月份 ---
  const changeCalendarMonth = (offset: number) => {
    const d = new Date(calendarCurrentDate.value);
    if (offset === 0) {
      d.setTime(Date.now()); // 回到现实的今天
    } else {
      d.setMonth(d.getMonth() + offset);
    }
    calendarCurrentDate.value = d;
  };

  // --- 修改：处理日期范围选择 ---
  const handleDatePicked = (day: string) => {
    // 逻辑：
    // 1. 如果没有开始时间，或者已经有了完整的范围（开始+结束），则重置为新的开始时间。
    // 2. 如果只有开始时间，且点击日期在开始时间之后，设为结束时间。
    // 3. 如果只有开始时间，且点击日期在开始时间之前，则将新点击的作为开始，原开始作为结束。

    const currentStart = formScene.value.date;
    const currentEnd = formScene.value.endDate;

    if (!currentStart || (currentStart && currentEnd)) {
      // Case 1: 新的选择开始
      formScene.value.date = day;
      formScene.value.endDate = ''; // 重置结束时间
    } else {
      // Case 2 & 3: 已有开始，选择第二个端点
      if (day >= currentStart) {
        formScene.value.endDate = day;
      } else {
        formScene.value.endDate = currentStart;
        formScene.value.date = day;
      }
    }
  };

  const openSceneDialog = () => {
    loadCalendarEvents();
    sceneDialogVisible.value = true;
  };

  const addScene = (cIndex: number) => {
    currentChapterIndex.value = cIndex;
    currentSceneIndex.value = -1;
    // 初始化时清空 date 和 endDate
    formScene.value = { id: Date.now().toString(), title: '', content: '', tag: '承', date: '', endDate: '' };
    isEditing.value = false;
    openSceneDialog();
  };

  const editScene = (scene: OutlineScene, cIndex: number, sIndex: number) => {
    currentChapterIndex.value = cIndex === -1 ? 'inbox' : cIndex;
    currentSceneIndex.value = sIndex;
    // 深拷贝，防止直接修改
    formScene.value = JSON.parse(JSON.stringify(scene));
    // 兼容旧数据：如果旧数据没有 endDate，初始化为空
    if (!formScene.value.endDate) formScene.value.endDate = '';
    
    isEditing.value = true;
    openSceneDialog();
  };

  const saveScene = () => {
    if (!formScene.value.title) return ElMessage.error('标题不能为空');
    
    let targetChapter: OutlineChapter | undefined;
    if (currentChapterIndex.value === 'inbox') targetChapter = allChapters.value.find(c => c.id === INBOX_ID);
    else targetChapter = normalChapters.value[currentChapterIndex.value as number];

    if (targetChapter) {
      targetChapter = allChapters.value.find(c => c.id === targetChapter!.id);
    }

    if (targetChapter) {
      if (currentSceneIndex.value === -1) targetChapter.scenes.push({ ...formScene.value });
      else targetChapter.scenes[currentSceneIndex.value] = { ...formScene.value };
      saveData();
      sceneDialogVisible.value = false;
    }
  };

  const handleDeleteScene = () => {
    ElMessageBox.confirm('确定删除这段剧情吗？', '提示').then(() => {
      let targetChapter = currentChapterIndex.value === 'inbox' 
        ? allChapters.value.find(c => c.id === INBOX_ID)
        : allChapters.value.find(c => c.id === normalChapters.value[currentChapterIndex.value as number].id);

      if (targetChapter) {
        targetChapter.scenes.splice(currentSceneIndex.value, 1);
        saveData();
        sceneDialogVisible.value = false;
      }
    });
  };

  // ... 其余逻辑保持不变 ...
  const exportData = () => {
    const blob = new Blob([JSON.stringify(allChapters.value, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `outline_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };
  const triggerImport = () => fileInputRef.value?.click();
  const handleImport = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        allChapters.value = JSON.parse(ev.target?.result as string);
        if(!allChapters.value.find(c=>c.id===INBOX_ID)) allChapters.value.unshift({id:INBOX_ID, title:'灵感', scenes:[], isExpanded:true});
        saveData(); ElMessage.success('导入成功');
      } catch(err){ ElMessage.error('格式错误'); }
      (e.target as HTMLInputElement).value='';
    };
    reader.readAsText(file);
  };
  const handleQuickAdd = () => {
    if(!quickInput.value.trim()) return;
    const inbox = allChapters.value.find(c=>c.id===INBOX_ID);
    if(inbox) { inbox.scenes.unshift({id:Date.now().toString(), title:quickInput.value, content:'', tag:'伏笔', date: '', endDate: ''}); saveData(); quickInput.value=''; ElMessage.success('已添加'); }
  };
  const addChapter = () => { formChapter.value={id:Date.now().toString(), title:'', scenes:[], isExpanded:true}; currentChapterIndex.value=-1; chapterDialogVisible.value=true; };
  const editChapter = (c: OutlineChapter) => { if(c.id===INBOX_ID)return; currentChapterIndex.value=normalChapters.value.findIndex(x=>x.id===c.id); formChapter.value=JSON.parse(JSON.stringify(c)); chapterDialogVisible.value=true; };
  const saveChapter = () => {
    if(!formChapter.value.title) return;
    if(currentChapterIndex.value===-1) allChapters.value.push({...formChapter.value});
    else { const t = allChapters.value.find(c=>c.id===normalChapters.value[currentChapterIndex.value as number].id); if(t){t.title=formChapter.value.title; t.description=formChapter.value.description;} }
    saveData(); chapterDialogVisible.value=false;
  };
  const handleChapterCmd = (cmd: string, idx: number) => {
    const c = normalChapters.value[idx];
    if(cmd==='edit') editChapter(c);
    else if(cmd==='delete') ElMessageBox.confirm('删除?').then(()=>{ allChapters.value=allChapters.value.filter(x=>x.id!==c.id); saveData(); });
  };
  const goToTimeline = (date: string) => router.push({ path: '/calendar', query: { date } });
  const formatDateShort = (d: string) => d.slice(5);
  const getTagColor = (t: OutlineTag) => ({'起':'#409EFF','承':'#E6A23C','转':'#F56C6C','合':'#67C23A'}[t]||'#909399');
  const getTagColorLight = () => 'transparent';

  onMounted(loadData);

  return {
    allChapters, inboxChapter, normalChapters, quickInput, fileInputRef, 
    sceneDialogVisible, chapterDialogVisible, isEditing, formScene, formChapter,
    calendarEvents, calendarCurrentDate, handleDatePicked, changeCalendarMonth,
    durationDays, // 导出持续天数
    saveData, resetData, exportData, triggerImport, handleImport, handleQuickAdd, addChapter, editChapter, saveChapter, handleChapterCmd, addScene, editScene, saveScene, handleDeleteScene, goToTimeline, formatDateShort, getTagColor, getTagColorLight
  };
}
