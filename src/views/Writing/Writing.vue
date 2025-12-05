<template>
  <div class="writing-layout">
    <div class="sidebar">
      <div class="sidebar-header">
        <span class="sidebar-title">目录</span>
        <div class="sidebar-actions">
          <el-tooltip content="智能导入 TXT" placement="top">
            <el-button size="small" icon="Upload" circle @click="triggerImport" />
          </el-tooltip>
          <input type="file" ref="fileInputRef" style="display: none" accept=".txt" @change="handleFileImport" />

          <el-tooltip content="新建卷/文件夹" placement="top">
            <el-button size="small" icon="FolderAdd" circle @click="handleHeaderAdd('folder')" />
          </el-tooltip>
          <el-tooltip content="新建章/文档" placement="top">
            <el-button size="small" icon="DocumentAdd" circle @click="handleHeaderAdd('file')" />
          </el-tooltip>
        </div>
      </div>

      <el-scrollbar class="tree-scrollbar">
        <el-tree
          ref="treeRef"
          :data="treeData"
          node-key="id"
          default-expand-all
          draggable
          :allow-drop="allowDrop"
          :expand-on-click-node="false"
          highlight-current
          @node-click="handleNodeClick"
          @node-drag-end="handleDragEnd"
        >
          <template #default="{ node, data }">
            <div class="custom-tree-node">
              <div class="node-label">
                <el-icon v-if="data.type === 'folder'" class="node-icon folder"><Folder /></el-icon>
                <el-icon v-else class="node-icon file"><Document /></el-icon>
                
                <el-input
                  v-if="data.isRenaming"
                  v-model="data.label"
                  size="small"
                  ref="renameInputRef"
                  @blur="finishRename(data)"
                  @keyup.enter="finishRename(data)"
                  @click.stop
                />
                <span v-else :class="{ 'unsaved': !data.isSaved && data.type === 'file' }">{{ node.label }}</span>
              </div>

              <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, data)">
                <span class="node-menu-btn" @click.stop>
                  <el-icon><MoreFilled /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-if="data.type === 'folder'" command="addFolder">新建子文件夹</el-dropdown-item>
                    <el-dropdown-item v-if="data.type === 'folder'" command="addFile">新建子章节</el-dropdown-item>
                    <el-dropdown-item v-if="data.type === 'folder'" command="exportFolder" divided>导出整卷 (TXT)</el-dropdown-item>
                    <el-dropdown-item command="rename" :divided="data.type !== 'folder'">重命名</el-dropdown-item>
                    <el-dropdown-item v-if="data.type === 'file'" command="exportTxt">导出为 TXT</el-dropdown-item>
                    <el-dropdown-item command="delete" style="color: #f56c6c;">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-tree>
      </el-scrollbar>
    </div>

    <div class="editor-area">
      <div class="editor-toolbar">
        <div class="current-info">
          <el-tag v-if="activeNode && !activeNode.isSaved" size="small" type="warning" effect="plain">未保存</el-tag>
          <span v-else-if="activeNode" class="saved-text"><el-icon><Check /></el-icon> 已保存</span>
        </div>
        
        <div class="editor-controls">
          <el-button v-if="activeNode" size="small" icon="Download" @click="exportCurrentFile">导出当前</el-button>
          <el-divider direction="vertical" />
          <el-button type="primary" link @click="saveAll">强制保存</el-button>
          <el-divider direction="vertical" />
          <el-switch v-model="isDualMode" active-text="双栏" inactive-text="单栏" inline-prompt />
        </div>
      </div>

      <div class="editor-main" :class="{ 'dual-mode': isDualMode }">
        <div class="editor-pane primary-pane">
          <div v-if="activeNode" class="pane-content">
            <div class="doc-title-wrapper">
              <el-input v-model="activeNode.label" class="doc-title-input" placeholder="章节标题" @input="markUnsaved(activeNode)" />
            </div>
            <el-input v-model="activeNode.content" type="textarea" class="writing-textarea" placeholder="开始创作..." resize="none" @input="markUnsaved(activeNode)" />
          </div>
          <el-empty v-else description="点击左侧目录打开文档" />
        </div>

        <div v-if="isDualMode" class="editor-pane secondary-pane">
          <div class="pane-header">
            <span>对照视图：</span>
            <el-cascader v-model="secondaryNodeId" :options="fileOptions" :props="{ checkStrictly: true, value: 'id', label: 'label', emitPath: false }" placeholder="选择对照..." size="small" clearable filterable style="width: 200px" />
          </div>
          <div v-if="secondaryNode" class="pane-content">
             <div class="doc-title-wrapper read-only"><h3>{{ secondaryNode.label }}</h3></div>
             <el-input v-model="secondaryNode.content" type="textarea" class="writing-textarea" placeholder="对照内容..." resize="none" @input="markUnsaved(secondaryNode)" />
          </div>
          <el-empty v-else description="请选择对照文档" :image-size="60" />
        </div>
      </div>
    </div>

    <el-dialog v-model="importDialog.visible" title="智能导入设置" width="600px" align-center>
      <el-form :model="importDialog" label-position="top">
        
        <el-tabs v-model="importDialog.strategy" type="card">
          <el-tab-pane label="📋 指定卷名 (推荐)" name="list">
            <el-alert title="将TXT里的卷名复制到下方，一行一个。" type="success" :closable="false" style="margin-bottom:10px" />
            <el-input v-model="importDialog.customVolumeList" type="textarea" :rows="5" placeholder="例如：
卷一「生于偶然的纽结」
第二卷" />
          </el-tab-pane>

          <el-tab-pane label="🤖 自动分卷" name="chapter_reset">
            <el-alert title="当遇到'第1章'或'第一章'时，自动创建新卷。" type="warning" :closable="false" />
            <div style="padding: 20px 0; text-align: center; color: #606266;">
              <el-icon size="40"><Sunny /></el-icon>
              <p>无需配置，自动识别</p>
            </div>
          </el-tab-pane>

          <el-tab-pane label="🔧 正则" name="regex">
            <el-form-item label="卷名匹配规则">
              <el-input v-model="importDialog.volRegex" />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>

        <el-divider />
        
        <el-form-item label="章名识别 (通用)">
          <el-input v-model="importDialog.chapRegex" placeholder="默认识别：第X章、Chapter X">
             <template #append>
              <el-button @click="resetRegex">重置默认</el-button>
            </template>
          </el-input>
        </el-form-item>

        <div class="preview-stats">
          <el-statistic title="预计分卷数" :value="importDialog.previewVolCount" />
          <el-statistic title="预计分章数" :value="importDialog.previewChapCount" />
        </div>
      </el-form>

      <template #footer>
        <el-button @click="importDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmImport">开始导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { 
  Folder, Document, MoreFilled, FolderAdd, DocumentAdd, Upload, Download, Check, Sunny
} from '@element-plus/icons-vue';
import { useWriting } from './writing';

const {
  treeData, activeNodeId, secondaryNodeId, isDualMode, activeNode, secondaryNode, fileOptions, importDialog,
  treeRef, fileInputRef, renameInputRef,
  handleNodeClick, handleDragEnd, allowDrop, handleCommand, finishRename, handleHeaderAdd, markUnsaved, saveAll,
  exportCurrentFile, triggerImport, handleFileImport, resetRegex, confirmImport
} = useWriting();
</script>

<style scoped src="./writing.css"></style>