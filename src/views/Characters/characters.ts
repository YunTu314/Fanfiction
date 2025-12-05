// src/views/Characters/characters.ts
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { CharacterProfile } from '@/types';

const STORAGE_KEY = 'fanfic_characters_data';

export function useCharacters() {
  // --- 核心状态 ---
  const characters = ref<CharacterProfile[]>([]);
  const searchQuery = ref('');
  const filterRole = ref('ALL');
  const fileInputRef = ref<HTMLInputElement | null>(null);

  // 详情抽屉状态
  const drawerVisible = ref(false);
  const currentCharacter = ref<CharacterProfile | null>(null);

  // 编辑弹窗状态
  const dialogVisible = ref(false);
  const isEditing = ref(false);

  // 表单数据初始化
  const initialFormState: CharacterProfile = {
    id: '',
    name: '',
    romaji: '',
    school: '',
    role: '',
    color: '#409EFF',
    basicInfo: { height: '', birthday: '', age: '', class: '' },
    tags: [],
    description: '',
    detail: '',
    likes: '',
    dislikes: ''
  };
  
  const formChar = ref<CharacterProfile>(JSON.parse(JSON.stringify(initialFormState)));

  // --- 数据加载与持久化 ---
  const saveData = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters.value));
  };

  const loadData = () => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        characters.value = JSON.parse(cached);
      } catch (e) {
        console.error('本地数据解析失败', e);
        characters.value = [];
      }
    } else {
      // 修改：默认不再加载演示数据，而是空列表
      characters.value = [];
    }
  };

  const resetData = () => {
    // 修改：重置为清空所有数据
    characters.value = [];
    saveData();
    ElMessage.success('数据已清空');
  };

  // --- 计算属性：筛选 ---
  const filteredCharacters = computed(() => {
    return characters.value.filter(char => {
      const roleMatch = filterRole.value === 'ALL' || char.role.includes(filterRole.value);
      const q = searchQuery.value.toLowerCase();
      const searchMatch = !q || 
        char.name.includes(q) || 
        char.romaji.toLowerCase().includes(q) ||
        char.school.includes(q) ||
        char.tags.some(t => t.includes(q));
      return roleMatch && searchMatch;
    });
  });

  // --- 交互方法 ---

  const openAddDialog = () => {
    formChar.value = JSON.parse(JSON.stringify(initialFormState));
    formChar.value.id = Date.now().toString();
    isEditing.value = false;
    dialogVisible.value = true;
  };

  const showDetail = (char: CharacterProfile) => {
    currentCharacter.value = JSON.parse(JSON.stringify(char)); 
    drawerVisible.value = true;
  };

  const handleEditFromDrawer = () => {
    if (!currentCharacter.value) return;
    formChar.value = JSON.parse(JSON.stringify(currentCharacter.value));
    isEditing.value = true;
    drawerVisible.value = false; 
    dialogVisible.value = true;
  };

  const saveCharacter = () => {
    if (!formChar.value.name) return ElMessage.error('姓名不能为空');
    
    if (isEditing.value) {
      const index = characters.value.findIndex(c => c.id === formChar.value.id);
      if (index !== -1) {
        characters.value[index] = { ...formChar.value };
        ElMessage.success('角色信息已更新');
      }
    } else {
      characters.value.unshift({ ...formChar.value });
      ElMessage.success('新角色已添加');
    }
    
    saveData();
    dialogVisible.value = false;
  };

  const handleDelete = () => {
    if (!currentCharacter.value) return;
    const idToDelete = currentCharacter.value.id;
    characters.value = characters.value.filter(c => c.id !== idToDelete);
    saveData();
    drawerVisible.value = false;
    ElMessage.success('角色已删除');
  };

  // --- 导出功能 ---
  const handleExport = () => {
    if (characters.value.length === 0) {
      ElMessage.warning('没有数据可导出');
      return;
    }
    try {
      const dataStr = JSON.stringify(characters.value, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().slice(0, 10);
      link.download = `characters_backup_${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      ElMessage.success('角色数据导出成功！');
    } catch (error) {
      console.error(error);
      ElMessage.error('导出失败');
    }
  };

  // --- 新增：导入功能 ---
  const triggerImport = () => {
    if (fileInputRef.value) {
      fileInputRef.value.click();
    }
  };

  const handleImport = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;

    const file = target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);

        // 简单的数据校验
        if (!Array.isArray(parsedData)) {
          throw new Error('文件格式错误：必须是数组');
        }
        if (parsedData.length > 0 && !parsedData[0].id) {
          throw new Error('文件格式错误：缺少 ID 字段');
        }

        // 确认覆盖
        ElMessageBox.confirm(
          `检测到 ${parsedData.length} 个角色数据。导入将覆盖当前列表，确定吗？`,
          '确认导入',
          { type: 'warning', confirmButtonText: '覆盖导入' }
        ).then(() => {
          characters.value = parsedData;
          saveData();
          ElMessage.success('导入成功！');
        }).catch(() => {
          // 取消导入
        });

      } catch (err) {
        console.error(err);
        ElMessage.error('导入失败：文件格式不正确');
      }
      // 清空输入框，允许重复导入同名文件
      target.value = '';
    };
    reader.readAsText(file, 'utf-8');
  };

  onMounted(() => {
    loadData();
  });

  return {
    characters,
    filteredCharacters,
    searchQuery,
    filterRole,
    drawerVisible,
    currentCharacter,
    dialogVisible,
    isEditing,
    formChar,
    fileInputRef,
    openAddDialog,
    showDetail,
    handleEditFromDrawer,
    saveCharacter,
    handleDelete,
    resetData,
    handleExport,
    triggerImport,
    handleImport
  };
}