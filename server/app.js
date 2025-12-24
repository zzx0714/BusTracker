const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析JSON请求

// 连接MongoDB数据库
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('数据库连接成功'))
  .catch(err => console.log('数据库连接失败：', err));

app.use('/api/routes', require('./routes/busRoutes'));

// 启动服务器
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`服务器运行在端口${port}`));