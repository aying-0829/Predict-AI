# Predict AI - 全面打磨设计文档

> 日期：2026-06-16 | 阶段：工程重构 + 安全加固

## 一、目标

在不影响现有功能的前提下，完成以下打磨：
- 工程重构：拆分大文件、抽公共组件/工具、统一代码风格
- 安全加固：关闭 JWT 默认密钥、TOCTOU 竞态防护、速率限制、bet_slips 加 user_id
- 功能补全：实现缺失的积分入口（AI预测+5、分享+20）、补 404 页面、投注结算逻辑

## 二、工程重构

### 2.1 文件拆分

**lib/services.ts (1081行) → 7 个模块**

```
lib/services/
  ├── lottery.ts      # 彩票历史、冷热号、遗漏统计、AI推荐
  ├── sports.ts       # 赛事匹配、盘口、AI分析、投注
  ├── member.ts       # 会员方案、权益、用户资料、积分规则
  ├── poster.ts       # 海报数据
  ├── alert.ts        # 开奖提醒订阅
  ├── dashboard.ts    # KPI、准确率、预测记录、趋势、推荐
  └── worldcup.ts     # 世界杯比赛、积分榜、淘汰赛对阵
```

所有现有 import 路径更新，保持向后兼容。

**大页面拆分**

| 页面文件 | 拆出组件 |
|---|---|
| `app/page.tsx` | `KpiCard`, `QuickLink`, `RecommendCard`, `LiveMatchCard`, `PredictionTable`, `AccuracyOverview`, `TrendSidebar` |
| `app/betting/page.tsx` | `MatchCard`, `HandicapTable`, `BetSlipBar`, `AIAnalysisSidebar`, `OddsButton` |
| `app/member/page.tsx` | `PlanCard`, `ProfileCard`, `FeatureComparisonTable`, `PointsCenter`, `PointsHistoryTable`, `Toast` |
| `app/lottery/deep/page.tsx` | `BlueFreqChart`, `SumTrendChart`, `HotColdPanel`, `MissTable`, `RecommendationPanel` |

### 2.2 公共组件

| 组件 | 位置 | 说明 |
|---|---|---|
| `Toast` | `app/components/Toast.tsx` | 统一通知；supersede betting 和 member 中的各自实现 |
| `ErrorBoundary` | `app/components/ErrorBoundary.tsx` | 捕获渲染异常，显示降级 UI |
| `Loading` | `app/components/Loading.tsx` | 统一骨架屏，支持自定义行数 |
| `useApi` | `app/hooks/useApi.ts` | 封装 `fetch` + `loading` + `error` + `retry` |

### 2.3 公共工具

| 工具 | 位置 | 说明 |
|---|---|---|
| `fetchJson` | `lib/fetch.ts` | 统一 fetch 封装，带超时和错误标准化 |

### 2.4 新增页面

| 页面 | 路径 | 说明 |
|---|---|---|
| 404 页面 | `app/not-found.tsx` | 自定义 404，含返回首页链接 |

## 三、安全加固

### 3.1 JWT 密钥硬编码

`lib/auth.ts` 中 `JWT_SECRET` 的默认值改为启动检查：

```typescript
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('[FATAL] JWT_SECRET 环境变量未设置，拒绝启动')
}
```

### 3.2 TOCTOU 竞态防护（签到/下注）

不使用 Redis。用 SQLite `BEGIN IMMEDIATE` 事务 + SELECT ... FOR UPDATE 模式。

签到 API 改造：
1. 开启 `BEGIN IMMEDIATE` 事务
2. 事务内查询今日是否已签到（带行级锁）
3. 未签到则写入并提交，已签到则回滚返回错误

### 3.3 bet_slips 加 user_id

- DB 迁移：`ALTER TABLE bet_slips ADD COLUMN user_id INTEGER DEFAULT 1`
- API 强制从 `req.user.id` 注入
- 查询投注记录时按 user_id 过滤

### 3.4 速率限制

新增 `lib/rateLimit.ts`，内存 Map 实现滑动窗口：

- 窗口：60 秒
- 上限：20 次请求
- 超限返回 429 + Retry-After header
- 以 IP + 路由前缀为 key

对所有 POST/PUT/DELETE API 路由统一加 `withRateLimit` 中间件。

### 3.5 注册验证码

已有短信验证码机制（`verification_codes` 表），注册路由 `POST /api/auth/register` 已使用。无需额外改动。确认该路由确实调用了 `verifyResetCode`。

## 四、功能补全

### 4.1 "完成 AI 预测 +5 积分" 入口

新增 `POST /api/member/predict-reward`：

- 需认证
- 每日该类型最多 3 次（免费版）/不限（会员）→ 实际改为每日最多 5 次（统一）
- 写入 points_history + 更新 users.points

前端在用户点击"AI 预测选号"或"生成推荐"按钮后调用。

### 4.2 "分享预测 +20 积分" 入口

新增 `POST /api/member/share-reward`：

- 需认证
- 每日最多 1 次
- 写入 points_history + 更新 users.points

前端在分享页/分享按钮触发后调用。

### 4.3 体育投注结算

新增 `POST /api/sports/settle`（定时/手动触发）：

- 遍历 bet_slips 中 won=0 的记录
- 对比 `api/sports/matches?filter=finished` 的 actualResult
- 命中则更新 won=1，写入 points_history（+赔率×100积分）
- 未命中则标记 won=-1

### 4.4 404 页面

`app/not-found.tsx`：Next.js 内置机制，自定义 404 UI。

## 五、不变更项

以下问题暂不纳入本次打磨，避免扩大范围：

- 假数据替换为真实 API（需真实的彩票/体育数据源接入）
- WebSocket/SSE 实时推送
- 管理后台
- CI/CD 流水线
- 国际化
- E2E 测试

## 六、执行顺序

```
Phase 1: 工程重构（文件拆分、公共组件抽取）
Phase 2: 安全加固（JWT、竞态、速率限制、user_id）
Phase 3: 功能补全（积分入口、投注结算、404）
```

Phase 1 和 Phase 2 可部分并行（前端重构 vs 后端安全改造互不冲突）。

## 七、验收标准

- [ ] `lib/services.ts` 已删除，所有引用指向新模块
- [ ] 所有页面无编译错误，`npm run build` 通过
- [ ] 三个大页面（dashboard/betting/member/lottery-deep）各有独立组件文件
- [ ] Toast 组件统一，全局可用
- [ ] JWT_SECRET 未设置时应用拒绝启动
- [ ] 签到接口在并发调用时不会重复签到
- [ ] bet_slips 表有 user_id 列，API 注入当前用户
- [ ] 所有写操作 API 有速率限制
- [ ] 两个新积分 API 可正常调用并入账
- [ ] 404 页面正常显示
- [ ] 无回归 bug