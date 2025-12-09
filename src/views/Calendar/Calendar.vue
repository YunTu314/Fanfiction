{
type: uploaded file
fileName: yuntu314/fanfiction/Fanfiction-78cdd7b04a75cf952a739276b92d74580a115934/src/views/Calendar/Calendar.vue
fullContent:
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
          <el-button size="small" @click="selectDate('today')">回到初始</el-button>
          <el-button size="small" @click="selectDate('next-month')">下个月</el-button>
        </el-button-group>
        
        <el-tooltip content="设置时间线起点" placement="top">
          <el-button size="small" icon="Setting" circle style="margin-left: 12px" @click="openSettings" />
        </el-tooltip>
      </div>
      
      <div class="toolbar-right" v-else>
        <el-tag type="info" style="margin-right: 12px;">共记录 {{ totalEventsCount }} 个事件</el-tag>
        
        <el-button-group>
          <el-tooltip content="导出事件数据" placement="top">
            <el-button size="small" icon="Download" @click="handleExportEvents">导出</el-button>
          </el-tooltip>
          <el-tooltip content="导入事件数据" placement="top">
            <el-button size="small" icon="Upload" @click="triggerImportEvents">导入</el-button>
          </el-tooltip>
        </el-button-group>
        <input 
          type="file" 
          ref="fileInputRef" 
          style="display: none" 
          accept=".json" 
          @change="handleImportEvents" 
        />

        <el-tooltip content="设置时间线起点" placement="top">
          <el-button size="small" icon="Setting" circle style="margin-left: 12px" @click="openSettings" />
        </el-tooltip>
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

    <el-dialog v-model="settingsVisible" title="日历设置" width="400px" align-center>
      <el-form :model="formSettings" label-position="top">
        <el-form-item label="时间线初始日期">
          <div style="color: #909399; font-size: 12px; margin-bottom: 8px;">
            设置每次进入此页面时默认显示的年月。
          </div>
          <el-date-picker
            v-model="formSettings.startDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="settingsVisible = false">取消</el-button>
          <el-button type="primary" @click="saveSettings">保存设置</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { Calendar, List, Setting, Download, Upload } from '@element-plus/icons-vue';
import StoryCalendar from '@/components/StoryCalendar.vue';
import StoryTimeline from '@/components/StoryTimeline.vue';
import { useCalendar } from './calendar';

// 解构逻辑
const {
  viewMode,
  currentDate,
  characterOptions,
  dialogVisible,
  dialogTitle,
  showDayListInDialog,
  isEditing,
  storyEvents,
  currentEvent,
  formEvent,
  currentDayEvents,
  sortedTimelineData,
  totalEventsCount,
  // 设置相关
  settingsVisible,
  formSettings,
  openSettings,
  saveSettings,
  // 导入导出相关 (新增)
  fileInputRef,
  handleExportEvents,
  triggerImportEvents,
  handleImportEvents,
  // 方法
  handleDayClick,
  quickAddEvent,
  confirmDeleteEvent,
  editEvent,
  deleteEvent,
  saveEvent,
  selectDate,
  formatDateTitle
} = useCalendar();
</script>

<style scoped src="./calendar.css"></style>
}