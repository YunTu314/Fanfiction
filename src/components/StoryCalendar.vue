
<template>
  <div class="calendar-wrapper">
    <div class="custom-week-header">
      <div v-for="(day, index) in weekDays" :key="index" class="week-cell" :class="{ 'is-weekend': index >= 5 }">
        {{ day }}
      </div>
    </div>

    <el-calendar :model-value="currentDate" class="my-calendar">
      <template #header><div style="display: none;"></div></template>
      
      <template #date-cell="{ data }">
        <div 
          class="calendar-cell-content" 
          :class="{ 
            'is-selected': isSelected(data.day),
            'is-in-range': isInRange(data.day)
          }" 
          @click="emit('day-click', data.day)"
        >
          <div class="cell-header">
            <span class="day-number" :class="{ 'is-holiday-text': getHolidayInfo(data.date) }">
              {{ data.day.split('-').slice(2).join('') }}
            </span>
            
            <el-tooltip v-if="getHolidayInfo(data.date)" effect="light" placement="top" :show-after="200">
              <template #content>
                <div style="max-width: 200px;">
                  <h4 style="margin:0 0 5px 0; color:#f56c6c;">{{ getHolidayInfo(data.date)?.cnName }}</h4>
                  <p style="margin:0; font-size:12px; color:#606266;">{{ getHolidayInfo(data.date)?.activity }}</p>
                </div>
              </template>
              <span class="holiday-badge">{{ getHolidayInfo(data.date)?.cnName }}</span>
            </el-tooltip>
          </div>

          <div class="events-wrapper">
            <div 
              v-for="event in getVisibleEvents(data.day)" 
              :key="event.id" 
              class="event-item calendar-event"
            >
              <el-tooltip effect="dark" :content="event.title" placement="top" :show-after="500">
                <div class="event-title">{{ event.title }}</div>
              </el-tooltip>
            </div>

            <el-tooltip 
              v-if="getEventsForDay(data.day).length > maxEvents" 
              effect="light" 
              placement="top"
              popper-class="calendar-more-popper"
            >
              <template #content>
                <div class="more-events-list">
                  <div class="list-header">{{ data.day }} 事件列表 ({{ getEventsForDay(data.day).length }})</div>
                  <div v-for="e in getEventsForDay(data.day)" :key="e.id" class="more-event-item">
                    <span class="dot"></span>
                    <span>{{ e.title }}</span>
                  </div>
                </div>
              </template>
              <div class="more-indicator">
                还剩 {{ getEventsForDay(data.day).length - maxEvents }} 项...
              </div>
            </el-tooltip>
          </div>
        </div>
      </template>
    </el-calendar>
  </div>
</template>

<script lang="ts" setup>
import { WEEK_DAYS } from '@/constants/holidays';
import { getHolidayInfo } from '@/utils/holidayHelper';
import type { StoryEvent } from '@/types';

// 定义 Props
const props = defineProps<{
  currentDate: Date;
  eventsMap: Map<string, StoryEvent[]>;
  rangeStart?: string; // YYYY-MM-DD
  rangeEnd?: string;   // YYYY-MM-DD
}>();

// 定义 Emits
const emit = defineEmits<{
  (e: 'day-click', day: string): void;
}>();

const weekDays = WEEK_DAYS;
const maxEvents = 3; // 设置最大显示数量

const getEventsForDay = (day: string) => {
  return props.eventsMap.get(day) || [];
};

// 修改点：获取可见事件
const getVisibleEvents = (day: string) => {
  const events = getEventsForDay(day);
  return events.slice(0, maxEvents);
};

// 判断是否是端点选中
const isSelected = (day: string) => {
  return day === props.rangeStart || day === props.rangeEnd;
};

// 判断是否在范围内
const isInRange = (day: string) => {
  if (!props.rangeStart || !props.rangeEnd) return false;
  return day > props.rangeStart && day < props.rangeEnd;
};
</script>

