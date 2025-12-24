import { createRouter, createWebHistory } from 'vue-router';
import BusQueryView from '../views/BusQueryView.vue'; // 引入查询页面

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/', // 默认访问路径（首页）
      name: 'busQuery',
      component: BusQueryView // 对应查询页面组件
    }
  ]
});

export default router;
