<template>
  <div class="writing-layout">
    <div class="sidebar" :style="{ width: sidebarWidth + 'px' }">
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
            <el-input 
              v-model="importDialog.customVolumeList" 
              type="textarea" 
              :rows="5" 
              placeholder="例如：
卷一「生于偶然的纽结」
第二卷" 
            />
          </el-tab-pane>

          <el-tab-pane label="🤖 自动分卷" name="chapter_reset">
            <el-alert title="当遇到'第1章'或'第一章'时，自动创建新卷。" type="warning" :closable="false" />
            <div style="padding: 20px 0; text-align: center; color: #606266;">
              <el-icon size="40"><MagicStick /></el-icon>
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

<script lang="ts" setup>
import { ref, computed, onMounted, nextTick, watch, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Folder, Document, MoreFilled, FolderAdd, DocumentAdd, Upload, Download, Check, MagicStick
} from '@element-plus/icons-vue';

// --- 类型定义 ---
interface WritingNode {
  id: string;
  label: string;
  type: 'folder' | 'file';
  content?: string;
  children?: WritingNode[];
  isRenaming?: boolean;
  isSaved?: boolean;
}

const STORAGE_KEY = 'fanfic_writing_tree';

// --- 状态管理 ---
const treeData = ref<WritingNode[]>([]);
const activeNodeId = ref<string>('');
const secondaryNodeId = ref<string>('');
const isDualMode = ref(false);
const treeRef = ref();
const fileInputRef = ref<HTMLInputElement | null>(null);
const renameInputRef = ref();

const importDialog = reactive({
  visible: false,
  fileName: '',
  fileContent: '',
  strategy: 'list',
  customVolumeList: '',
  volRegex: '^\\s*(第[零一二三四五六七八九十百千0-9]+卷|Vol\\.\\d+|卷[零一二三四五六七八九十百千0-9]+).*',
  chapRegex: '^\\s*(第[零一二三四五六七八九十百千0-9]+章|Chapter\\s*\\d+).*',
  previewVolCount: 0,
  previewChapCount: 0
});

// --- 计算属性 ---
const activeNode = computed(() => findNodeById(treeData.value, activeNodeId.value));
const secondaryNode = computed(() => findNodeById(treeData.value, secondaryNodeId.value));
const fileOptions = computed(() => treeData.value);

// --- 核心方法 ---
const findNodeById = (nodes: WritingNode[], id: string): WritingNode | undefined => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
};

const removeNodeById = (nodes: WritingNode[], id: string): boolean => {
  const index = nodes.findIndex(n => n.id === id);
  if (index !== -1) {
    nodes.splice(index, 1);
    return true;
  }
  for (const node of nodes) {
    if (node.children && removeNodeById(node.children, id)) return true;
  }
  return false;
};

const saveData = () => {
  const cleanData = JSON.parse(JSON.stringify(treeData.value, (key, value) => {
    if (key === 'isRenaming') return undefined;
    return value;
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanData));
  setAllSaved(treeData.value);
};

const setAllSaved = (nodes: WritingNode[]) => {
  nodes.forEach(node => {
    node.isSaved = true;
    if (node.children) setAllSaved(node.children);
  });
};

const loadData = () => {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    try {
      treeData.value = JSON.parse(cached);
    } catch (e) {
      initDefaultData();
    }
  } else {
    initDefaultData();
  }
};

const initDefaultData = () => {
  treeData.value = [
    {
      id: 'vol1', label: '第一卷：春日影', type: 'folder', children: [
        { id: 'ch1', label: '第1章', type: 'file', content: '这是第一章的内容...', isSaved: true }
      ]
    }
  ];
  saveData();
};

let autoSaveTimer: number | null = null;
const markUnsaved = (node: WritingNode) => {
  node.isSaved = false;
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    saveData();
    ElMessage.success({ message: '自动保存成功', type: 'success', duration: 1000 });
  }, 2000) as unknown as number;
};

const saveAll = () => {
  saveData();
  ElMessage.success('已强制保存所有内容');
};

