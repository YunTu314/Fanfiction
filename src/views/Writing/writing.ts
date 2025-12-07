import { ref, computed, onMounted, nextTick, watch, reactive, shallowReactive } from 'vue';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';

// --- 类型定义 ---
export interface WritingNode {
  id: string;
  label: string;
  type: 'folder' | 'file';
  // content?: string; // <--- 优化：移除 content 字段，避免树结构过大
  children?: WritingNode[];
  isRenaming?: boolean;
  isSaved?: boolean;
}

const STORAGE_KEY = 'fanfic_writing_tree';
const STORAGE_CONTENT_KEY = 'fanfic_writing_content'; // 新增：单独存储内容的 Key

export function useWriting() {
  // --- 状态管理 ---
  const sidebarWidth = ref(260); 
  const treeData = ref<WritingNode[]>([]);
  
  // 优化：使用 Map 存储正文内容，并使用 shallowReactive 避免深层代理性能损耗
  // Key: NodeID, Value: String Content
  const contentMap = shallowReactive(new Map<string, string>());

  const activeNodeId = ref<string>('');
  const secondaryNodeId = ref<string>('');
  const isDualMode = ref(false);
  const treeRef = ref();
  const fileInputRef = ref<HTMLInputElement | null>(null);
  const renameInputRef = ref();

  // 编辑器绑定的内容（从 Map 中提取）
  const activeContent = ref('');
  const secondaryContent = ref('');

  // --- 导入弹窗状态 ---
  const importDialog = reactive({
    visible: false,
    fileName: '',
    fileContent: '', // 暂存读取的原始文本
    strategy: 'list',
    customVolumeList: '',
    volRegex: '^\\s*(第[零一二三四五六七八九十百千0-9]+卷|Vol\\.\\d+|卷[零一二三四五六七八九十百千0-9]+).*',
    chapRegex: '^\\s*(第[零一二三四五六七八九十百千0-9]+章|Chapter\\s*\\d+).*',
    previewVolCount: 0,
    previewChapCount: 0
  });

  const isImporting = ref(false); // 导入加载状态

  // --- 计算属性 ---
  const activeNode = computed(() => findNodeById(treeData.value, activeNodeId.value));
  const secondaryNode = computed(() => findNodeById(treeData.value, secondaryNodeId.value));
  const fileOptions = computed(() => treeData.value);

  // --- 监听：节点切换时，同步更新编辑器内容 ---
  watch(activeNodeId, (newId) => {
    activeContent.value = (newId && contentMap.has(newId)) ? (contentMap.get(newId) || '') : '';
  });

  watch(secondaryNodeId, (newId) => {
    secondaryContent.value = (newId && contentMap.has(newId)) ? (contentMap.get(newId) || '') : '';
  });

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
      // 删除节点时，也要清理 contentMap 防止内存泄漏
      const deleteRecursively = (node: WritingNode) => {
        if (node.type === 'file') contentMap.delete(node.id);
        if (node.children) node.children.forEach(deleteRecursively);
      };
      deleteRecursively(nodes[index]);
      
      nodes.splice(index, 1);
      return true;
    }
    for (const node of nodes) {
      if (node.children && removeNodeById(node.children, id)) return true;
    }
    return false;
  };

  const saveData = () => {
    // 1. 保存轻量级的树结构
    const cleanData = JSON.parse(JSON.stringify(treeData.value, (key, value) => {
      if (key === 'isRenaming') return undefined;
      return value;
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanData));

    // 2. 保存内容 Map (序列化为对象)
    try {
      const contentObj = Object.fromEntries(contentMap);
      localStorage.setItem(STORAGE_CONTENT_KEY, JSON.stringify(contentObj));
    } catch (e) {
      ElMessage.error('内容过大，Local Storage 空间不足，请备份！');
    }
    
    setAllSaved(treeData.value);
  };

  const setAllSaved = (nodes: WritingNode[]) => {
    nodes.forEach(node => {
      node.isSaved = true;
      if (node.children) setAllSaved(node.children);
    });
  };

  const loadData = () => {
    const cachedTree = localStorage.getItem(STORAGE_KEY);
    const cachedContent = localStorage.getItem(STORAGE_CONTENT_KEY);

    if (cachedTree) {
      try {
        treeData.value = JSON.parse(cachedTree);
      } catch (e) { initDefaultData(); }
    } else {
      initDefaultData();
    }

    if (cachedContent) {
      try {
        const obj = JSON.parse(cachedContent);
        // 恢复 Map
        Object.keys(obj).forEach(key => contentMap.set(key, obj[key]));
      } catch (e) { console.error('内容加载失败', e); }
    }
  };

  const initDefaultData = () => {
    const vid = 'vol1';
    const cid = 'ch1';
    treeData.value = [
      {
        id: vid, label: '第一卷：春日影', type: 'folder', children: [
          { id: cid, label: '第1章', type: 'file', isSaved: true }
        ]
      }
    ];
    contentMap.set(cid, '这是第一章的内容...');
    saveData();
  };

  // --- 输入处理 ---
  let autoSaveTimer: number | null = null;
  
  // 更新主编辑器内容
  const updateActiveContent = (val: string) => {
    if (!activeNodeId.value) return;
    contentMap.set(activeNodeId.value, val);
    const node = findNodeById(treeData.value, activeNodeId.value);
    if (node) markUnsaved(node);
  };

  // 更新对照编辑器内容
  const updateSecondaryContent = (val: string) => {
    if (!secondaryNodeId.value) return;
    contentMap.set(secondaryNodeId.value, val);
    const node = findNodeById(treeData.value, secondaryNodeId.value);
    if (node) markUnsaved(node);
  };

  const markUnsaved = (node: WritingNode) => {
    node.isSaved = false;
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      saveData();
    }, 2000) as unknown as number;
  };

  const saveAll = () => {
    saveData();
    ElMessage.success('已强制保存所有内容');
  };

  // --- 统计功能 (优化版) ---
  const getFolderStatistics = (node: WritingNode) => {
    let fileCount = 0;
    let wordCount = 0;

    const traverse = (nodes: WritingNode[] | undefined) => {
      if (!nodes) return;
      nodes.forEach(child => {
        if (child.type === 'file') {
          fileCount++;
          // 从 contentMap 中获取字数，而不是直接从 node 获取
          const content = contentMap.get(child.id) || '';
          wordCount += content.length;
        } else if (child.type === 'folder') {
          traverse(child.children);
        }
      });
    };
    traverse(node.children);
    return { fileCount, wordCount };
  };

  // --- 其他通用逻辑 ---
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

    const label = type === 'folder' ? '新文件夹' : getNextChapterTitle(targetChildren);
    const newNode: WritingNode = {
      id: Date.now().toString(),
      label: label,
      type: type,
      children: type === 'folder' ? [] : undefined,
      isRenaming: true,
      isSaved: true
    };

    targetChildren.push(newNode);
    // 如果是文件，初始化空内容
    if (type === 'file') {
      contentMap.set(newNode.id, '');
    }

    if (parentNode) {
      nextTick(() => { if (treeRef.value && parentNode) treeRef.value.store.nodesMap[parentNode.id].expanded = true; });
    }
    if (type === 'file') {
      activeNodeId.value = newNode.id;
      nextTick(() => treeRef.value?.setCurrentKey(newNode.id));
    }
    nextTick(() => {
      const inputs = document.querySelectorAll('.custom-tree-node .el-input__inner');
      if (inputs.length) (inputs[inputs.length - 1] as HTMLElement).focus();
    });
    saveData();
  };

  const handleCommand = (command: string, data: WritingNode) => {
    if (command === 'rename') {
      data.isRenaming = true;
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
        id: Date.now().toString() + Math.random(),
        label: label,
        type: type,
        children: type === 'folder' ? [] : undefined,
        isRenaming: true,
        isSaved: true
      };
      data.children.push(newNode);
      if (type === 'file') contentMap.set(newNode.id, '');
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
    const content = contentMap.get(node.id) || '';
    if (node.type !== 'file' || !content) {
      ElMessage.warning('空文件无法导出');
      return;
    }
    downloadBlob(content, `${node.label}.txt`);
    ElMessage.success(`已导出: ${node.label}.txt`);
  };

  const exportFolderAsTxt = (folder: WritingNode) => {
    if (!folder.children || folder.children.length === 0) {
      ElMessage.warning('文件夹为空');
      return;
    }
    let fullContent = `${folder.label}\n\n`;
    const traverse = (nodes: WritingNode[]) => {
      nodes.forEach(child => {
        if (child.type === 'file') {
          const content = contentMap.get(child.id) || '';
          fullContent += `${child.label}\n\n${content}\n\n`;
        } else if (child.children) {
          fullContent += `\n【${child.label}】\n\n`;
          traverse(child.children);
        }
      });
    };
    traverse(folder.children);
    downloadBlob(fullContent, `${folder.label}.txt`);
    ElMessage.success(`导出成功: ${folder.label}.txt`);
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

  // --- 优化后的异步分片导入 ---
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
  
  // 预览分析（快速扫描，不需要太精细的分片）
  const analyzeStructure = () => {
    try {
      const chapReg = new RegExp(importDialog.chapRegex, 'i');
      const lines = importDialog.fileContent.split(/\r?\n/);
      let volCount = 0;
      let chapCount = 0;
      const customVols = importDialog.customVolumeList.split('\n').map(s => s.trim()).filter(s => s);
      const volReg = new RegExp(importDialog.volRegex, 'i');
      
      // 取前 5000 行做快速预览，避免卡顿
      const limitLines = lines.slice(0, 5000); 
      limitLines.forEach(line => {
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

  const confirmImport = async () => {
    isImporting.value = true;
    try {
      const rootNode = await parseNovelToTreeAsync();
      treeData.value.push(rootNode);
      saveData();
      ElMessage.success(`《${importDialog.fileName}》导入成功！`);
      importDialog.visible = false;
    } catch (error) { 
      console.error(error); 
      ElMessage.error('解析失败'); 
    } finally {
      isImporting.value = false;
    }
  };

  // 核心优化：异步分片解析
  const parseNovelToTreeAsync = (): Promise<WritingNode> => {
    return new Promise((resolve) => {
      const rootNode: WritingNode = { id: Date.now().toString(), label: importDialog.fileName, type: 'folder', children: [], isSaved: true };
      
      // 使用 split 分割行，这是最耗内存的一步，如果文件极大建议 stream 读取，但在浏览器端 split 是妥协方案
      const lines = importDialog.fileContent.split(/\r?\n/);
      
      const chapReg = new RegExp(importDialog.chapRegex, 'i');
      const volReg = new RegExp(importDialog.volRegex, 'i');
      const customVols = importDialog.customVolumeList.split('\n').map(s => s.trim()).filter(s => s);
      
      let currentVolNode: WritingNode | null = null;
      let currentChapNode: WritingNode | null = null;
      let autoVolIndex = 1;
      let bufferContent = '';
      
      let lineIndex = 0;
      const totalLines = lines.length;
      const CHUNK_SIZE = 1000; // 每次处理 1000 行

      const processChunk = () => {
        const end = Math.min(lineIndex + CHUNK_SIZE, totalLines);
        
        for (let i = lineIndex; i < end; i++) {
          const line = lines[i];
          const trimmedLine = line.trim();
          
          // 1. 判断是否是卷
          let isNewVolumeLine = false;
          if (importDialog.strategy === 'list') { if (customVols.includes(trimmedLine)) isNewVolumeLine = true; }
          else if (importDialog.strategy === 'regex') { if (volReg.test(trimmedLine)) isNewVolumeLine = true; }
          else if (importDialog.strategy === 'chapter_reset') {
            if (trimmedLine.startsWith('第1章') || trimmedLine.startsWith('第一章') || trimmedLine.startsWith('Chapter 1')) {
              // 保存上一章内容
              if (currentChapNode) {
                 const prevContent = contentMap.get(currentChapNode.id) || '';
                 contentMap.set(currentChapNode.id, prevContent.trim());
              }
              const newVol: WritingNode = { id: Date.now() + Math.random().toString(), label: `第${autoVolIndex++}卷`, type: 'folder', children: [], isSaved: true };
              rootNode.children!.push(newVol);
              currentVolNode = newVol;
              currentChapNode = null;
            }
          }

          if (isNewVolumeLine) {
            if (currentChapNode) {
               const prevContent = contentMap.get(currentChapNode.id) || '';
               contentMap.set(currentChapNode.id, prevContent.trim());
            }
            const newVol: WritingNode = { id: Date.now() + Math.random().toString(), label: trimmedLine, type: 'folder', children: [], isSaved: true };
            rootNode.children!.push(newVol);
            currentVolNode = newVol;
            currentChapNode = null;
            continue;
          }

          // 2. 判断是否是章
          if (chapReg.test(trimmedLine)) {
            // 处理前言/序章
            if (!currentVolNode && !currentChapNode && bufferContent.trim()) {
              const preId = Date.now() + Math.random().toString();
              const preNode: WritingNode = { id: preId, label: '前言/序章', type: 'file', isSaved: true };
              rootNode.children!.push(preNode);
              contentMap.set(preId, bufferContent.trim());
              bufferContent = '';
            }
            
            // 保存上一章内容
            if (currentChapNode) {
               const prevContent = contentMap.get(currentChapNode.id) || '';
               contentMap.set(currentChapNode.id, prevContent.trim());
            }

            const newChapId = Date.now() + Math.random().toString();
            const newChap: WritingNode = { id: newChapId, label: trimmedLine, type: 'file', isSaved: true };
            
            if (currentVolNode) { currentVolNode.children!.push(newChap); } 
            else { rootNode.children!.push(newChap); }
            
            contentMap.set(newChapId, ''); // 初始化空内容
            currentChapNode = newChap;
            continue;
          }

          // 3. 积累内容
          if (currentChapNode) {
            const prev = contentMap.get(currentChapNode.id) || '';
            contentMap.set(currentChapNode.id, prev + line + '\n');
          } else {
            if (!currentVolNode) bufferContent += line + '\n';
          }
        }

        lineIndex = end;

        if (lineIndex < totalLines) {
          // 让出主线程，等待下一帧
          setTimeout(processChunk, 0);
        } else {
          // 处理结束
          if (currentChapNode) {
             const prevContent = contentMap.get(currentChapNode.id) || '';
             contentMap.set(currentChapNode.id, prevContent.trim());
          }
          if (rootNode.children!.length === 0) { 
             // 如果没识别出任何结构，当做纯文本文件处理
             const singleId = Date.now().toString();
             contentMap.set(singleId, importDialog.fileContent);
             resolve({ id: singleId, label: importDialog.fileName, type: 'file', isSaved: true });
          } else {
             resolve(rootNode);
          }
        }
      };

      // 启动分片处理
      processChunk();
    });
  };

  onMounted(() => loadData());

  return {
    sidebarWidth, treeData, activeNodeId, secondaryNodeId, isDualMode, activeNode, secondaryNode, fileOptions, importDialog,
    treeRef, fileInputRef, renameInputRef, isImporting,
    activeContent, secondaryContent, updateActiveContent, updateSecondaryContent,
    handleNodeClick, handleDragEnd, allowDrop, handleCommand, finishRename, handleHeaderAdd, markUnsaved, saveAll,
    exportCurrentFile, triggerImport, handleFileImport, resetRegex, confirmImport, getFolderStatistics
  };
}