'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import PredictionFeed from '@/app/components/community/PredictionFeed'
import TopPredictors from '@/app/components/community/TopPredictors'
import HotTopics from '@/app/components/community/HotTopics'

interface Post {
  id: number
  author: string
  avatar: string
  time: string
  tag: string
  title: string
  content: string
  replies: number
  views: string
  likes: number
}

interface Reply {
  id: number
  author: string
  avatar: string
  time: string
  content: string
  likes: number
}

const tagColors: Record<string, string> = {
  '世界杯': 'bg-red-500/10 text-red-400 border border-red-500/20',
  '数字彩': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  '分析': 'bg-green-500/10 text-green-400 border border-green-500/20',
  '讨论': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  '问答': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  '复盘': 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
  '晒号': 'bg-pink-500/10 text-pink-400 border border-pink-500/20',
}

const initialPosts: Post[] = []

const mockReplies: Record<number, Reply[]> = {
  1: [
    { id: 101, author: '瑞士军刀', avatar: '🇨🇭', time: '1小时前', content: '瑞士后防确实有隐患，但卡塔尔进攻太依赖个人能力。我觉得 22% 给得合理，甚至偏高。', likes: 12 },
    { id: 102, author: '今晚梭哈', avatar: '💰', time: '30分钟前', content: '不管谁赢，我已经跟了 AI 推荐客胜！', likes: 5 },
  ],
  2: [
    { id: 201, author: '概率论', avatar: '🎲', time: '3小时前', content: '蓝球 16 选 1，纯随机期望是 6.25%。三期能中两期确实超出期望，但样本太小不能说明模型有效。', likes: 23 },
    { id: 202, author: '我跟了五期', avatar: '📝', time: '2小时前', content: '我五期只中了一期蓝球... 羡慕了', likes: 8 },
  ],
  3: [
    { id: 301, author: '足球分析师', avatar: '🔬', time: '6小时前', content: '摩洛哥打强队确实喜欢摆大巴，历史平局率在非洲球队里算高的。但巴西攻击线太豪华了，个人看法是 2-0 或 3-1。', likes: 15 },
  ],
  4: [
    { id: 401, author: '佛系看球', avatar: '🧘', time: '10小时前', content: '一场比赛翻车就否定模型太武断了。长期准确率 76% 摆在那里，继续观察吧。', likes: 31 },
    { id: 402, author: '数据不会骗人', avatar: '📈', time: '9小时前', content: '任何模型都有置信区间，揭幕战可能正好落在尾巴上。多看几场再说。', likes: 18 },
    { id: 403, author: '梭哈之王', avatar: '🔥', time: '8小时前', content: '我早就说过 AI 预测不准！！', likes: 2 },
  ],
}

const tags = ['全部', '世界杯', '数字彩', '分析', '讨论', '问答', '复盘', '晒号']
const sorts = ['最新', '最热', '精华']

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return ''
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMin = Math.floor((now - then) / 60000)
  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin}分钟前`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}小时前`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return `${diffDay}天前`
  return dateStr.slice(0, 10)
}