const getNextChapterTitle = (nodes: WritingNode[] | undefined): string => {
  if (!nodes) return '第1章';
  const fileCount = nodes.filter(n => n.type === 'file').length;
  return `第${fileCount + 1}章`;
};

const handleNodeClick = (data: WritingNode) => {
  if (data.type === 'file') activeNodeId.value = data.id;
};

const allowDrop = (draggingNode: any, dropNode: any, type: string) => {
  if (dropNode.data.type === 'file' && type === 'inner') return false;
  return true;
};

const handleDragEnd = () => saveData();

// ... 原有的 import 和状态保持不变 ...

// --- 修改：顶部按钮的新增逻辑 (上下文感知) ---
const handleHeaderAdd = (type: 'folder' | 'file') => {
  // 1. 获取当前选中的节点
  const currentNode = treeRef.value.getCurrentNode();
  
  let targetChildren: WritingNode[] = treeData.value; // 默认：根目录
  let parentNode: WritingNode | null = null; // 用于后续展开文件夹

  if (currentNode) {
    if (currentNode.type === 'folder') {
      // Case A: 选中了文件夹 -> 添加到该文件夹内部
      if (!currentNode.children) currentNode.children = [];
      targetChildren = currentNode.children;
      parentNode = currentNode;
    } else {
      // Case B: 选中了文件 -> 添加到该文件的同级目录 (找父节点)
      const node = treeRef.value.getNode(currentNode.id);
      if (node.parent.level > 0) {
        // parent.data 就是父节点的 WritingNode 数据
        targetChildren = node.parent.data.children;
        parentNode = node.parent.data;
      }
      // 如果 level === 0，说明文件在根目录，targetChildren 保持为 treeData.value
    }
  }

  // 2. 自动生成标题
  // 如果是新建章节，根据目标目录下的现有文件数计算 "第X章"
  const label = type === 'folder' 
    ? '新文件夹' 
    : getNextChapterTitle(targetChildren);

  // 3. 创建新节点
  const newNode: WritingNode = {
    id: Date.now().toString(),
    label: label,
    type: type,
    children: type === 'folder' ? [] : undefined,
    content: type === 'file' ? '' : undefined,
    isRenaming: true, // 立即进入重命名模式
    isSaved: true
  };

  // 4. 插入数据
  targetChildren.push(newNode);

  // 5. UI 交互优化
  if (parentNode) {
    // 确保父文件夹是展开的
    nextTick(() => {
      if (treeRef.value && parentNode) {
        // Element Plus Tree 的 expand 方法需要 key
        treeRef.value.store.nodesMap[parentNode.id].expanded = true;
      }
    });
  }

  // 如果新建的是文件，自动选中它并打开编辑器
  if (type === 'file') {
    activeNodeId.value = newNode.id;
    // 让 Tree 高亮这个新节点
    nextTick(() => {
      treeRef.value.setCurrentKey(newNode.id);
    });
  }

  // 6. 自动聚焦输入框 (重命名)
  nextTick(() => {
    // 这里简单粗暴地聚焦最后一个输入框，因为刚 push 进去的通常在最后
    // 如果列表很长且有滚动条，可能需要 scrollIntoView，这里暂略
    const inputs = document.querySelectorAll('.custom-tree-node .el-input__inner');
    if (inputs.length) {
      const lastInput = inputs[inputs.length - 1] as HTMLElement;
      lastInput.focus();
      lastInput.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  });
  
  // 保存结构
  saveData();
};

// ... 其他代码保持不变 ...
const handleCommand = (command: string, data: WritingNode) => {
  if (command === 'rename') {
    data.isRenaming = true;
    nextTick(() => { /* focus logic */ });
  } else if (command === 'delete') {
    ElMessageBox.confirm(`确定删除 "${data.label}" 吗？`, '警告', { type: 'warning' }).then(() => {
      removeNodeById(treeData.value, data.id);
      if (activeNodeId.value === data.id) activeNodeId.value = '';
      saveData();
    });
  } else if (command === 'exportTxt') {
    exportNodeAsTxt(data); // 导出单章
  } else if (command === 'exportFolder') {
    exportFolderAsTxt(data); // 导出整卷
  } else if (command === 'addFile' || command === 'addFolder') {
    if (!data.children) data.children = [];
    const type = command === 'addFile' ? 'file' : 'folder';
    const label = type === 'folder' ? '新文件夹' : getNextChapterTitle(data.children);
    const newNode: WritingNode = {
      id: Date.now().toString(),
      label: label,
      type: type,
      children: type === 'folder' ? [] : undefined,
      content: type === 'file' ? '' : undefined,
      isRenaming: true,
      isSaved: true
    };
    data.children.push(newNode);
    if (treeRef.value) treeRef.value.store.nodesMap[data.id].expanded = true;
    if (type === 'file') activeNodeId.value = newNode.id;
  }
};

const finishRename = (data: WritingNode) => {
  if (!data.label.trim()) data.label = '未命名';
  data.isRenaming = false;
  saveData();
};

// --- 导入导出逻辑 ---

// 1. 导出单章
const exportNodeAsTxt = (node: WritingNode) => {
  if (node.type !== 'file' || !node.content) {
    ElMessage.warning('空文件无法导出');
    return;
  }
  downloadBlob(node.content, `${node.label}.txt`);
  ElMessage.success(`已导出: ${node.label}.txt`);
};

// 2. 导出整卷 (拼接逻辑)
const exportFolderAsTxt = (folder: WritingNode) => {
  if (!folder.children || folder.children.length === 0) {
    ElMessage.warning('文件夹为空，无法导出');
    return;
  }

  let fullContent = `${folder.label}\n\n`; // 卷名开头

  // 递归遍历所有子节点
  const traverse = (nodes: WritingNode[]) => {
    nodes.forEach(child => {
      if (child.type === 'file') {
        fullContent += `${child.label}\n`; // 章节名
        fullContent += `\n${child.content || ''}\n\n`; // 正文
        fullContent += `\n`; // 章节间空行
      } else if (child.children) {
        // 如果卷里还有子文件夹，也递归进去
        fullContent += `\n【${child.label}】\n\n`;
        traverse(child.children);
      }
    });
  };

  traverse(folder.children);
  downloadBlob(fullContent, `${folder.label}.txt`);
  ElMessage.success(`整卷导出成功: ${folder.label}.txt`);
};

// 辅助：下载 Blob
const downloadBlob = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const exportCurrentFile = () => {
  if (activeNode.value) exportNodeAsTxt(activeNode.value);
};

// ... (导入逻辑保持上一次的修改不变，此处略微精简以适配字数) ...
const triggerImport = () => { if (fileInputRef.value) fileInputRef.value.click(); };
const handleFileImport = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  const file = target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    importDialog.fileContent = e.target?.result as string;
    importDialog.fileName = file.name.replace(/\.txt$/, '');
    importDialog.visible = true;
    analyzeStructure();
    target.value = '';
  };
  reader.readAsText(file, 'utf-8');
};
const resetRegex = () => { importDialog.chapRegex = '^\\s*(第[零一二三四五六七八九十百千0-9]+章|Chapter\\s*\\d+).*'; analyzeStructure(); };
const analyzeStructure = () => { /* ...复用之前的逻辑... */ 
    // 简略：为了代码简洁，请复用上一次回答中的 analyzeStructure 逻辑 
    // 这里需要把上一个回复中的 analyzeStructure 完整拷贝过来
    try {
        const chapReg = new RegExp(importDialog.chapRegex, 'i');
        const lines = importDialog.fileContent.split(/\r?\n/);
        let volCount = 0;
        let chapCount = 0;
        const customVols = importDialog.customVolumeList.split('\n').map(s => s.trim()).filter(s => s);
        const volReg = new RegExp(importDialog.volRegex, 'i');
        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;
            let isVol = false;
            if (importDialog.strategy === 'list') { if (customVols.includes(trimmed)) isVol = true; } 
            else if (importDialog.strategy === 'regex') { if (volReg.test(trimmed)) isVol = true; } 
            else if (importDialog.strategy === 'chapter_reset') { if (trimmed.startsWith('第1章') || trimmed.startsWith('第一章') || trimmed.startsWith('Chapter 1')) isVol = true; }
            if (isVol) volCount++; else if (chapReg.test(trimmed)) chapCount++;
        });
        importDialog.previewVolCount = volCount;
        importDialog.previewChapCount = chapCount;
    } catch (e) {}
};
watch(() => [importDialog.strategy, importDialog.volRegex, importDialog.chapRegex, importDialog.customVolumeList], () => { analyzeStructure(); });
const confirmImport = () => { /* ...复用之前的逻辑... */ 
    try {
        const rootNode = parseNovelToTree(); // 复用上一次的 parseNovelToTree
        treeData.value.push(rootNode);
        saveData();
        ElMessage.success(`《${importDialog.fileName}》导入成功！`);
        importDialog.visible = false;
    } catch (error) { console.error(error); ElMessage.error('解析失败'); }
};
const parseNovelToTree = (): WritingNode => {
    // ... 请务必将上一个回答中 完整的 parseNovelToTree 函数拷贝至此 ...
    // 这里为了避免代码过长重复，我只写关键结构，实际使用时请填入完整逻辑
    const rootNode: WritingNode = { id: Date.now().toString(), label: importDialog.fileName, type: 'folder', children: [], isSaved: true };
    const lines = importDialog.fileContent.split(/\r?\n/);
    const chapReg = new RegExp(importDialog.chapRegex, 'i');
    const volReg = new RegExp(importDialog.volRegex, 'i');
    const customVols = importDialog.customVolumeList.split('\n').map(s => s.trim()).filter(s => s);
    let currentVolNode: WritingNode | null = null;
    let currentChapNode: WritingNode | null = null;
    let autoVolIndex = 1;
    let bufferContent = '';

    lines.forEach((line) => {
        const trimmedLine = line.trim();
        let isNewVolumeLine = false;
        if (importDialog.strategy === 'list') { if (customVols.includes(trimmedLine)) isNewVolumeLine = true; }
        else if (importDialog.strategy === 'regex') { if (volReg.test(trimmedLine)) isNewVolumeLine = true; }
        else if (importDialog.strategy === 'chapter_reset') {
            if (trimmedLine.startsWith('第1章') || trimmedLine.startsWith('第一章') || trimmedLine.startsWith('Chapter 1')) {
                if (currentChapNode) currentChapNode.content = currentChapNode.content?.trim();
                const newVol: WritingNode = { id: Date.now() + Math.random().toString(), label: `第${autoVolIndex++}卷`, type: 'folder', children: [], isSaved: true };
                rootNode.children!.push(newVol);
                currentVolNode = newVol;
                currentChapNode = null;
            }
        }
        if (isNewVolumeLine) {
            if (currentChapNode) currentChapNode.content = currentChapNode.content?.trim();
            const newVol: WritingNode = { id: Date.now() + Math.random().toString(), label: trimmedLine, type: 'folder', children: [], isSaved: true };
            rootNode.children!.push(newVol);
            currentVolNode = newVol;
            currentChapNode = null;
            return;
        }
        if (chapReg.test(trimmedLine)) {
            if (!currentVolNode && !currentChapNode && bufferContent.trim()) {
                const preNode: WritingNode = { id: Date.now() + Math.random().toString(), label: '前言/序章', type: 'file', content: bufferContent.trim(), isSaved: true };
                rootNode.children!.push(preNode);
                bufferContent = '';
            }
            const newChap: WritingNode = { id: Date.now() + Math.random().toString(), label: trimmedLine, type: 'file', content: '', isSaved: true };
            if (currentVolNode) { currentVolNode.children!.push(newChap); } else { rootNode.children!.push(newChap); }
            currentChapNode = newChap;
            return;
        }
        if (currentChapNode) { currentChapNode.content += line + '\n'; } else { if (!currentVolNode) bufferContent += line + '\n'; }
    });
    if (currentChapNode) currentChapNode.content = currentChapNode.content?.trim();
    if (rootNode.children!.length === 0) { return { id: Date.now().toString(), label: importDialog.fileName, type: 'file', content: importDialog.fileContent, isSaved: true }; }
    return rootNode;
};

