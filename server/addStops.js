// 脚本：从现有线路中提取所有站点并添加到站点集合
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const BusRoute = require('./models/BusRoute');
const BusStop = require('./models/BusStop');

async function addStops() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    // 1. 获取所有线路
    const routes = await BusRoute.find();
    console.log(`📍 找到 ${routes.length} 条线路`);

    // 2. 提取所有站点名称并去重
    const stationSet = new Set();
    routes.forEach(route => {
      route.stations.forEach(station => {
        stationSet.add(station);
      });
    });

    const uniqueStations = Array.from(stationSet);
    console.log(`🚏 发现 ${uniqueStations.length} 个不同的站点\n`);

    // 3. 检查已存在的站点
    const existingStops = await BusStop.find({ name: { $in: uniqueStations } });
    const existingNames = new Set(existingStops.map(stop => stop.name));
    
    // 4. 过滤出需要新增的站点
    const newStations = uniqueStations.filter(name => !existingNames.has(name));
    
    if (newStations.length === 0) {
      console.log('✅ 所有站点已存在，无需添加');
    } else {
      // 5. 批量创建新站点
      const stopsToInsert = newStations.map(name => ({
        name: name,
        routes: [],
        location: { latitude: null, longitude: null }
      }));

      const result = await BusStop.insertMany(stopsToInsert);
      console.log(`✅ 成功添加 ${result.length} 个新站点：`);
      result.forEach((stop, index) => {
        console.log(`   ${index + 1}. ${stop.name}`);
      });
    }

    // 6. 显示最终统计
    const totalStops = await BusStop.countDocuments();
    console.log(`\n📊 站点集合中现有 ${totalStops} 个站点`);

    await mongoose.connection.close();
    console.log('\n✅ 操作完成');
  } catch (err) {
    console.error('❌ 错误:', err.message);
    await mongoose.connection.close();
  }
}

addStops();
