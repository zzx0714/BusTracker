<template>
  <div class="query-container">
    <h2 class="page-title">🚌 BusTracker 公交查询系统</h2>

    <div class="search-area">
      <el-input
        v-model="routeNumber"
        placeholder="请输入线路编号（如1路、5路、10路）"
        class="search-input"
        @keyup.enter="handleSearch"
        clearable
      ></el-input>
      <el-button type="primary" @click="handleSearch">🔍 查询线路</el-button>
      <el-button type="success" @click="getAllRoutes">📋 查看所有线路</el-button>
      <el-button type="warning" @click="viewFavorites">
        <el-icon style="margin-right: 5px;"><component :is="Icons.Star" /></el-icon>
        我的收藏 ({{ favoriteRoutes.length }})
      </el-button>
    </div>

    <div class="route-list" v-if="paginatedRoutes.length > 0">
      <el-card 
        v-for="(route, index) in paginatedRoutes" 
        :key="route._id || index"
        class="route-card"
        shadow="hover"
      >
        <div class="route-header">
          <div 
            class="route-header-left"
            @click="toggleExpand(index)"
            :style="{ cursor: 'pointer', flex: 1 }"
          >
            <div class="route-basic">
              <el-tag type="primary" size="large">{{ route.routeNumber }}</el-tag>
              <span class="route-direction">
                {{ route.startStation }} → {{ route.endStation }}
              </span>
              <el-tag class="time-tag">⏱️ 全程{{ route.totalTime }}分钟</el-tag>
            </div>
            <el-icon class="expand-icon">
              <component :is="expandedIndex === index ? Icons.ChevronDown : Icons.ChevronRight" />
            </el-icon>
          </div>
          <el-icon 
            class="favorite-icon" 
            :class="{ 'is-favorite': isFavorite(route.routeNumber) }"
            @click.stop="toggleFavorite(route.routeNumber)"
            :title="isFavorite(route.routeNumber) ? '取消收藏' : '收藏线路'"
          >
            <component :is="isFavorite(route.routeNumber) ? Icons.StarFilled : Icons.Star" />
          </el-icon>
        </div>

        <transition name="slide-fade">
          <div class="stations-area" v-if="expandedIndex === index">
            <h4 class="stations-title">🟡 途经站点（{{ route.stations.length }}个）：</h4>
            <div class="stations-list">
              <el-tag 
                v-for="(station, sIndex) in route.stations" 
                :key="sIndex" 
                class="station-tag"
                effect="dark"
              >
                {{ sIndex + 1 }}. {{ station }}
              </el-tag>
            </div>
            <div class="extra-info">
              <p>🚌 首班时间：06:00</p>
              <p>🚍 末班时间：21:30</p>
              <p>💵 票价：2元（无人售票）</p>
            </div>
          </div>
        </transition>
      </el-card>
    </div>

    <!-- 分页组件 -->
    <div class="pagination-container" v-if="routeList.length > pageSize">
      <el-pagination
        background
        layout="prev, pager, next, total"
        :total="routeList.length"
        :page-size="pageSize"
        v-model:current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>

    <el-empty 
      v-if="showEmpty" 
      description="暂无该线路数据，请重新查询" 
      class="empty-tip"
    ></el-empty>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import request from '@/utils/request';
import { ElMessage, ElIcon } from 'element-plus';
import * as Icons from '@element-plus/icons-vue';

const routeNumber = ref('');
const routeList = ref([]);
const expandedIndex = ref(-1);
const showEmpty = ref(false);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(5);

// 收藏功能相关
const favoriteRoutes = ref([]);
const STORAGE_KEY = 'busTracker_favorites';

// 从 localStorage 加载收藏数据
const loadFavorites = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      favoriteRoutes.value = JSON.parse(saved);
    }
  } catch (err) {
    console.error('加载收藏数据失败:', err);
    favoriteRoutes.value = [];
  }
};

// 保存收藏到 localStorage
const saveFavorites = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteRoutes.value));
  } catch (err) {
    console.error('保存收藏数据失败:', err);
  }
};

// 判断线路是否已收藏
const isFavorite = (routeNum) => {
  return favoriteRoutes.value.includes(routeNum);
};

// 切换收藏状态
const toggleFavorite = (routeNum) => {
  const index = favoriteRoutes.value.indexOf(routeNum);
  if (index > -1) {
    // 取消收藏
    favoriteRoutes.value.splice(index, 1);
    ElMessage.success(`已取消收藏 ${routeNum}`);
  } else {
    // 添加收藏
    favoriteRoutes.value.push(routeNum);
    ElMessage.success(`已收藏 ${routeNum}`);
  }
  saveFavorites();
};

