// 临时脚本：查看数据库中的线路和站点数据
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const BusRoute = require('./models/BusRoute');
const BusStop = require('./models/BusStop');

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    // 查询所有线路
    const routes = await BusRoute.find();
    console.log(`📍 线路总数: ${routes.length}`);
    console.log('='.repeat(80));
    routes.forEach((route, index) => {
      console.log(`\n${index + 1}. 线路编号: ${route.routeNumber}`);
      console.log(`   起点站: ${route.startStation}`);
      console.log(`   终点站: ${route.endStation}`);
      console.log(`   全程耗时: ${route.totalTime}分钟`);
      console.log(`   途经站点(${route.stations.length}个): ${route.stations.join(' → ')}`);
    });

    console.log('\n' + '='.repeat(80));

    // 查询所有站点
    const stops = await BusStop.find().populate('routes', 'routeNumber');
    console.log(`\n🚏 站点总数: ${stops.length}`);
    console.log('='.repeat(80));
    stops.forEach((stop, index) => {
      console.log(`\n${index + 1}. 站点名称: ${stop.name}`);
      if (stop.location && (stop.location.longitude || stop.location.latitude)) {
        console.log(`   位置: 经度${stop.location.longitude}, 纬度${stop.location.latitude}`);
      }
      if (stop.address) {
        console.log(`   地址: ${stop.address}`);
      }
      const routeNumbers = stop.routes.map(r => r.routeNumber).join(', ');
      console.log(`   途经线路: [${routeNumbers}] (${stop.routes.length}条)`);
    });

    await mongoose.connection.close();
    console.log('\n✅ 数据查询完成');
  } catch (err) {
    console.error('❌ 错误:', err.message);
  }
}

checkData();
