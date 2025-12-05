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
<script setup lang="ts">
// 引入同目录下的逻辑文件
import { useCharacters } from './characters';

// 解构出所有状态和方法，供模板使用
const {
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
} = useCharacters();
</script>

<style scoped src="./characters.css"></style>