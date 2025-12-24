import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/main.css';

// 引入Element Plus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

const app = createApp(App);

app.use(router);
app.use(ElementPlus); // 注册Element Plus组件
app.mount('#app');