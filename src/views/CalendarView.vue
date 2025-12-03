<template>
  <div class="view-container">
    <div class="view-toolbar">
      <div class="toolbar-left">
        <h2 class="page-title">剧情时间线</h2>
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button label="calendar">
            <el-icon style="vertical-align: middle; margin-right: 4px"><Calendar /></el-icon>
            日历视图
          </el-radio-button>
          <el-radio-button label="timeline">
            <el-icon style="vertical-align: middle; margin-right: 4px"><List /></el-icon>
            事件瀑布流
          </el-radio-button>
        </el-radio-group>
      </div>

      <div class="toolbar-right" v-if="viewMode === 'calendar'">
        <span class="current-date-label">{{ formatDateTitle(currentDate) }}</span>
        <el-button-group>
          <el-button size="small" @click="selectDate('prev-month')">上个月</el-button>
          <el-button size="small" @click="selectDate('today')">今天</el-button>
          <el-button size="small" @click="selectDate('next-month')">下个月</el-button>
        </el-button-group>
      </div>
      
      <div class="toolbar-right" v-else>
        <el-tag type="info">共记录 {{ totalEventsCount }} 个事件</el-tag>
      </div>
    </div>

    <div class="view-content">
      <StoryCalendar 
        v-if="viewMode === 'calendar'"
        :currentDate="currentDate"
        :eventsMap="storyEvents"
        @day-click="handleDayClick"
      />
      
      <StoryTimeline 
        v-else
        :timelineData="sortedTimelineData"
        @edit-event="editEvent"
        @delete-event="confirmDeleteEvent"
        @quick-add="quickAddEvent"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="50%" align-center>
      <el-card shadow="never" style="margin-bottom: 20px;" v-if="showDayListInDialog">
        <template #header>
          <div class="card-header"><span>{{ currentEvent.date }} 事件列表</span></div>
        </template>
        <el-timeline v-if="currentDayEvents.length" style="max-height: 200px; overflow-y: auto;">
          <el-timeline-item v-for="event in currentDayEvents" :key="event.id" :timestamp="event.title">
            <div style="display:flex; justify-content:space-between; align-items:center">
              <span>{{ event.description }}</span>
              <div>
                <el-button type="primary" link size="small" @click="editEvent(event)">编辑</el-button>
                <el-button type="danger" link size="small" @click="deleteEvent(event.id)">删除</el-button>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-card>

      <el-form :model="formEvent" label-width="80px">
        <el-divider content-position="left">{{ isEditing ? '编辑事件' : '新增事件' }}</el-divider>
        <el-form-item label="标题" required><el-input v-model="formEvent.title" /></el-form-item>
        <el-form-item label="角色">
          <el-select v-model="formEvent.characters" multiple filterable allow-create default-first-option style="width: 100%;">
            <el-option v-for="item in characterOptions" :key="item.id" :label="item.name" :value="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述"><el-input type="textarea" v-model="formEvent.description" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="saveEvent">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed ,onMounted} from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Calendar, List } from '@element-plus/icons-vue';

// 导入组件
import StoryCalendar from '@/components/StoryCalendar.vue';
import StoryTimeline from '@/components/StoryTimeline.vue';

// 导入数据与类型
import type { StoryEvent } from '@/types';
import { CHARACTER_OPTIONS } from '@/constants/characters';
import { INITIAL_EVENTS } from '@/constants/events';

import { useRoute } from 'vue-router';
const route = useRoute();

// --- 状态 ---
const viewMode = ref<'calendar' | 'timeline'>('calendar');
const currentDate = ref(new Date('2020/04/06'));
const characterOptions = CHARACTER_OPTIONS;

// 弹窗状态
const dialogVisible = ref(false);
const dialogTitle = ref('事件管理');
const showDayListInDialog = ref(true);
const isEditing = ref(false);

// 数据状态
const storyEvents = ref<Map<string, StoryEvent[]>>(new Map());
const initialEvent: StoryEvent = { id: '', date: '', title: '', characters: [], description: '' };
const currentEvent = ref<StoryEvent>({ ...initialEvent }); // 当前选中日期/事件
const formEvent = ref<StoryEvent>({ ...initialEvent }); // 表单数据

// --- 初始化数据 ---
const loadInitialData = () => {
  INITIAL_EVENTS.forEach(event => {
    const existing = storyEvents.value.get(event.date) || [];
    existing.push(event);
    storyEvents.value.set(event.date, existing);
  });
};
loadInitialData();

onMounted(() => {
  // 检查 URL 是否带有 date 参数
  if (route.query.date) {
    const targetDate = new Date(route.query.date as string);
    if (!isNaN(targetDate.getTime())) {
      currentDate.value = targetDate; // 设置日历当前日期
      handleDayClick(route.query.date as string); // 自动触发点击，弹出事件列表
    }
  }
});

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

// 来自 Calendar 组件
const handleDayClick = (day: string) => {
  currentEvent.value.date = day;
  Object.assign(formEvent.value, initialEvent, { date: day, id: Date.now().toString() });
  isEditing.value = false;
  showDayListInDialog.value = true;
  dialogTitle.value = '当日事件管理';
  dialogVisible.value = true;
};

// 来自 Timeline 组件
const quickAddEvent = (day: string) => {
  currentEvent.value.date = day;
  Object.assign(formEvent.value, initialEvent, { date: day, id: Date.now().toString() });
  isEditing.value = false;
  showDayListInDialog.value = false;
  dialogTitle.value = `新增事件 (${day})`;
  dialogVisible.value = true;
};

// 来自子组件的删除确认
const confirmDeleteEvent = (eventId: string, date: string) => {
  ElMessageBox.confirm('确定要删除这个事件吗？', '警告', { type: 'warning' })
    .then(() => deleteEvent(eventId, date));
};

// 通用逻辑
const editEvent = (event: StoryEvent) => {
  Object.assign(formEvent.value, JSON.parse(JSON.stringify(event)));
  currentEvent.value.date = event.date; // 确保日期同步
  isEditing.value = true;
  showDayListInDialog.value = viewMode.value === 'calendar'; // 日历模式下编辑仍显示列表方便
  dialogTitle.value = '编辑事件';
  dialogVisible.value = true;
};

const deleteEvent = (id: string, dateStr?: string) => { 
  const day = dateStr || currentEvent.value.date;
  const list = storyEvents.value.get(day) || [];
  const newList = list.filter(e => e.id !== id);
  newList.length > 0 ? storyEvents.value.set(day, newList) : storyEvents.value.delete(day);
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
  dialogVisible.value = false;
  ElMessage.success('保存成功');
};

// 日历控制
const selectDate = (type: string) => {
  const d = new Date(currentDate.value);
  if (type === 'prev-month') d.setMonth(d.getMonth() - 1);
  if (type === 'next-month') d.setMonth(d.getMonth() + 1);
  if (type === 'today') d.setTime(new Date('2020/04/06').getTime());
  currentDate.value = d;
};

const formatDateTitle = (val: Date) => `${val.getFullYear()}年 ${val.getMonth() + 1}月`;
</script>

<style scoped>
.view-container { height: 100%; display: flex; flex-direction: column; padding: 10px 20px; box-sizing: border-box; background-color: #fff; overflow: hidden; }
.view-toolbar { flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #ebeef5; }
.toolbar-left { display: flex; align-items: center; gap: 20px; }
.page-title { margin: 0; font-size: 18px; font-weight: 600; color: #303133; }
.current-date-label { font-size: 16px; font-weight: bold; margin-right: 15px; }
.view-content { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
</style>