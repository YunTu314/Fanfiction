<template>
  <div class="timeline-container">
    <el-scrollbar>
      <div class="timeline-wrapper">
        <el-timeline>
          <el-timeline-item
            v-for="(group, index) in timelineData"
            :key="index"
            :timestamp="formatTimelineDate(group.date)"
            placement="top"
            :type="getHolidayInfo(group.date) ? 'danger' : 'primary'"
            :hollow="!!getHolidayInfo(group.date)"
            size="large"
          >
            <div v-if="getHolidayInfo(group.date)" class="timeline-holiday-tip">
              <el-tag type="danger" size="small" effect="plain">
                {{ getHolidayInfo(group.date)?.cnName }}
              </el-tag>
              <span class="holiday-activity">{{ getHolidayInfo(group.date)?.activity }}</span>
            </div>

            <div class="waterfall-cards">
              <el-card 
                v-for="event in group.events" 
                :key="event.id" 
                class="timeline-card" 
                shadow="hover"
                @click="emit('edit-event', event)"
              >
                <div class="card-title-row">
                  <h4 class="card-title">{{ event.title }}</h4>
                  <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, event)">
                    <el-icon class="card-more-btn"><MoreFilled /></el-icon>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="edit">编辑</el-dropdown-item>
                        <el-dropdown-item command="delete" style="color: #f56c6c;">删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
                
                <div class="card-tags">
                  <el-tag 
                    v-for="char in event.characters" 
                    :key="char" 
                    size="small" 
                    effect="light"
                    :type="getCharacterTagType(char)"
                  >
                    {{ char }}
                  </el-tag>
                </div>
                <p class="card-desc">{{ event.description || '暂无描述...' }}</p>
              </el-card>
              
              <el-button class="add-btn-dashed" icon="Plus" @click="emit('quick-add', group.date)">
                添加
              </el-button>
            </div>
          </el-timeline-item>
          
          <el-empty v-if="timelineData.length === 0" description="暂无任何剧情事件，请切换到日历视图添加。" />
        </el-timeline>
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { MoreFilled, Plus } from '@element-plus/icons-vue';
import { WEEK_DAYS } from '@/constants/holidays';
import { getHolidayInfo } from '@/utils/holidayHelper';
import type { StoryEvent } from '@/types';

// Props
defineProps<{
  timelineData: { date: string; events: StoryEvent[] }[];
}>();

// Emits
const emit = defineEmits<{
  (e: 'edit-event', event: StoryEvent): void;
  (e: 'delete-event', eventId: string, date: string): void;
  (e: 'quick-add', date: string): void;
}>();

// Methods
const handleCommand = (cmd: string | number | object, event: StoryEvent) => {
  if (cmd === 'edit') emit('edit-event', event);
  if (cmd === 'delete') emit('delete-event', event.id, event.date);
};

const formatTimelineDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const week = WEEK_DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1];
  return `${dateStr} ${week.split(' ')[0]}`;
};

const getCharacterTagType = (name: string) => {
  if (name.includes('爱音')) return 'danger';
  if (name.includes('灯')) return 'info';
  if (name.includes('祥子')) return 'warning';
  if (name.includes('素世')) return '';
  return 'success';
};
</script>

<style scoped>
.timeline-container { height: 100%; overflow: hidden; display: flex; flex-direction: column; }
.timeline-wrapper { padding: 20px 40px; }
.timeline-holiday-tip { margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
.holiday-activity { font-size: 13px; color: #909399; }
.waterfall-cards { display: flex; flex-wrap: wrap; gap: 15px; align-items: flex-start; }
.timeline-card { width: 300px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; border-left: 4px solid #409eff; }
.timeline-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.card-title-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.card-title { margin: 0; font-size: 16px; color: #303133; line-height: 1.4; }
.card-more-btn { cursor: pointer; color: #909399; transform: rotate(90deg); }
.card-tags { margin-bottom: 8px; display: flex; flex-wrap: wrap; gap: 5px; }
.card-desc { font-size: 13px; color: #606266; margin: 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.add-btn-dashed { width: 100px; height: 100px; border: 2px dashed #dcdfe6; background: transparent; color: #909399; }
.add-btn-dashed:hover { border-color: #409eff; color: #409eff; }
</style>