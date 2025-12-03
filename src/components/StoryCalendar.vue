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
        <div class="calendar-cell-content" :class="{ 'is-selected': data.isSelected }" @click="emit('day-click', data.day)">
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
            <div v-for="event in getEventsForDay(data.day)" :key="event.id" class="event-item calendar-event">
              <el-tooltip effect="dark" :content="event.title" placement="top" :show-after="500">
                <div class="event-title">{{ event.title }}</div>
              </el-tooltip>
            </div>
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
}>();

// 定义 Emits
const emit = defineEmits<{
  (e: 'day-click', day: string): void;
}>();

const weekDays = WEEK_DAYS;

const getEventsForDay = (day: string) => {
  return props.eventsMap.get(day) || [];
};
</script>

<style scoped>
/* 这里放置之前 CalendarView 中关于 .my-calendar, .custom-week-header 等样式 */
.calendar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.custom-week-header {
  display: flex;
  padding: 10px 0;
  background-color: #f5f7fa;
  flex-shrink: 0;
}
.week-cell { flex: 1; text-align: center; font-size: 14px; font-weight: bold; color: #606266; }
.week-cell.is-weekend { color: #f56c6c; }

.my-calendar { flex: 1; display: flex; flex-direction: column; border-top: none; overflow: hidden; --el-calendar-cell-width: 100%; }
.my-calendar :deep(.el-calendar__header) { display: none; }
.my-calendar :deep(.el-calendar__body) { flex: 1; padding: 0; display: flex; flex-direction: column; overflow: hidden; }
.my-calendar :deep(.el-calendar-table) { height: 100%; display: flex; flex-direction: column; }
.my-calendar :deep(.el-calendar-table tbody) { display: flex; flex-direction: column; height: 100%; }
.my-calendar :deep(.el-calendar-table tr) { display: flex; flex: 1; }
.my-calendar :deep(.el-calendar-table td) { flex: 1; border-bottom: 1px solid var(--el-calendar-border-color); border-right: 1px solid var(--el-calendar-border-color); }
.el-calendar :deep(.el-calendar-day) { height: 100% !important; padding: 0 !important; }

.calendar-cell-content { height: 100%; display: flex; flex-direction: column; padding: 4px; }
.cell-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
.day-number { font-weight: bold; color: #303133; }
.is-holiday-text { color: #f56c6c; font-weight: 800; }
.holiday-badge { font-size: 10px; color: #f56c6c; background: #fef0f0; padding: 1px 3px; border-radius: 2px; transform: scale(0.9); transform-origin: right center; cursor: help; }
.events-wrapper { flex: 1; overflow: hidden; display: flex; flex-direction: column; gap: 2px; }
.calendar-event { background-color: #ecf5ff; border-left: 2px solid #409eff; border-radius: 2px; padding: 0 4px; font-size: 12px; color: #303133; }
.event-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>