
import { createApp } from 'vue';
import { createPinia } from 'pinia'; // 1. 引入 createPinia
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
// 引入中文包
import zhCn from 'element-plus/es/locale/lang/zh-cn';

// --- 新增：引入所有图标 ---
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

const app = createApp(App);

app.use(createPinia()); // 2. 挂载 Pinia
app.use(router);
app.use(ElementPlus, {
  locale: zhCn,
});

// --- 新增：遍历并注册所有图标 ---
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount('#app');
