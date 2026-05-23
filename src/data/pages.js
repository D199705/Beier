/**
 * 大云镇大云旅游度假区 — 导览数据
 * 百分比坐标（x, y, width, height），适配所有屏幕尺寸
 */

const pages = {
  'dayun-overview': {
    id: 'dayun-overview', title: '大云镇大云旅游度假区',
    description: '浙江省嘉兴市嘉善县\n长三角几何中心 · 沪杭高铁嘉善南站旁\n三大国家4A级景区 · 中国甜蜜度假目的地',
    color: '#f5f1e6', image: '',
    overlay: [
      { image: '/images/caojia-service.png', label: '曹家村党群服务中心', targetId: 'caojia-service', x: 5, y: 44, width: 23, rotate: -2 },
      { image: '/images/yunlan-hotspring.png', label: '云澜湾温泉国际', targetId: 'yunlan-hotspring', x: 65, y: 20, width: 23, rotate: 2 },
      { image: '/images/xiangwang-coffee.png', label: '向往的生活', targetId: 'xiangwang-coffee', x: 35, y: 28, width: 21, rotate: 0 },
      { image: '/images/xinyi-farm.png', label: '心意家庭农场', targetId: 'xinyi-farm', x: 54, y: 62, width: 23, rotate: -1 },
    ],
    hotspots: [
    ],
    parentId: null, siblings: [],
  },

  // ===== 第 2 层：曹家村党群服务中心 =====
  'caojia-service': {
    id: 'caojia-service', title: '曹家村党群服务中心',
    description: '浙江省嘉兴市嘉善县大云镇东北部\n沪杭高速大云出口下，导航搜索"曹家村党群服务中心"\n耕地4450亩 · 15个村民小组 · 20个青创项目\n辖区拥有云澜湾温泉国际（国家4A级景区）',
    color: '#f5f1e6', image: '/images/caojia-service-detail.jpg',
    hotspots: [],
    parentId: 'dayun-overview',
    siblings: ['caojia-service'],
  },

  // ===== 第 3 层：曹家村各景点 =====
  'yunlan-hotspring': {
    id:'yunlan-hotspring', title:'云澜湾温泉国际',
    description:'国家4A级景区\n中国首个"女人温泉"品牌\n地下2160米岩层真温泉，积淀26000年\n迪拜帆船酒店设计团队打造 · 总投资超30亿',
    color:'#f5f1e6', image:'/images/yunlan-hotspring.jpg',
    hotspots:[],
    parentId:'caojia-service',
    siblings:['yunlan-hotspring','xinyi-farm','coffee-391','xiangwang-coffee','xiyu-yard','jinyun-homestay','yunbao-museum'],
  },
  'xinyi-farm': {
    id:'xinyi-farm', title:'心意家庭农场',
    description:'云澜湾往南580米\n亲子野米饭、露营烧烤、垂钓采摘\n农作物区、小动物区、儿童乐园\n节假日日均预订超百人',
    color:'#f5f1e6', image:'/images/xinyi-farm.jpg', hotspots:[], parentId:'caojia-service',
    siblings:['yunlan-hotspring','xinyi-farm','coffee-391','xiangwang-coffee','xiyu-yard','jinyun-homestay','yunbao-museum'],
  },
  'xiangwang-coffee': {
    id:'xiangwang-coffee', title:'向往的生活',
    description:'云澜湾西入口南侧\n窑烤面包 + 咖啡甜品 + 嘉善本帮私房菜（需预约）\n院内可垂钓，田园庭院风',
    color:'#f5f1e6', image:'', hotspots:[], parentId:'caojia-service',
    siblings:['yunlan-hotspring','xinyi-farm','coffee-391','xiangwang-coffee','xiyu-yard','jinyun-homestay','yunbao-museum'],
  },
  'xiyu-yard': {
    id:'xiyu-yard', title:'夕遇小院',
    description:'曹家村牛草泾 · 紧邻云澜湾\n吊炉火锅、野米饭、露天烧烤\n帐篷露营 + 篝火表演音乐会',
    color:'#f5f1e6', image:'', hotspots:[], parentId:'caojia-service',
    siblings:['yunlan-hotspring','xinyi-farm','coffee-391','xiangwang-coffee','xiyu-yard','jinyun-homestay','yunbao-museum'],
  },
  'jinyun-homestay': {
    id:'jinyun-homestay', title:'近云九舍民宿',
    description:'曹家新村530号 · 浙江省银级民宿\n9间客房（大床房+亲子房+套房）\n五星级标准 · 含早餐+免费厨房',
    color:'#f5f1e6', image:'', hotspots:[], parentId:'caojia-service',
    siblings:['yunlan-hotspring','xinyi-farm','coffee-391','xiangwang-coffee','xiyu-yard','jinyun-homestay','yunbao-museum'],
  },
  'yunbao-museum': {
    id:'yunbao-museum', title:'云宝二十四节气馆',
    description:'云澜湾西入口停车场三楼\n展示二十四节气农耕文化\n节假日开设市集\n3D打印、手工艺品、美甲等15个摊位',
    color:'#f5f1e6', image:'', hotspots:[], parentId:'caojia-service',
    siblings:['yunlan-hotspring','xinyi-farm','coffee-391','xiangwang-coffee','xiyu-yard','jinyun-homestay','yunbao-museum'],
  },
  'coffee-391': {
    id:'coffee-391', title:'391咖啡',
    description:'停车场改造的网红咖啡馆\n咖啡+机车+涂鸦文化\n工业风设计，年轻人打卡热门地\n精品手冲和轻食甜点',
    color:'#f5f1e6', image:'', hotspots:[], parentId:'caojia-service',
    siblings:['yunlan-hotspring','xinyi-farm','coffee-391','xiangwang-coffee','xiyu-yard','jinyun-homestay','yunbao-museum'],
  },

}

export const ROOT_PAGE_ID = 'dayun-overview'
export function getPage(id) { return pages[id] || null }
export function getSiblings(id) {
  const page = pages[id]
  if (!page?.siblings?.length) return []
  return page.siblings.map(sid => pages[sid]).filter(Boolean)
}
export default pages
