<template>
  <div class="characters-container">
    <div class="toolbar">
      <div class="header-group">
        <div class="header-text">
          <h2>角色图鉴</h2>
          <span class="subtitle">共收录 {{ filteredCharacters.length }} 名角色</span>
        </div>
        <div class="button-group">
          <el-button type="primary" icon="Plus" @click="openAddDialog">
            新增角色
          </el-button>
          <el-button type="success" plain icon="Download" @click="handleExport">
            导出数据
          </el-button>
        </div>
      </div>
      
      <div class="filter-group">
        <el-input
          v-model="searchQuery"
          placeholder="搜索姓名或标签..."
          prefix-icon="Search"
          clearable
          class="search-input"
        />
        <el-radio-group v-model="filterRole" size="default">
          <el-radio-button label="ALL">全部</el-radio-button>
          <el-radio-button label="Gt.">Gt.</el-radio-button>
          <el-radio-button label="Vo.">Vo.</el-radio-button>
          <el-radio-button label="Ba.">Ba.</el-radio-button>
          <el-radio-button label="Dr.">Dr.</el-radio-button>
          <el-radio-button label="Key.">Key.</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <el-scrollbar>
      <div class="card-grid">
        <div 
          v-for="char in filteredCharacters" 
          :key="char.id" 
          class="character-card"
          @click="showDetail(char)"
        >
          <div class="card-cover" :style="{ backgroundColor: char.color }">
            <div class="char-role">{{ char.role }}</div>
          </div>
          
          <div class="card-body">
            <div class="char-name-group">
              <h3 class="char-name">{{ char.name }}</h3>
              <span class="char-romaji">{{ char.romaji }}</span>
            </div>
            
            <div class="char-school">
              <el-icon><School /></el-icon> {{ char.school }}
            </div>

            <div class="char-tags">
              <el-tag 
                v-for="tag in char.tags.slice(0, 3)" 
                :key="tag" 
                size="small" 
                effect="plain" 
                round
                :style="{ borderColor: char.color, color: '#555' }"
              >
                {{ tag }}
              </el-tag>
            </div>

            <p class="char-desc">{{ char.description }}</p>
          </div>
        </div>
      </div>
      <el-empty v-if="filteredCharacters.length === 0" description="未找到匹配的角色" />
    </el-scrollbar>

    <el-drawer
      v-model="drawerVisible"
      :title="currentCharacter?.name"
      direction="rtl"
      size="500px"
      class="char-drawer"
    >
      <template #header>
        <div class="drawer-header">
          <span class="drawer-title" :style="{ color: currentCharacter?.color }">
            {{ currentCharacter?.name }}
          </span>
          <span class="drawer-subtitle">{{ currentCharacter?.romaji }}</span>
        </div>
      </template>

      <div v-if="currentCharacter" class="drawer-content">
        <el-descriptions :column="2" border size="small" class="info-table">
          <el-descriptions-item label="学校">{{ currentCharacter.school }}</el-descriptions-item>
          <el-descriptions-item label="担当">{{ currentCharacter.role }}</el-descriptions-item>
          <el-descriptions-item label="身高">{{ currentCharacter.basicInfo.height }}</el-descriptions-item>
          <el-descriptions-item label="生日">{{ currentCharacter.basicInfo.birthday }}</el-descriptions-item>
          <el-descriptions-item label="年龄">{{ currentCharacter.basicInfo.age }}</el-descriptions-item>
          <el-descriptions-item label="班级">{{ currentCharacter.basicInfo.class }}</el-descriptions-item>
        </el-descriptions>

        <div class="section-block">
          <h4><el-icon><Star /></el-icon> 喜好 / 厌恶</h4>
          <p><strong>喜欢：</strong>{{ currentCharacter.likes || '未知' }}</p>
          <p><strong>讨厌：</strong>{{ currentCharacter.dislikes || '未知' }}</p>
        </div>

        <div class="section-block">
          <h4><el-icon><Document /></el-icon> 详细设定 & 背景</h4>
          <div class="rich-text" v-html="currentCharacter.detail"></div>
        </div>
      </div>

      <template #footer>
        <div style="flex: auto">
          <el-button @click="drawerVisible = false">关闭</el-button>
          <el-button type="primary" icon="Edit" @click="handleEditFromDrawer">编辑</el-button>
          <el-popconfirm 
            title="确定要删除这个角色吗？此操作无法撤销。" 
            confirm-button-type="danger"
            @confirm="handleDelete"
          >
            <template #reference>
              <el-button type="danger" icon="Delete" plain>删除</el-button>
            </template>
          </el-popconfirm>
        </div>
      </template>
    </el-drawer>

    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑角色' : '新增角色'"
      width="600px"
      align-center
      destroy-on-close
    >
      <el-form :model="formChar" label-width="80px" ref="charFormRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" required><el-input v-model="formChar.name" placeholder="如：朝日 久" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="罗马音"><el-input v-model="formChar.romaji" placeholder="如：Asahi Hisashi" /></el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学校" required><el-input v-model="formChar.school" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="担当位置" required>
              <el-select v-model="formChar.role" allow-create filterable default-first-option placeholder="选择或输入">
                <el-option label="Gt." value="Gt." />
                <el-option label="Ba." value="Ba." />
                <el-option label="Dr." value="Dr." />
                <el-option label="Key." value="Key." />
                <el-option label="Vo." value="Vo." />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="印象色">
              <el-color-picker v-model="formChar.color" show-alpha />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标签">
              <el-select
                v-model="formChar.tags"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="输入标签回车"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">详细档案</el-divider>

        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="身高"><el-input v-model="formChar.basicInfo.height" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="生日"><el-input v-model="formChar.basicInfo.birthday" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="年龄"><el-input v-model="formChar.basicInfo.age" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="班级"><el-input v-model="formChar.basicInfo.class" /></el-form-item></el-col>
        </el-row>

        <el-form-item label="喜欢"><el-input v-model="formChar.likes" /></el-form-item>
        <el-form-item label="讨厌"><el-input v-model="formChar.dislikes" /></el-form-item>
        
        <el-form-item label="一句话简介">
          <el-input type="textarea" v-model="formChar.description" :rows="2" placeholder="显示在卡片上的简短介绍" />
        </el-form-item>

        <el-form-item label="详细设定">
          <el-input 
            type="textarea" 
            v-model="formChar.detail" 
            :rows="6" 
            placeholder="支持简单的 HTML 标签，如 <p>, <b> 等" 
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveCharacter">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, School, Star, Document, Download, Plus, Edit, Delete } from '@element-plus/icons-vue';
import { CHARACTERS_DATA } from '@/constants/characters'; // 初始数据
import type { CharacterProfile } from '@/types';

