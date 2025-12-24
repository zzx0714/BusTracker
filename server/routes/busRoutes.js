const express = require('express');
const router = express.Router();
const BusRoute = require('../models/BusRoute');
const BusStop = require('../models/BusStop'); 

// 1. 查询所有线路（GET请求）
router.get('/', async (req, res) => {
  try {
    const routes = await BusRoute.find().populate('stations', 'name');
    res.json(routes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 模糊查询线路（按编号、起点、终点、站点匹配）
router.get('/search', async (req, res) => {
  const keyword = (req.query.keyword || '').trim();
  if (!keyword) {
    return res.json([]);
  }

  // 将用户输入转为不区分大小写的安全正则
  const safeRegex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  try {
    const routes = await BusRoute.find({
      $or: [
        { routeNumber: safeRegex },
        { startStation: safeRegex },
        { endStation: safeRegex },
        { stations: safeRegex }
      ]
    });

    res.json(routes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. 根据线路编号查询线路（GET请求）
router.get('/:routeNumber', async (req, res) => {
  try {
    const route = await BusRoute.findOne({ routeNumber: req.params.routeNumber }).populate('stations', 'name location');
    if (!route) return res.status(404).json({ message: '线路不存在' });
    res.json(route);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 3. 新增公交线路（POST请求）
router.post('/', async (req, res) => {
  // 1. 接收前端传来的线路数据（req.body就是前端发送的JSON）
  const newRoute = new BusRoute({
    routeNumber: req.body.routeNumber, // 线路编号（如"1路"）
    startStation: req.body.startStation, // 起点站
    endStation: req.body.endStation, // 终点站
    totalTime: req.body.totalTime, // 全程耗时（分钟）
    stations: req.body.stations // 途经站点（字符串数组）
  });

  try {
    // 2. 保存数据到数据库
    const savedRoute = await newRoute.save();
    res.status(201).json(savedRoute); // 返回新增的线路数据
  } catch (err) {
    res.status(400).json({ message: err.message }); // 错误提示（如线路编号重复）
  }
});

// 4. 更新线路（PUT请求）
router.put('/:routeNumber', async (req, res) => {
  try {
    const updatedRoute = await BusRoute.findOneAndUpdate(
      { routeNumber: req.params.routeNumber }, // 按线路编号查询要更新的线路
      req.body, // 前端传递的更新数据
      { new: true, runValidators: true } // new: 返回更新后的数据；runValidators: 触发字段验证
    );
    if (!updatedRoute) return res.status(404).json({ message: '线路不存在' });
    res.json(updatedRoute);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


module.exports = router;