export default function CommunityPage() {
  useEffect(() => { document.title = 'Predict AI | 社区' }, [])
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [activeTag, setActiveTag] = useState('全部')
  const [activeSort, setActiveSort] = useState('最新')
  const [showEditor, setShowEditor] = useState(false)
  const [editorContent, setEditorContent] = useState('')
  const [editorTag, setEditorTag] = useState('讨论')
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null)
  const [replies, setReplies] = useState<Record<number, Reply[]>>(mockReplies)

  const nextReplyId = useMemo(() => Math.max(0, ...Object.values(replies).flat().map(r => r.id)) + 1, [replies])

  // Community enhanced data
  const [predictions, setPredictions] = useState<Array<{
    id: number; userId: number; username: string; lotteryType: string;
    numbers: string; result: string; isHit: number; createdAt: string;
  }>>([])
  const [topPredictors, setTopPredictors] = useState<Array<{
    userId: number; username: string; accuracy: number;
    totalPredictions: number; currentStreak: number;
  }>>([])
  const [hotTopics, setHotTopics] = useState<Array<{ tag: string; count: number }>>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/community?type=feed').then(r => r.json()).catch(() => null),
      fetch('/api/community?type=top-predictors').then(r => r.json()).catch(() => null),
      fetch('/api/community?type=hot-topics').then(r => r.json()).catch(() => null),
      fetch('/api/community?type=posts').then(r => r.json()).catch(() => null),
    ]).then(([feedRes, predictorsRes, topicsRes, postsRes]) => {
      if (feedRes?.code === 0) setPredictions(feedRes.data)
      if (predictorsRes?.code === 0) setTopPredictors(predictorsRes.data)
      if (topicsRes?.code === 0) setHotTopics(topicsRes.data)
      if (postsRes?.code === 0 && postsRes.data?.length > 0) {
        const formattedPosts: Post[] = postsRes.data.map((p: Record<string, unknown>) => {
          const content = String(p.content || '')
          const title = content.length > 50 ? content.slice(0, 50) + '...' : content
          const tag = String(p.matchTag || '讨论')
          const createdAt = String(p.createdAt || '')
          return {
            id: Number(p.id),
            author: String(p.username || '匿名用户'),
            avatar: '🧑',
            time: formatTimeAgo(createdAt),
            tag,
            title,
            content,
            replies: 0,
            views: String(p.views || 0),
            likes: Number(p.likes || 0),
          }
        })
        setPosts(formattedPosts)
      }
    })
  }, [])

  const filteredPosts = activeTag === '全部'
    ? posts
    : posts.filter(p => p.tag === activeTag)

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (activeSort === '最热') return b.replies - a.replies
    if (activeSort === '精华') return b.likes - a.likes
    return b.id - a.id
  })

  const expandedPost = expandedPostId ? posts.find(p => p.id === expandedPostId) : null

  const handlePublish = async () => {
    const trimmedContent = editorContent.trim()
    if (!trimmedContent) return

    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmedContent, match_tag: editorTag }),
      })
      const data = await res.json()
      if (data.code === 0 && data.data) {
        const p = data.data
        const content = String(p.content || '')
        const title = content.length > 50 ? content.slice(0, 50) + '...' : content
        const newPost: Post = {
          id: p.id,
          author: String(p.username || '我'),
          avatar: '🧑',
          time: '刚刚',
          tag: editorTag,
          title,
          content,
          replies: 0,
          views: '0',
          likes: 0,
        }
        setPosts(prev => [newPost, ...prev])
        setEditorContent('')
        setEditorTag('讨论')
        setShowEditor(false)
      }
    } catch {
      // silently fail
    }
  }

  const handleReply = (postId: number) => {
    const trimmed = replyText.trim()
    if (!trimmed) return

    const newReply: Reply = {
      id: nextReplyId,
      author: '我',
      avatar: '🧑',
      time: '刚刚',
      content: trimmed,
      likes: 0,
    }
    setReplies(prev => ({ ...prev, [postId]: [...(prev[postId] || []), newReply] }))
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, replies: p.replies + 1 } : p))
    setReplyText('')
    setReplyTargetId(null)
  }

  return (
    <div className="max-w-[1240px] mx-auto px-10 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif text-[#e8e8f0] mb-2">讨论区</h1>
          <p className="text-sm text-[#9098b0]">交流预测心得 · 分享购彩经验 · 理性讨论</p>
        </div>
        <button
          onClick={() => { setShowEditor(!showEditor); setExpandedPostId(null) }}
          className="px-5 py-2 rounded text-sm bg-[var(--neon-cyan)] text-[#e8e8f0] font-semibold hover:bg-[var(--neon-cyan)]/80 transition-colors"
        >
          {showEditor ? '收起' : '+ 发布新帖'}
        </button>
      </div>

      {/* 发帖编辑器 */}
      {showEditor && (
        <div className="bg-[#0c0c18] p-6 mb-6 rounded-xl border border-[rgba(0,229,255,0.1)]">
          <div className="flex gap-2 mb-3">
            {['世界杯', '数字彩', '分析', '讨论', '问答', '复盘', '晒号'].map(t => (
              <button
                key={t}
                onClick={() => setEditorTag(t)}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  editorTag === t
                    ? `font-semibold ${tagColors[t]}`
                    : 'bg-[#0c0c18] text-[#9098b0] hover:text-[#e8e8f0]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <textarea
            value={editorContent}
            onChange={e => setEditorContent(e.target.value)}
            placeholder="分享你的预测心得或讨论话题..."
            className="w-full h-32 p-4 border border-[rgba(0,229,255,0.1)] rounded-lg text-sm text-[#e8e8f0] resize-none focus:outline-none focus:border-[rgba(0,229,255,0.3)] bg-[#0c0c18]"
            maxLength={2000}
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-[#9098b0]">文明发言，理性讨论。禁止广告和违规内容。</span>
            <div className="flex gap-3">
              <button onClick={() => setShowEditor(false)} className="px-4 py-2 text-sm text-[#9098b0] hover:text-[#e8e8f0]">取消</button>
              <button
                onClick={handlePublish}
                disabled={!editorContent.trim()}
                className="px-5 py-2 rounded text-sm bg-[var(--neon-cyan)] text-white font-semibold hover:bg-[var(--neon-cyan)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                发布
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 帖子详情展开 */}
      {expandedPost && (
        <div className="bg-[#0c0c18] mb-6 overflow-hidden rounded-xl border border-[rgba(0,229,255,0.1)]">
          <div className="p-6 border-b border-[rgba(0,229,255,0.08)]">
            <button
              onClick={() => { setExpandedPostId(null); setReplyTargetId(null) }}
              className="text-xs text-[var(--neon-cyan)] hover:underline mb-3 inline-block"
            >
              ← 返回列表
            </button>
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${tagColors[expandedPost.tag] || ''}`}>
                {expandedPost.tag}
              </span>
              <span className="text-xs text-[#9098b0]">{expandedPost.time}</span>
            </div>
            <h1 className="text-xl font-serif font-bold text-[#e8e8f0] mb-4">{expandedPost.title}</h1>
            <p className="text-sm text-[#e8e8f0] leading-relaxed whitespace-pre-wrap">{expandedPost.content}</p>
            <div className="flex items-center gap-6 mt-4 text-xs text-[#9098b0]">
              <span className="flex items-center gap-1">{expandedPost.avatar} {expandedPost.author}</span>
              <span>💬 {expandedPost.replies} 回复</span>
              <span>👁 {expandedPost.views}</span>
              <span>❤ {expandedPost.likes}</span>
            </div>
          </div>

          {/* 回复列表 */}
          <div className="px-6 py-4 bg-[#faf8f5]">
            <h3 className="text-sm font-semibold text-[#e8e8f0] mb-4">
              回复 ({replies[expandedPost.id]?.length || 0})
            </h3>

            {(replies[expandedPost.id] || []).length === 0 && (
              <p className="text-sm text-[#9098b0] text-center py-6">暂无回复，来说点什么吧</p>
            )}

            <div className="space-y-3 mb-4">
              {(replies[expandedPost.id] || []).map(r => (
                <div key={r.id} className="bg-[#0c0c18] p-4 rounded-lg border border-[rgba(0,229,255,0.08)]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{r.avatar}</span>
                    <span className="text-xs font-semibold text-[#e8e8f0]">{r.author}</span>
                    <span className="text-xs text-[#9098b0]">{r.time}</span>
                  </div>
                  <p className="text-sm text-[#e8e8f0] leading-relaxed">{r.content}</p>
                </div>
              ))}
            </div>

            {/* 回复框 */}
            {replyTargetId === expandedPost.id ? (
              <div>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="写下你的回复..."
                  className="w-full p-3 border border-[rgba(0,229,255,0.1)] rounded-lg text-sm text-[#e8e8f0] resize-none focus:outline-none focus:border-[rgba(0,229,255,0.3)] bg-[#0c0c18]"
                  rows={3}
                  maxLength={2000}
                />
                <div className="flex justify-end gap-3 mt-2">
                  <button onClick={() => { setReplyTargetId(null); setReplyText('') }} className="text-xs text-[#9098b0] hover:text-[#e8e8f0]">
                    取消
                  </button>
                  <button
                    onClick={() => handleReply(expandedPost.id)}
                    disabled={!replyText.trim()}
                    className="px-4 py-1.5 rounded text-xs bg-[var(--neon-cyan)] text-white font-semibold hover:bg-[var(--neon-cyan)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    回复
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setReplyTargetId(expandedPost.id)}
                className="text-xs text-[var(--neon-cyan)] hover:underline"
              >
                + 写回复
              </button>
            )}
          </div>
        </div>
      )}

      {/* 标签筛选 */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {tags.map(t => (
          <button
            key={t}
            onClick={() => { setActiveTag(t); setExpandedPostId(null) }}
            className={`px-4 py-1.5 rounded-full text-sm transition-all ${
              activeTag === t
                ? 'bg-[#06060c] text-[var(--neon-cyan)]'
                : 'bg-[#0c0c18] text-[#9098b0] border border-[rgba(0,229,255,0.1)] hover:border-[rgba(0,229,255,0.3)]'
            }`}
          >
            {t}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          {sorts.map(s => (
            <button
              key={s}
              onClick={() => setActiveSort(s)}
              className={`px-3 py-1.5 rounded text-xs transition-all ${
                activeSort === s
                  ? 'bg-[#0c0c18] text-[#e8e8f0] font-semibold'
                  : 'text-[#9098b0] hover:text-[#e8e8f0]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 预测动态流 */}
      {predictions.length > 0 && (
        <section className="mb-6">
          <h3 className="text-lg font-serif text-[#e8e8f0] mb-3 font-semibold">预测动态</h3>
          <PredictionFeed predictions={predictions.slice(0, 5)} />
        </section>
      )}

      {/* 高手推荐 */}
      {topPredictors.length > 0 && (
        <section className="mb-6">
          <h3 className="text-lg font-serif text-[#e8e8f0] mb-3 font-semibold">高手推荐</h3>
          <TopPredictors predictors={topPredictors} />
        </section>
      )}

      {/* 热门话题 */}
      {hotTopics.length > 0 && (
        <section className="mb-6">
          <h3 className="text-lg font-serif text-[#e8e8f0] mb-3 font-semibold">热门话题</h3>
          <HotTopics topics={hotTopics} />
        </section>
      )}

      {/* 帖子列表 */}
      <div className="space-y-3">
        {sortedPosts.map(post => (
          <div
            key={post.id}
            onClick={() => { setExpandedPostId(post.id); setShowEditor(false) }}
            className="bg-[#0c0c18] p-5 hover:border-[rgba(0,229,255,0.3)] transition-colors cursor-pointer rounded-xl border border-[rgba(0,229,255,0.1)]"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#0c0c18] flex items-center justify-center text-xl shrink-0 border border-[rgba(0,229,255,0.1)]">
                {post.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${tagColors[post.tag] || 'bg-gray-500/10 text-[#9098b0] border border-gray-500/20'}`}>
                    {post.tag}
                  </span>
                  <h2 className="text-base font-semibold text-[#e8e8f0] truncate">{post.title}</h2>
                </div>
                <p className="text-sm text-[#9098b0] line-clamp-2 mb-3">{post.content}</p>
                <div className="flex items-center gap-5 text-xs text-[#9098b0]">
                  <span>{post.author}</span>
                  <span>{post.time}</span>
                  <span>💬 {post.replies} 回复</span>
                  <span>👁 {post.views}</span>
                  <span>❤ {post.likes}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedPosts.length === 0 && (
        <div className="text-center py-16 text-[#9098b0]">
          <p className="text-4xl mb-3">📭</p>
          <p>该分类下暂无帖子，来发布第一个吧！</p>
        </div>
      )}
    </div>
  )
}
