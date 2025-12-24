import axios from 'axios';

// 创建Axios实例
const service = axios.create({
  baseURL: 'http://localhost:3000/api', // 后端接口基础路径（固定，对应后端的/api前缀）
  timeout: 5000 // 请求超时时间（5秒）
});

// 导出实例，供其他组件使用
export default service;