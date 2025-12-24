const mongoose = require('mongoose');

const busRouteSchema = new mongoose.Schema({
  routeNumber: { type: String, required: true, unique: true }, // 线路编号（唯一）
  startStation: { type: String, required: true }, // 起点站
  endStation: { type: String, required: true }, // 终点站
  stations: [{ type: String }], // 途径站点
  totalTime: { type: Number }, // 全程耗时（分钟）
  updateTime: { type: Date, default: Date.now } // 数据更新时间
});

module.exports = mongoose.model('BusRoute', busRouteSchema);