onMounted(() => loadData());
</script>

<style scoped>
/* 保持原有样式不变，无需修改 */
.writing-layout { height: 100%; display: flex; overflow: hidden; background-color: #f5f7fa; }
.sidebar { background-color: #fff; border-right: 1px solid #e4e7ed; display: flex; flex-direction: column; flex-shrink: 0; width: 260px; }
.sidebar-header { height: 50px; display: flex; align-items: center; justify-content: space-between; padding: 0 15px; border-bottom: 1px solid #f2f6fc; background-color: #fafafa; }
.sidebar-title { font-weight: bold; color: #303133; }
.sidebar-actions { display: flex; gap: 5px; }
.tree-scrollbar { flex: 1; padding: 10px 0; }
.custom-tree-node { flex: 1; display: flex; align-items: center; justify-content: space-between; padding-right: 8px; font-size: 14px; overflow: hidden; }
.node-label { display: flex; align-items: center; gap: 6px; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.node-icon { font-size: 16px; }
.node-icon.folder { color: #E6A23C; }
.node-icon.file { color: #409EFF; }
.node-menu-btn { display: none; padding: 2px; border-radius: 4px; color: #909399; }
.node-menu-btn:hover { background-color: #ecf5ff; color: #409EFF; }
.custom-tree-node:hover .node-menu-btn { display: inline-flex; }
.unsaved::after { content: '*'; color: #F56C6C; margin-left: 2px; }
.editor-area { flex: 1; display: flex; flex-direction: column; background-color: #fff; overflow: hidden; }
.editor-toolbar { height: 50px; border-bottom: 1px solid #e4e7ed; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; background-color: #fff; flex-shrink: 0; }
.saved-text { color: #67C23A; font-size: 13px; display: flex; align-items: center; gap: 4px; }
.editor-main { flex: 1; display: flex; overflow: hidden; }
.editor-pane { flex: 1; display: flex; flex-direction: column; overflow: hidden; height: 100%; }
.secondary-pane { border-left: 4px solid #e4e7ed; background-color: #fcfcfc; }
.pane-header { padding: 8px 15px; border-bottom: 1px solid #ebeef5; background-color: #fafafa; display: flex; align-items: center; gap: 10px; font-size: 13px; color: #606266; }
.pane-content { flex: 1; padding: 0; height: 100%; display: flex; flex-direction: column; }
.doc-title-wrapper { padding: 15px 30px 0; flex-shrink: 0; }
.doc-title-wrapper.read-only { padding-bottom: 15px; border-bottom: 1px dashed #eee; }
.doc-title-wrapper h3 { margin: 0; color: #303133; }
.doc-title-input :deep(.el-input__inner) { font-size: 24px; font-weight: bold; border: none; box-shadow: none; padding: 0; color: #303133; height: 40px; }
.doc-title-input :deep(.el-input__inner::placeholder) { color: #dcdfe6; }
.writing-textarea { flex: 1; width: 100%; }
:deep(.el-textarea__inner) { height: 100% !important; border: none; border-radius: 0; padding: 20px 30px; font-size: 16px; line-height: 1.8; color: #303133; font-family: 'Segoe UI', sans-serif; resize: none; box-shadow: none; background-color: transparent; }
:deep(.el-textarea__inner:focus) { box-shadow: none; }
.regex-tip { font-size: 12px; color: #909399; margin-top: 4px; }
.regex-tip code { background-color: #f4f4f5; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
.preview-stats { display: flex; justify-content: space-around; margin-top: 10px; }
</style>