<style scoped>
.calendar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.custom-week-header {
  display: flex;
  padding: 12px 0;
  background-color: #fafafa;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}
.week-cell { flex: 1; text-align: center; font-size: 14px; font-weight: 600; color: #606266; }
.week-cell.is-weekend { color: #f56c6c; }

.my-calendar { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  border-top: none; 
  overflow: hidden; 
  --el-calendar-cell-width: 100%; 
  --el-calendar-border-color: #ebeef5;
}
.my-calendar :deep(.el-calendar__header) { display: none; }
.my-calendar :deep(.el-calendar-table thead) { display: none; }
.my-calendar :deep(.el-calendar__body) { flex: 1; padding: 0; display: flex; flex-direction: column; overflow: hidden; }
.my-calendar :deep(.el-calendar-table) { height: 100%; display: flex; flex-direction: column; table-layout: fixed; }
.my-calendar :deep(.el-calendar-table tbody) { display: flex; flex-direction: column; height: 100%; }
.my-calendar :deep(.el-calendar-table tr) { display: flex; flex: 1; }
.my-calendar :deep(.el-calendar-table td) { flex: 1; border-bottom: 1px solid var(--el-calendar-border-color); border-right: 1px solid var(--el-calendar-border-color); overflow: hidden; }
.el-calendar :deep(.el-calendar-day) { height: 100% !important; padding: 0 !important; }

.calendar-cell-content { 
  height: 100%; 
  display: flex; 
  flex-direction: column; 
  padding: 6px 8px;
  transition: all 0.2s;
  overflow: hidden; 
}
.calendar-cell-content:hover { background-color: #f5f7fa; cursor: pointer; }
.calendar-cell-content.is-selected { background-color: #ecf5ff; }
.calendar-cell-content.is-selected .day-number { background-color: #409eff; color: #fff; box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3); }
.calendar-cell-content.is-selected .is-holiday-text { background-color: #f56c6c; color: #fff !important; }
.calendar-cell-content.is-in-range { background-color: #f2f8fe; }

.cell-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-shrink: 0; }
.day-number { font-weight: 600; color: #303133; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; font-size: 13px; transition: all 0.2s; }
.is-holiday-text { color: #f56c6c; }
.holiday-badge { font-size: 10px; color: #f56c6c; background: #fef0f0; padding: 2px 4px; border-radius: 4px; transform: scale(0.9); transform-origin: right center; cursor: help; border: 1px solid #fde2e2; white-space: nowrap; }

.events-wrapper { 
  flex: 1; 
  overflow: hidden; 
  display: flex; 
  flex-direction: column; 
  gap: 3px;
  width: 100%;
}

.calendar-event { 
  background-color: #e6f7ff; 
  border-left: 3px solid #409eff; 
  border-radius: 2px 4px 4px 2px; 
  padding: 2px 6px; 
  font-size: 12px; 
  color: #409eff; 
  font-weight: 500;
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.calendar-event:hover { filter: brightness(0.95); transform: translateX(1px); }

.event-title { 
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis; 
  width: 100%;
  display: block;
}

/* 新增：更多事件指示器样式 */
.more-indicator {
  font-size: 11px;
  color: #909399;
  padding: 0 4px;
  margin-top: 2px;
  cursor: pointer;
}
.more-indicator:hover {
  color: #409eff;
  text-decoration: underline;
}

/* 新增：Tooltip 内部列表样式 */
.more-events-list {
  max-width: 260px;
  max-height: 300px;
  overflow-y: auto;
}
.list-header {
  font-weight: bold;
  font-size: 13px;
  padding-bottom: 6px;
  margin-bottom: 6px;
  border-bottom: 1px solid #ebeef5;
  color: #303133;
}
.more-event-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #606266;
  line-height: 1.8;
  margin-bottom: 2px;
}
.more-event-item .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #409eff;
  margin-right: 8px;
  flex-shrink: 0;
}
</style>
