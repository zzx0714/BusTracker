// 脚本：为每个站点关联途经的线路
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const BusRoute = require('./models/BusRoute');
const BusStop = require('./models/BusStop');

async function linkRoutesToStops() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    // 1. 获取所有线路
    const routes = await BusRoute.find();
    console.log(`📍 找到 ${routes.length} 条线路\n`);

    // 2. 遍历每条线路，更新站点的 routes 字段
    for (const route of routes) {
      console.log(`处理线路: ${route.routeNumber}`);
      
      for (const stationName of route.stations) {
        // 查找站点并添加线路关联（避免重复）
        await BusStop.updateOne(
          { name: stationName },
          { $addToSet: { routes: route._id } }
        );
      }
    }

    console.log('\n✅ 线路关联完成\n');

    // 3. 验证结果
    const stops = await BusStop.find().populate('routes', 'routeNumber');
    console.log('📊 站点关联情况：');
    console.log('='.repeat(80));
    
    stops.forEach((stop, index) => {
      const routeNumbers = stop.routes.map(r => r.routeNumber).join(', ');
      console.log(`${index + 1}. ${stop.name} - 途经线路: [${routeNumbers}] (${stop.routes.length}条)`);
    });

    await mongoose.connection.close();
    console.log('\n✅ 操作完成');
  } catch (err) {
    console.error('❌ 错误:', err.message);
    await mongoose.connection.close();
  }
}

linkRoutesToStops();
