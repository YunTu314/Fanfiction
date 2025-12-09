// src/stores/characterStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CharacterProfile } from '@/types';
import { ElMessage } from 'element-plus';

const STORAGE_KEY = 'fanfic_characters_data';

export const useCharacterStore = defineStore('character', () => {
  // --- State ---
  const characters = ref<CharacterProfile[]>([]);

  // --- Getters ---
  // 供下拉菜单使用的选项列表
  const characterOptions = computed(() => {
    return characters.value.map(c => ({
      id: c.id,
      name: c.name,
      romaji: c.romaji
    }));
  });

  // --- Actions ---
  
  // 1. 从 LocalStorage 加载数据
  const loadData = () => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        characters.value = JSON.parse(cached);
      } catch (e) {
        console.error('角色数据加载失败', e);
        characters.value = [];
      }
    }
  };

  // 2. 保存数据到 LocalStorage
  const saveData = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters.value));
  };

  // 3. 添加角色
  const addCharacter = (char: CharacterProfile) => {
    characters.value.unshift(char);
    saveData();
  };

  // 4. 更新角色
  const updateCharacter = (char: CharacterProfile) => {
    const index = characters.value.findIndex(c => c.id === char.id);
    if (index !== -1) {
      characters.value[index] = char;
      saveData();
    }
  };

  // 5. 删除角色
  const deleteCharacter = (id: string) => {
    characters.value = characters.value.filter(c => c.id !== id);
    saveData();
  };

  // 6. 覆盖/导入数据
  const setCharacters = (data: CharacterProfile[]) => {
    characters.value = data;
    saveData();
  };

  // 7. 清空数据
  const resetData = () => {
    characters.value = [];
    saveData();
  };

  return {
    characters,
    characterOptions,
    loadData,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    setCharacters,
    resetData
  };
});