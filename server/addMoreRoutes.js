// 脚本：添加15条新线路，设计共同站点使系统更真实
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const BusRoute = require('./models/BusRoute');

// 15条新线路数据，设计了一些共同站点（如人民公园、市政府、火车站等）
const newRoutes = [
  {
    routeNumber: '2路',
    startStation: '火车站',
    endStation: '科技园',
    totalTime: 45,
    stations: ['火车站', '站前广场', '中心医院', '市政府', '会展中心', '软件园', '科技园']
  },
  {
    routeNumber: '3路',
    startStation: '客运西站',
    endStation: '机场',
    totalTime: 68,
    stations: ['客运西站', '建材市场', '人民公园', '体育中心', '国际会展', '空港新城', '机场']
  },
  {
    routeNumber: '6路',
    startStation: '市政府',
    endStation: '港口',
    totalTime: 52,
    stations: ['市政府', '人民商场', '中心广场', '海滨公园', '渔港码头', '港口']
  },
  {
    routeNumber: '8路',
    startStation: '高铁站',
    endStation: '温泉小镇',
    totalTime: 60,
    stations: ['高铁站', '火车站', '人民公园', '钟楼', '古城区', '温泉度假村', '温泉小镇']
  },
  {
    routeNumber: '12路',
    startStation: '汽车东站',
    endStation: '影视城',
    totalTime: 48,
    stations: ['汽车东站', '高新区', '大学城', '创意园区', '影视基地', '影视城']
  },
  {
    routeNumber: '15路',
    startStation: '植物园',
    endStation: '动物园',
    totalTime: 35,
    stations: ['植物园', '师范大学', '中医院', '人民公园', '市民广场', '森林公园', '动物园']
  },
  {
    routeNumber: '18路',
    startStation: '火车站',
    endStation: '工业园区',
    totalTime: 50,
    stations: ['火车站', '钟楼', '市政府', '体育中心', '开发区管委会', '工业园区']
  },
  {
    routeNumber: '20路',
    startStation: '人民公园',
    endStation: '湿地公园',
    totalTime: 40,
    stations: ['人民公园', '图书馆', '博物馆', '艺术中心', '生态园', '湿地公园']
  },
  {
    routeNumber: '25路',
    startStation: '高铁站',
    endStation: '奥体中心',
    totalTime: 42,
    stations: ['高铁站', '会展中心', '市政府', '体育中心', '游泳馆', '奥体中心']
  },
  {
    routeNumber: '28路',
    startStation: '客运西站',
    endStation: '古镇',
    totalTime: 55,
    stations: ['客运西站', '人民路', '钟楼', '古城墙', '古街', '古镇']
  },
  {
    routeNumber: '30路',
    startStation: '大学城',
    endStation: '商业中心',
    totalTime: 38,
    stations: ['大学城', '大学城北', '科技园', '软件园', 'CBD', '商业中心']
  },
  {
    routeNumber: '35路',
    startStation: '汽车北站',
    endStation: '度假区',
    totalTime: 65,
    stations: ['汽车北站', '解放路', '人民公园', '植物园', '风景区入口', '度假区']
  },
  {
    routeNumber: '40路',
    startStation: '火车站',
    endStation: '新区医院',
    totalTime: 48,
    stations: ['火车站', '站前广场', '中心医院', '人民公园', '新区管委会', '新区医院']
  },
  {
    routeNumber: '45路',
    startStation: '高铁站',
    endStation: '购物广场',
    totalTime: 32,
    stations: ['高铁站', '会展中心', '人民商场', '步行街', '购物广场']
  },
  {
    routeNumber: '50路',
    startStation: '市政府',
    endStation: '湖滨新城',
    totalTime: 55,
    stations: ['市政府', '体育中心', '奥体中心', '湖滨路', '湖滨公园', '湖滨新城']
  }
];

async function addRoutes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    // 检查已存在的线路
    const existingRoutes = await BusRoute.find({ 
      routeNumber: { $in: newRoutes.map(r => r.routeNumber) } 
    });
    const existingNumbers = new Set(existingRoutes.map(r => r.routeNumber));

    // 过滤出需要新增的线路
    const routesToAdd = newRoutes.filter(r => !existingNumbers.has(r.routeNumber));

    if (routesToAdd.length === 0) {
      console.log('✅ 所有线路已存在，无需添加');
    } else {
      const result = await BusRoute.insertMany(routesToAdd);
      console.log(`✅ 成功添加 ${result.length} 条新线路：\n`);
      result.forEach((route, index) => {
        console.log(`${index + 1}. ${route.routeNumber}: ${route.startStation} → ${route.endStation} (${route.totalTime}分钟, ${route.stations.length}个站)`);
      });
    }

    // 显示最终统计
    const totalRoutes = await BusRoute.countDocuments();
    console.log(`\n📊 线路集合中现有 ${totalRoutes} 条线路`);

    await mongoose.connection.close();
    console.log('\n✅ 操作完成');
  } catch (err) {
    console.error('❌ 错误:', err.message);
    await mongoose.connection.close();
  }
}

addRoutes();
