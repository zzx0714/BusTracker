const mongoose = require('mongoose');

const busStopSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 站点名称
  location: { latitude: Number, longitude: Number }, // 经纬度（后续地图功能用）
  routes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BusRoute' }], // 途经线路（关联线路模型）
  address: { type: String } // 站点地址（可选）
});

module.exports = mongoose.model('BusStop', busStopSchema);