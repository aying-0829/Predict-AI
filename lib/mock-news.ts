export interface NewsItem {
  id: string
  title: string
  summary: string
  thumbnail: string
  category: string
  source: string
  publishedAt: string
  url: string
  breaking: boolean
}

export const MOCK_NEWS: NewsItem[] = [
  {
    id: 'n1', title: '世界杯小组赛D组：巴西3-0完胜摩洛哥 维尼修斯梅开二度',
    summary: '桑巴军团延续强势表现，维尼修斯在上半场梅开二度，帮助巴西队以3-0横扫摩洛哥，提前一轮锁定小组头名。',
    thumbnail: '', category: '世界杯', source: 'ESPN', publishedAt: '2026-06-17T08:30:00Z',
    url: '#', breaking: true,
  },
  {
    id: 'n2', title: '英超：曼城官方宣布与哈兰德续约至2031年',
    summary: '曼城正式宣布挪威前锋哈兰德签署新合同，周薪将突破50万英镑，成为英超历史第一高薪。',
    thumbnail: '', category: '英超', source: 'BBC Sport', publishedAt: '2026-06-17T06:15:00Z',
    url: '#', breaking: true,
  },
  {
    id: 'n3', title: '西甲转会：皇马接近签下拜仁中场穆西亚拉',
    summary: '据多家媒体证实，皇家马德里已与拜仁慕尼黑就穆西亚拉的转会达成初步协议，转会费预计达到1.2亿欧元。',
    thumbnail: '', category: '西甲', source: 'Marca', publishedAt: '2026-06-16T22:00:00Z',
    url: '#', breaking: false,
  },
  {
    id: 'n4', title: '意甲：AC米兰官宣新主帅 孔蒂正式上任',
    summary: 'AC米兰正式宣布安东尼奥·孔蒂出任球队新任主教练，双方签约三年，年薪达到800万欧元。',
    thumbnail: '', category: '意甲', source: 'Gazzetta', publishedAt: '2026-06-16T18:45:00Z',
    url: '#', breaking: false,
  },
  {
    id: 'n5', title: '德甲：勒沃库森提前三轮卫冕成功',
    summary: '阿隆索执教的勒沃库森在客场2-0击败多特蒙德后，提前三轮锁定德甲冠军，完成卫冕壮举。',
    thumbnail: '', category: '德甲', source: 'Kicker', publishedAt: '2026-06-16T15:20:00Z',
    url: '#', breaking: false,
  },
  {
    id: 'n6', title: '彩市动态：大乐透奖池突破28亿 创今年新高',
    summary: '体彩大乐透最新一期开奖后，奖池金额攀升至28.36亿元，创下2026年以来的最高纪录。',
    thumbnail: '', category: '彩票', source: '中国体彩网', publishedAt: '2026-06-17T07:00:00Z',
    url: '#', breaking: false,
  },
  {
    id: 'n7', title: '世界杯G组：瑞士2-1逆转卡塔尔 小组头名晋级',
    summary: '瑞士队在先失一球的情况下连扳两球，以2-1逆转战胜东道主卡塔尔，以G组头名身份晋级淘汰赛。',
    thumbnail: '', category: '世界杯', source: 'FIFA', publishedAt: '2026-06-16T20:00:00Z',
    url: '#', breaking: false,
  },
  {
    id: 'n8', title: '英超：利物浦宣布新赛季季票价格冻结',
    summary: '利物浦官方宣布2026-27赛季季票价格维持不变，这也是连续第三年不涨价。',
    thumbnail: '', category: '英超', source: 'Liverpool Echo', publishedAt: '2026-06-16T12:00:00Z',
    url: '#', breaking: false,
  },
  {
    id: 'n9', title: '西甲：巴萨青年队夺得欧洲青年联赛冠军',
    summary: '巴塞罗那U19梯队以3-1击败本菲卡，夺得2025-26赛季欧洲青年联赛冠军。',
    thumbnail: '', category: '西甲', source: 'Sport', publishedAt: '2026-06-15T19:30:00Z',
    url: '#', breaking: false,
  },
  {
    id: 'n10', title: '彩市动态：竞彩足球世界杯期间销量增长215%',
    summary: '据国家体彩中心数据，竞彩足球在2026世界杯期间销量同比增长215%，单日最高销售额突破50亿元。',
    thumbnail: '', category: '彩票', source: '新华网', publishedAt: '2026-06-15T10:00:00Z',
    url: '#', breaking: false,
  },
  {
    id: 'n11', title: '德甲：多特蒙德官宣签下日本国脚久保健英',
    summary: '多特蒙德以4500万欧元从皇家社会签下日本前锋久保健英，合同期至2030年。',
    thumbnail: '', category: '德甲', source: 'BILD', publishedAt: '2026-06-15T14:00:00Z',
    url: '#', breaking: false,
  },
  {
    id: 'n12', title: '意甲：尤文图斯宣布今夏亚洲行计划',
    summary: '尤文图斯官方公布了今年7月的亚洲行计划，将在中国北京、上海和日本东京进行三场友谊赛。',
    thumbnail: '', category: '意甲', source: 'Football Italia', publishedAt: '2026-06-14T16:00:00Z',
    url: '#', breaking: false,
  },
]
