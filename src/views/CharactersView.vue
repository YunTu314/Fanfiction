<template>
  <div class="characters-container">
    <el-alert title="角色人设详情" type="success" description="在此查看和编辑小说中主要角色的详细设定。" show-icon />
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>🎸 朝日久 (Asahi Hisashi)</span>
            </div>
          </template>
          [cite_start]<p>性别：男 [cite: 1][cite_start]；年龄：16岁，高一 [cite: 1][cite_start]；爱好：吉他，八音盒（纯音乐） [cite: 1][cite_start]；定位：被动交友型，正在尝试合奏的单机玩家 [cite: 1]</p>
          <el-button type="text">查看完整人设</el-button>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>💖 千早爱音 (Chihaya Anon)</span>
            </div>
          </template>
          [cite_start]<p>发色：粉发 [cite: 2][cite_start]；特质：精力充沛，社交达人，略爱慕虚荣 [cite: 2][cite_start]；目标：组建一支引人瞩目的女子乐队 [cite: 2]</p>
          <el-button type="text">查看完整人设</el-button>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>🐈 要乐奈 (Kaname Rana)</span>
            </div>
          </template>
          [cite_start]<p>发色：银发 [cite: 2][cite_start]；瞳色：异色瞳 (左蓝右黄) [cite: 2][cite_start]；特质：猫系少女，吉他技术高超，按自己步调行动 [cite: 2]</p>
          <el-button type="text">查看完整人设</el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
// 数据根据您的源文件进行了初步梳理
// 实际项目应从数据源加载完整人设
</script>

<style scoped>
.characters-container {
  min-height: 80vh;
}
.card-header {
  font-weight: bold;
}
</style>