const STORAGE_KEY = 'fanfic_characters_data';

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
    // 如果没有缓存，使用常量中的默认数据
    characters.value = JSON.parse(JSON.stringify(CHARACTERS_DATA));
  }
};

const saveData = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters.value));
};

const resetData = () => {
  characters.value = JSON.parse(JSON.stringify(CHARACTERS_DATA));
  saveData();
  ElMessage.success('已重置为初始数据');
};

onMounted(() => {
  loadData();
});

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

// 1. 打开新增弹窗
const openAddDialog = () => {
  formChar.value = JSON.parse(JSON.stringify(initialFormState));
  formChar.value.id = Date.now().toString(); // 生成临时 ID
  isEditing.value = false;
  dialogVisible.value = true;
};

// 2. 查看详情 (打开 Drawer)
const showDetail = (char: CharacterProfile) => {
  // 深拷贝，避免直接修改列表数据
  currentCharacter.value = JSON.parse(JSON.stringify(char)); 
  drawerVisible.value = true;
};

// 3. 从 Drawer 点击编辑
const handleEditFromDrawer = () => {
  if (!currentCharacter.value) return;
  // 将当前详情页的数据复制到表单
  formChar.value = JSON.parse(JSON.stringify(currentCharacter.value));
  isEditing.value = true;
  // 关闭详情页，打开编辑弹窗
  drawerVisible.value = false; 
  dialogVisible.value = true;
};

// 4. 保存 (新增或修改)
const saveCharacter = () => {
  if (!formChar.value.name) return ElMessage.error('姓名不能为空');
  
  if (isEditing.value) {
    // 编辑模式：查找并替换
    const index = characters.value.findIndex(c => c.id === formChar.value.id);
    if (index !== -1) {
      characters.value[index] = { ...formChar.value };
      ElMessage.success('角色信息已更新');
    }
  } else {
    // 新增模式：添加到数组头部
    characters.value.unshift({ ...formChar.value });
    ElMessage.success('新角色已添加');
  }
  
  saveData(); // 持久化
  dialogVisible.value = false;
};

// 5. 删除
const handleDelete = () => {
  if (!currentCharacter.value) return;
  const idToDelete = currentCharacter.value.id;
  characters.value = characters.value.filter(c => c.id !== idToDelete);
  saveData(); // 持久化
  
  drawerVisible.value = false;
  ElMessage.success('角色已删除');
};

// 6. 导出 (导出当前响应式数据，包含用户新增的)
const handleExport = () => {
  try {
    const dataStr = JSON.stringify(characters.value, null, 2); // 导出 dynamic data
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().slice(0, 10);
    link.download = `my_characters_${date}.json`;
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
</script>

<style scoped>
.characters-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 20px;
  background-color: #f5f7fa;
}

/* 顶部工具栏 */
.toolbar {
  padding: 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 20px;
}

.header-group {
  display: flex;
  align-items: center;
  gap: 30px;
}

.button-group {
  display: flex;
  gap: 10px;
}

.header-text h2 { margin: 0 0 5px 0; color: #303133; }
.subtitle { font-size: 13px; color: #909399; }

.filter-group {
  display: flex;
  gap: 15px;
  align-items: center;
}
.search-input { width: 220px; }

/* 卡片网格 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding-bottom: 40px;
}

.character-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  height: 320px;
  border: 1px solid transparent;
}

.character-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-cover {
  height: 80px;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 10px;
}
.char-role {
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 12px;
  color: #303133;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card-body {
  padding: 15px 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.char-name-group { margin-bottom: 5px; }
.char-name { margin: 0; font-size: 20px; font-weight: bold; color: #303133; }
.char-romaji { font-size: 12px; color: #909399; text-transform: uppercase; letter-spacing: 0.5px; }

.char-school {
  font-size: 13px;
  color: #606266;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.char-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 15px;
}

.char-desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.drawer-header { display: flex; flex-direction: column; }
.drawer-title { font-size: 24px; font-weight: bold; }
.drawer-subtitle { font-size: 14px; color: #909399; text-transform: uppercase; margin-top: 4px; }

.section-block { margin-top: 25px; }
.section-block h4 { 
  margin-bottom: 10px; 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  color: #303133; 
  border-bottom: 2px solid #f2f2f2;
  padding-bottom: 8px;
}
.rich-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
}
.rich-text :deep(p) { margin-bottom: 10px; }
.rich-text :deep(b) { color: #303133; }
</style>