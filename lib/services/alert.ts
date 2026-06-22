export type AlertSubscription = {
  id: string
  lotteryName: string
  lotteryType: string
  drawTime: string
  enabled: boolean
  channels: {
    inapp: boolean
    wechat: boolean
    email: boolean
    sms: boolean
  }
}

const alertSubscriptions: AlertSubscription[] = [
  {
    id: 'alert-1',
    lotteryName: '双色球',
    lotteryType: 'ssq',
    drawTime: '每周二、四、日 21:15 开奖',
    enabled: true,
    channels: { inapp: true, wechat: true, email: false, sms: false },
  },
  {
    id: 'alert-2',
    lotteryName: '大乐透',
    lotteryType: 'dlt',
    drawTime: '每周一、三、六 20:25 开奖',
    enabled: true,
    channels: { inapp: true, wechat: false, email: false, sms: false },
  },
  {
    id: 'alert-3',
    lotteryName: '3D福彩',
    lotteryType: '3d',
    drawTime: '每日 20:30 开奖',
    enabled: false,
    channels: { inapp: false, wechat: false, email: false, sms: false },
  },
  {
    id: 'alert-4',
    lotteryName: '竞彩足球',
    lotteryType: 'sport',
    drawTime: '赛事结束后 30 分钟内公布',
    enabled: true,
    channels: { inapp: true, wechat: false, email: true, sms: true },
  },
  {
    id: 'alert-5',
    lotteryName: '排列五',
    lotteryType: 'pl5',
    drawTime: '每日 20:30 开奖',
    enabled: false,
    channels: { inapp: false, wechat: false, email: false, sms: false },
  },
]

export function getAlertSubscriptions(): AlertSubscription[] {
  return alertSubscriptions
}

export function updateAlertSubscription(
  id: string,
  data: Partial<Pick<AlertSubscription, 'enabled' | 'channels'>>
): AlertSubscription | null {
  const idx = alertSubscriptions.findIndex(a => a.id === id)
  if (idx === -1) return null

  if (data.enabled !== undefined) {
    alertSubscriptions[idx].enabled = data.enabled
  }
  if (data.channels) {
    alertSubscriptions[idx].channels = {
      ...alertSubscriptions[idx].channels,
      ...data.channels,
    }
  }

  return alertSubscriptions[idx]
}
