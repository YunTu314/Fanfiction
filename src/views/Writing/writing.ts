// src/views/Writing/writing.ts
import { ref, computed, onMounted, nextTick, watch, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// --- 类型定义 ---
export interface WritingNode {
  id: string;
  label: string;
  type: 'folder' | 'file';
  content?: string;
  children?: WritingNode[];
  isRenaming?: boolean;
  isSaved?: boolean;
}

const STORAGE_KEY = 'fanfic_writing_tree';

export function useWriting() {
  // --- 状态管理 ---
  const treeData = ref<WritingNode[]>([]);
  const activeNodeId = ref<string>('');
  const secondaryNodeId = ref<string>('');
  const isDualMode = ref(false);
  const treeRef = ref();
  const fileInputRef = ref<HTMLInputElement | null>(null);
  const renameInputRef = ref();

  // --- 导入弹窗状态 ---
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

  const handleHeaderAdd = (type: 'folder' | 'file') => {
    const currentNode = treeRef.value?.getCurrentNode();
    
    let targetChildren: WritingNode[] = treeData.value;
    let parentNode: WritingNode | null = null;

    if (currentNode) {
      if (currentNode.type === 'folder') {
        if (!currentNode.children) currentNode.children = [];
        targetChildren = currentNode.children;
        parentNode = currentNode;
      } else {
        const node = treeRef.value.getNode(currentNode.id);
        if (node.parent.level > 0) {
          targetChildren = node.parent.data.children;
          parentNode = node.parent.data;
        }
      }
    }

    const label = type === 'folder' 
      ? '新文件夹' 
      : getNextChapterTitle(targetChildren);

    const newNode: WritingNode = {
      id: Date.now().toString(),
      label: label,
      type: type,
      children: type === 'folder' ? [] : undefined,
      content: type === 'file' ? '' : undefined,
      isRenaming: true,
      isSaved: true
    };

    targetChildren.push(newNode);

    if (parentNode) {
      nextTick(() => {
        if (treeRef.value && parentNode) {
          treeRef.value.store.nodesMap[parentNode.id].expanded = true;
        }
      });
    }

    if (type === 'file') {
      activeNodeId.value = newNode.id;
      nextTick(() => {
        treeRef.value?.setCurrentKey(newNode.id);
      });
    }

    nextTick(() => {
      const inputs = document.querySelectorAll('.custom-tree-node .el-input__inner');
      if (inputs.length) {
        const lastInput = inputs[inputs.length - 1] as HTMLElement;
        lastInput.focus();
        lastInput.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    });
    
    saveData();
  };

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
      exportNodeAsTxt(data);
    } else if (command === 'exportFolder') {
      exportFolderAsTxt(data);
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
  const exportNodeAsTxt = (node: WritingNode) => {
    if (node.type !== 'file' || !node.content) {
      ElMessage.warning('空文件无法导出');
      return;
    }
    downloadBlob(node.content, `${node.label}.txt`);
    ElMessage.success(`已导出: ${node.label}.txt`);
  };

  const exportFolderAsTxt = (folder: WritingNode) => {
    if (!folder.children || folder.children.length === 0) {
      ElMessage.warning('文件夹为空，无法导出');
      return;
    }
    let fullContent = `${folder.label}\n\n`;
    const traverse = (nodes: WritingNode[]) => {
      nodes.forEach(child => {
        if (child.type === 'file') {
          fullContent += `${child.label}\n\n${child.content || ''}\n\n`;
        } else if (child.children) {
          fullContent += `\n【${child.label}】\n\n`;
          traverse(child.children);
        }
      });
    };
    traverse(folder.children);
    downloadBlob(fullContent, `${folder.label}.txt`);
    ElMessage.success(`整卷导出成功: ${folder.label}.txt`);
  };

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
  
  const analyzeStructure = () => {
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

  const confirmImport = () => {
    try {
      const rootNode = parseNovelToTree();
      treeData.value.push(rootNode);
      saveData();
      ElMessage.success(`《${importDialog.fileName}》导入成功！`);
      importDialog.visible = false;
    } catch (error) { console.error(error); ElMessage.error('解析失败'); }
  };

  const parseNovelToTree = (): WritingNode => {
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

  return {
    treeData,
    activeNodeId,
    secondaryNodeId,
    isDualMode,
    activeNode,
    secondaryNode,
    fileOptions,
    importDialog,
    treeRef,
    fileInputRef,
    renameInputRef,
    handleNodeClick,
    handleDragEnd,
    allowDrop,
    handleCommand,
    finishRename,
    handleHeaderAdd,
    markUnsaved,
    saveAll,
    exportCurrentFile,
    triggerImport,
    handleFileImport,
    resetRegex,
    confirmImport
  };
}