// src/main.ts

import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; 
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css'; 

// 引入 Element Plus 的中文语言包
import zhCn from 'element-plus/es/locale/lang/zh-cn'; 

const app = createApp(App);

app.use(router); 
// 全局配置 Element Plus，指定语言为中文
app.use(ElementPlus, {
  locale: zhCn, 
}); 

app.mount('#app');