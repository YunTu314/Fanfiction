// src/views/Characters/characters.ts
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { CHARACTERS_DATA } from '@/constants/characters';
import type { CharacterProfile } from '@/types';

const STORAGE_KEY = 'fanfic_characters_data';

export function useCharacters() {
  // --- 核心状态 ---
  const characters = ref<CharacterProfile[]>([]);
  const searchQuery = ref('');
  const filterRole = ref('ALL');

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
        console.error('本地数据解析失败，重置为默认', e);
        characters.value = JSON.parse(JSON.stringify(CHARACTERS_DATA));
      }
    } else {
      characters.value = JSON.parse(JSON.stringify(CHARACTERS_DATA));
    }
  };

  const resetData = () => {
    characters.value = JSON.parse(JSON.stringify(CHARACTERS_DATA));
    saveData();
    ElMessage.success('已重置为初始数据');
  };

  // --- 计算属性 ---
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

  const handleExport = () => {
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
    openAddDialog,
    showDetail,
    handleEditFromDrawer,
    saveCharacter,
    handleDelete,
    resetData,
    handleExport
  };
}