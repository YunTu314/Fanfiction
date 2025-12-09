{
type: uploaded file
fileName: yuntu314/fanfiction/Fanfiction-78cdd7b04a75cf952a739276b92d74580a115934/src/views/Outline/Outline.vue
fullContent:
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
        <input type="file" ref="fileInputRef" style="display: none" accept=".json" @change="handleImport" />
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
          <draggable v-model="inboxChapter.scenes" item-key="id" animation="200" group="scenes" handle=".scene-card" @end="saveData" class="scene-grid inbox-grid">
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
        </div>

        <el-divider content-position="center">正文章节</el-divider>

        <draggable v-model="normalChapters" item-key="id" handle=".chapter-drag-handle" animation="300" group="chapters" @end="saveData">
          <template #item="{ element: chapter, index: cIndex }">
            <div class="chapter-block">
              <div class="chapter-header">
                <div class="header-left">
                  <el-icon class="chapter-drag-handle"><Rank /></el-icon>
                  
                  <el-button link @click="chapter.isExpanded = !chapter.isExpanded">
                    <el-icon :class="{ 'is-rotated': chapter.isExpanded }"><CaretRight /></el-icon>
                  </el-button>
                  
                  <span class="chapter-title" @click="chapter.isExpanded = !chapter.isExpanded">
                    {{ chapter.title }}
                  </span>
                  
                  <span 
                    class="chapter-desc" 
                    v-if="chapter.description" 
                    @click="chapter.isExpanded = !chapter.isExpanded"
                  >
                    {{ chapter.description }}
                  </span>
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
                  <draggable v-model="chapter.scenes" item-key="id" animation="200" group="scenes" handle=".scene-card" @end="saveData" class="scene-grid">
                    <template #item="{ element: scene, index: sIndex }">
                      <div class="scene-card" @click="editScene(scene, cIndex, sIndex)">
                        <div class="scene-tag-bar" :style="{ backgroundColor: getTagColor(scene.tag) }"></div>
                        <div class="scene-body">
                          <div class="scene-top">
                            <el-tag size="small" effect="plain" :color="getTagColorLight(scene.tag)" :style="{ borderColor: getTagColor(scene.tag), color: getTagColor(scene.tag) }">{{ scene.tag }}</el-tag>
                            <el-tooltip v-if="scene.date" content="点击跳转到时间线" placement="top">
                              <div class="date-badge" @click.stop="goToTimeline(scene.date)">
                                <el-icon><Calendar /></el-icon>
                                <span>{{ formatDateShort(scene.date) }}</span>
                                <span v-if="scene.endDate" style="font-size: 10px; margin-left: 2px;">~</span>
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
        <el-input v-model="quickInput" placeholder="💡 捕捉到一个灵感？输入内容后按 Enter 快速保存..." @keyup.enter="handleQuickAdd" clearable>
          <template #prefix><el-icon><EditPen /></el-icon></template>
          <template #append><el-button type="primary" @click="handleQuickAdd">保存灵感 (Enter)</el-button></template>
        </el-input>
      </div>
    </div>

    <el-dialog 
      v-model="sceneDialogVisible" 
      :title="isEditing ? '编辑剧情片段' : '新建剧情片段'" 
      width="1100px" 
      top="5vh"
      destroy-on-close
      class="scene-editor-dialog"
    >
      <div class="scene-editor-body">
        <div class="editor-left-panel">
          <el-form :model="formScene" label-position="top">
            <el-form-item label="标题" required>
              <el-input v-model="formScene.title" placeholder="例如：朝日久与爱音的初遇" />
            </el-form-item>

            <el-form-item label="剧情节奏">
              <el-radio-group v-model="formScene.tag" size="small">
                <el-radio-button label="起" /><el-radio-button label="承" /><el-radio-button label="转" /><el-radio-button label="合" /><el-radio-button label="日常" /><el-radio-button label="伏笔" />
              </el-radio-group>
            </el-form-item>

            <el-form-item label="时间跨度">
              <div v-if="formScene.date">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <el-tag type="success" effect="dark" size="large">
                    <el-icon><Calendar /></el-icon> {{ formScene.date }}
                  </el-tag>
                  <span v-if="formScene.endDate" style="color: #909399;">至</span>
                  <el-tag v-if="formScene.endDate" type="success" effect="dark" size="large">
                    <el-icon><Calendar /></el-icon> {{ formScene.endDate }}
                  </el-tag>
                </div>
                <div style="margin-top: 8px; font-weight: bold; color: #409eff;">
                  <el-icon><Timer /></el-icon> 共 {{ durationDays }} 天
                </div>
              </div>
              <el-tag v-else type="info" size="large">未关联日期</el-tag>
              
              <div style="font-size: 12px; color: #909399; margin-top: 5px;">
                在右侧日历点击第一次选择开始，点击第二次选择结束。再次点击重新选择。
              </div>
            </el-form-item>
            <el-form-item label="剧情大纲">
              <el-input 
                v-model="formScene.content" 
                type="textarea" 
                :rows="12" 
                placeholder="在这里详细描述这段剧情发生了什么..." 
                resize="none"
              />
            </el-form-item>
          </el-form>
        </div>

        <div class="editor-right-panel">
          <div class="calendar-header-tip">
            <div class="header-left-actions">
              <span><strong>剧情日历</strong></span>
              <el-button-group size="small" style="margin-left: 10px;">
                <el-button :icon="ArrowLeft" @click="changeCalendarMonth(-1)" />
                <el-button @click="changeCalendarMonth(0)">今天</el-button>
                <el-button :icon="ArrowRight" @click="changeCalendarMonth(1)" />
              </el-button-group>
            </div>
            <el-tag type="warning" size="small" effect="plain">支持范围选择</el-tag>
          </div>
          
          <StoryCalendar 
            :currentDate="calendarCurrentDate"
            :eventsMap="calendarEvents"
            :rangeStart="formScene.date"
            :rangeEnd="formScene.endDate"
            @day-click="handleDatePicked"
          />
        </div>
      </div>

      <template #footer>
        <div class="drawer-footer">
          <el-button type="danger" plain icon="Delete" v-if="isEditing" @click="handleDeleteScene">删除</el-button>
          <div style="flex: 1"></div>
          <el-button @click="sceneDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveScene">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="chapterDialogVisible" title="章节信息" width="400px">
      <el-form :model="formChapter">
        <el-form-item label="章节标题"><el-input v-model="formChapter.title" /></el-form-item>
        <el-form-item label="章节简介"><el-input v-model="formChapter.description" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="chapterDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveChapter">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { 
  Plus, Download, Rank, CaretRight, MoreFilled, Calendar, Right, Delete,  EditPen, Upload,
  ArrowLeft, ArrowRight, Timer 
} from '@element-plus/icons-vue';
import draggable from 'vuedraggable';
import StoryCalendar from '@/components/StoryCalendar.vue'; 
import { useOutline } from './outline';

const {
  allChapters, inboxChapter, normalChapters, quickInput, fileInputRef, 
  sceneDialogVisible, chapterDialogVisible, isEditing, formScene, formChapter, 
  calendarEvents, calendarCurrentDate, handleDatePicked, changeCalendarMonth, durationDays, // 引入 durationDays
  saveData, resetData, exportData, triggerImport, handleImport, handleQuickAdd, addChapter, editChapter, saveChapter, handleChapterCmd, addScene, editScene, saveScene, handleDeleteScene, goToTimeline, formatDateShort, getTagColor, getTagColorLight
} = useOutline();
</script>

<style scoped src="./outline.css"></style>
}