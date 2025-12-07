// src/views/Calendar/calendar.ts
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { StoryEvent } from '@/types';
import { CHARACTER_OPTIONS } from '@/constants/characters';
import { INITIAL_EVENTS } from '@/constants/events';

const STORAGE_SETTINGS_KEY = 'fanfic_calendar_settings';
const STORAGE_EVENTS_KEY = 'fanfic_calendar_events'; // 新增：事件存储Key

export function useCalendar() {
  const route = useRoute();

  // --- 状态 ---
  const viewMode = ref<'calendar' | 'timeline'>('calendar');
  const defaultStartDate = '2020-04-06'; 
  const currentDate = ref(new Date(defaultStartDate));
  const characterOptions = CHARACTER_OPTIONS;

  // 设置弹窗状态
  const settingsVisible = ref(false);
  const formSettings = ref({ startDate: defaultStartDate });

  // 事件弹窗状态
  const dialogVisible = ref(false);
  const dialogTitle = ref('事件管理');
  const showDayListInDialog = ref(true);
  const isEditing = ref(false);

  // 数据状态
  const storyEvents = ref<Map<string, StoryEvent[]>>(new Map());
  const initialEvent: StoryEvent = { id: '', date: '', title: '', characters: [], description: '' };
  const currentEvent = ref<StoryEvent>({ ...initialEvent }); 
  const formEvent = ref<StoryEvent>({ ...initialEvent }); 

  // --- 数据持久化 (新增) ---
  const saveEventsToStorage = () => {
    // Map 转 Array 存储
    const data = Array.from(storyEvents.value.entries());
    localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(data));
  };

  const loadEventsFromStorage = () => {
    const cached = localStorage.getItem(STORAGE_EVENTS_KEY);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        storyEvents.value = new Map(data);
      } catch (e) {
        console.error('加载事件数据失败', e);
        loadInitialData(); // 失败则加载默认
      }
    } else {
      loadInitialData(); // 无缓存则加载默认
    }
  };

  const loadInitialData = () => {
    storyEvents.value.clear(); 
    INITIAL_EVENTS.forEach(event => {
      const existing = storyEvents.value.get(event.date) || [];
      existing.push(event);
      storyEvents.value.set(event.date, existing);
    });
    saveEventsToStorage(); // 保存初始数据
  };

  const loadSettings = () => {
    const cached = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        if (data.startDate) {
          formSettings.value.startDate = data.startDate;
          if (!route.query.date) {
            currentDate.value = new Date(data.startDate);
          }
        }
      } catch (e) { console.error(e); }
    }
  };

  const saveSettings = () => {
    if (!formSettings.value.startDate) return ElMessage.warning('请选择日期');
    const settings = { startDate: formSettings.value.startDate };
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    currentDate.value = new Date(formSettings.value.startDate);
    settingsVisible.value = false;
    ElMessage.success('初始时间已更新');
  };

  const openSettings = () => {
    const cached = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      formSettings.value.startDate = data.startDate || defaultStartDate;
    }
    settingsVisible.value = true;
  };

  // --- 计算属性 ---
  const currentDayEvents = computed(() => storyEvents.value.get(currentEvent.value.date) || []);
  const sortedTimelineData = computed(() => {
    const list: { date: string; events: StoryEvent[] }[] = [];
    for (const [date, events] of storyEvents.value.entries()) {
      if (events && events.length > 0) list.push({ date, events });
    }
    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });
  const totalEventsCount = computed(() => {
    let count = 0;
    for (const events of storyEvents.value.values()) count += events.length;
    return count;
  });

  // --- 事件处理 ---
  const handleDayClick = (day: string) => {
    currentEvent.value.date = day;
    Object.assign(formEvent.value, initialEvent, { date: day, id: Date.now().toString() });
    isEditing.value = false;
    showDayListInDialog.value = true;
    dialogTitle.value = '当日事件管理';
    dialogVisible.value = true;
  };

  const quickAddEvent = (day: string) => {
    currentEvent.value.date = day;
    Object.assign(formEvent.value, initialEvent, { date: day, id: Date.now().toString() });
    isEditing.value = false;
    showDayListInDialog.value = false;
    dialogTitle.value = `新增事件 (${day})`;
    dialogVisible.value = true;
  };

  const confirmDeleteEvent = (eventId: string, date: string) => {
    ElMessageBox.confirm('确定要删除这个事件吗？', '警告', { type: 'warning' })
      .then(() => deleteEvent(eventId, date));
  };

  const editEvent = (event: StoryEvent) => {
    Object.assign(formEvent.value, JSON.parse(JSON.stringify(event)));
    currentEvent.value.date = event.date;
    isEditing.value = true;
    showDayListInDialog.value = viewMode.value === 'calendar';
    dialogTitle.value = '编辑事件';
    dialogVisible.value = true;
  };

  const deleteEvent = (id: string, dateStr?: string) => { 
    const day = dateStr || currentEvent.value.date;
    const list = storyEvents.value.get(day) || [];
    const newList = list.filter(e => e.id !== id);
    if (newList.length > 0) {
        storyEvents.value.set(day, newList);
    } else {
        storyEvents.value.delete(day);
    }
    saveEventsToStorage(); // 保存更改
    if(formEvent.value.id === id) dialogVisible.value = false;
    ElMessage.success('事件已删除');
  };

  const saveEvent = () => {
    if(!formEvent.value.title.trim()) return ElMessage.error('标题不能为空');
    const day = formEvent.value.date;
    let list = storyEvents.value.get(day);
    if (!list) list = [];
    else list = [...list];

    const newObj = { ...formEvent.value };
    if(isEditing.value) {
      const idx = list.findIndex(e => e.id === newObj.id);
      if(idx !== -1) list.splice(idx, 1, newObj);
    } else {
      list.push(newObj);
    }
    
    storyEvents.value.set(day, list);
    saveEventsToStorage(); // 保存更改
    dialogVisible.value = false;
    ElMessage.success('保存成功');
  };

  const selectDate = (type: string) => {
    const d = new Date(currentDate.value);
    if (type === 'prev-month') d.setMonth(d.getMonth() - 1);
    if (type === 'next-month') d.setMonth(d.getMonth() + 1);
    if (type === 'today') {
      d.setTime(new Date(formSettings.value.startDate).getTime());
    }
    currentDate.value = d;
  };

  const formatDateTitle = (val: Date) => `${val.getFullYear()}年 ${val.getMonth() + 1}月`;

  onMounted(() => {
    loadEventsFromStorage(); // 改为从本地存储加载
    loadSettings(); 
    if (route.query.date) {
      const targetDate = new Date(route.query.date as string);
      if (!isNaN(targetDate.getTime())) {
        currentDate.value = targetDate;
        handleDayClick(route.query.date as string);
      }
    }
  });

  return {
    viewMode, currentDate, characterOptions, dialogVisible, dialogTitle, showDayListInDialog, isEditing,
    storyEvents, currentEvent, formEvent, currentDayEvents, sortedTimelineData, totalEventsCount,
    settingsVisible, formSettings, openSettings, saveSettings,
    handleDayClick, quickAddEvent, confirmDeleteEvent, editEvent, deleteEvent, saveEvent, selectDate, formatDateTitle
  };
}