// 查看收藏的线路
const viewFavorites = async () => {
  if (favoriteRoutes.value.length === 0) {
    ElMessage.info('还没有收藏任何线路哦~');
    return;
  }

  try {
    // 获取所有线路
    const res = await request.get('/routes');
    // 筛选出收藏的线路
    const favorites = res.data.filter(route => 
      favoriteRoutes.value.includes(route.routeNumber)
    );
    
    if (favorites.length === 0) {
      ElMessage.warning('收藏的线路数据不存在，可能已被删除');
      return;
    }

    routeList.value = favorites;
    currentPage.value = 1;
    expandedIndex.value = -1;
    showEmpty.value = false;
    ElMessage.success(`已显示 ${favorites.length} 条收藏线路`);
  } catch (err) {
    ElMessage.error('获取收藏线路失败，请重试');
  }
};

// 计算当前页显示的线路
const paginatedRoutes = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return routeList.value.slice(start, end);
});

// 页码变化时收起展开的卡片
const handlePageChange = () => {
  expandedIndex.value = -1;
};

// 组件挂载时加载收藏数据
onMounted(() => {
  loadFavorites();
});

const handleSearch = async () => {
  const keyword = routeNumber.value.trim();
  if (!keyword) {
    ElMessage.warning('请输入线路编号！');
    return;
  }

  try {
    // 第一步：优先精准查询（完全匹配线路编号）
    let res = await request.get(`/routes/${keyword}`);
    let routes = [];

    // 如果精准查询到结果，直接使用
    if (res.data && res.data.routeNumber) {
      routes = [res.data];
    } else {
      // 第二步：精准查询无结果，执行模糊查询
      res = await request.get(`/routes/search?keyword=${keyword}`);
      routes = res.data;
    }

    routeList.value = routes;
    currentPage.value = 1; // 重置到第一页
    expandedIndex.value = -1;
    showEmpty.value = routes.length === 0;

    if (routes.length > 0) {
      ElMessage.success(`找到${routes.length}条匹配线路！`);
    } else {
      ElMessage.info('暂无匹配的线路，请尝试其他编号');
    }
  } catch (err) {
    // 若精准查询接口报错（如404），直接执行模糊查询
    try {
      const res = await request.get(`/routes/search?keyword=${keyword}`);
      routeList.value = res.data;
      currentPage.value = 1; // 重置到第一页
      expandedIndex.value = -1;
      showEmpty.value = res.data.length === 0;

      if (res.data.length > 0) {
        ElMessage.success(`找到${res.data.length}条匹配线路！`);
      } else {
        ElMessage.info('暂无匹配的线路，请尝试其他编号');
      }
    } catch (err2) {
      routeList.value = [];
      showEmpty.value = true;
      ElMessage.error(err2.response?.data?.message || '查询失败，请重试');
    }
  }
};

const getAllRoutes = async () => {
  try {
    currentPage.value = 1; // 重置到第一页
    const res = await request.get('/routes');
    routeList.value = res.data;
    expandedIndex.value = -1;
    showEmpty.value = res.data.length === 0;

    if (res.data.length > 0) {
      ElMessage.success(`共查询到${res.data.length}条线路！`);
    } else {
      ElMessage.info('暂无任何线路数据，请先添加线路');
    }
  } catch (err) {
    routeList.value = [];
    showEmpty.value = true;
    ElMessage.error('获取线路列表失败，请重试');
  }
};

const toggleExpand = (index) => {
  expandedIndex.value = expandedIndex.value === index ? -1 : index;
};
</script>

<style scoped>
.query-container {
  max-width: 1200px;
  margin: 50px auto;
  padding: 0 20px;
}

.page-title {
  text-align: center;
  color: #1989fa;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 600;
}

.search-area {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.search-input {
  width: 350px;
  max-width: 100%;
}

.route-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.route-card {
  border-radius: 12px !important;
  overflow: hidden;
  border: 1px solid #e8f4f8 !important;
}

.route-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background-color: #f8f9fa;
}

.route-header-left {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
}

.favorite-icon {
  font-size: 22px;
  color: #ccc;
  cursor: pointer;
  transition: all 0.3s;
  margin-left: 15px;
}

.favorite-icon:hover {
  color: #ffa500;
  transform: scale(1.2);
}

.favorite-icon.is-favorite {
  color: #ff9800;
  animation: pulse 0.5s ease-in-out;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}

.route-basic {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.route-direction {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.time-tag {
  background-color: #e6f7ef !important;
  color: #00a86b !important;
}

.expand-icon {
  color: #1989fa;
  font-size: 20px;
  transition: transform 0.3s;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  height: 0;
  opacity: 0;
  overflow: hidden;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.stations-area {
  padding: 20px;
  border-top: 1px solid #eee;
}

.stations-title {
  color: #444;
  margin-bottom: 15px;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stations-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.station-tag {
  background-color: #e8f4f8 !important;
  color: #1989fa !important;
  padding: 10px 18px !important;
  font-size: 14px !important;
  border-radius: 20px !important;
}

.extra-info {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
  padding: 15px;
  background-color: #fafafa;
  border-radius: 8px;
}

.extra-info p {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 20px;
}

.empty-tip {
  margin-top: 80px;
}

@media (max-width: 768px) {
  .route-header {
    padding: 12px 15px;
  }

  .route-direction {
    font-size: 16px;
  }

  .stations-list {
    gap: 10px;
  }

  .extra-info {
    gap: 15px;
  }
}
</style>