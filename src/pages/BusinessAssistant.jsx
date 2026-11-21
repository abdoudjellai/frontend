import { useCallback, useEffect, useRef, useState } from 'react'
import { BarChart3, MessageSquarePlus, Send, Sparkles, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { assistantApi } from '../services/assistant.api'
import { errorMessage } from '../services/api'
import { PageHeader, Skeleton } from '../components/ui'
import Markdown from '../components/Markdown'

const SUGGESTIONS = [
  'Give me an overview of my business.',
  'How much revenue did I generate this month?',
  'Compare this month with last month.',
  'Show me my five most recent orders.',
  'Which delivery company performs best?',
  'How can I reduce my return rate?',
]

/** Friendly names for the data sources the assistant used (backend tool names). */
const SOURCE_LABELS = {
  get_business_overview: 'Business overview',
  get_revenue_summary: 'Revenue',
  get_orders_summary: 'Orders',
  get_recent_orders: 'Recent orders',
  get_order_details: 'Order details',
  get_customer_insights: 'Customers',
  get_top_products: 'Products',
  get_return_analysis: 'Returns',
  get_delivery_performance: 'Couriers',
  compare_business_periods: 'Period comparison',
}

const MAX_LENGTH = 4000

const formatTime = (iso) =>
  new Date(iso).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

function ThinkingIndicator() {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(timer)
  }, [])
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl bg-blue-50 px-4 py-2.5 text-sm text-muted">
        <span className="animate-pulse">Analyzing your business data…</span>
        {seconds >= 8 && <span className="block text-xs">Detailed questions can take up to a minute.</span>}
      </div>
    </div>
  )
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isUser ? 'whitespace-pre-wrap bg-brand text-sm text-white' : 'bg-blue-50 text-ink'
          }`}
          dir="auto"
        >
          {isUser ? message.content : <Markdown text={message.content} />}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 px-1 text-[11px] text-muted">
          <span>{formatTime(message.createdAt)}</span>
          {!isUser && message.toolsUsed?.length > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <BarChart3 size={12} aria-hidden="true" />
              <span>Based on: {message.toolsUsed.map((t) => SOURCE_LABELS[t] ?? t).join(', ')}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BusinessAssistant() {
  const { store } = useAuth()
  const storeId = store?.id ?? null

  const [conversations, setConversations] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [conversationLoading, setConversationLoading] = useState(false)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const loadConversations = useCallback(async () => {
    if (!storeId) return
    try {
      const data = await assistantApi.conversations(storeId)
      setConversations(data.conversations)
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setListLoading(false)
    }
  }, [storeId])

  // Switching store starts fresh: conversations are per store.
  useEffect(() => {
    setActiveId(null)
    setMessages([])
    setError(null)
    setListLoading(true)
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  async function openConversation(id) {
    if (sending || id === activeId) return
    setActiveId(id)
    setMessages([])
    setError(null)
    setConversationLoading(true)
    try {
      const data = await assistantApi.conversation(id)
      setMessages(data.messages)
    } catch (err) {
      toast.error(errorMessage(err))
      setActiveId(null)
      loadConversations()
    } finally {
      setConversationLoading(false)
    }
  }

  function newConversation() {
    if (sending) return
    setActiveId(null)
    setMessages([])
    setError(null)
    inputRef.current?.focus()
  }

  async function removeConversation(id) {
    if (sending || !window.confirm('Delete this conversation? This cannot be undone.')) return
    try {
      await assistantApi.deleteConversation(id)
      setConversations((list) => list.filter((c) => c.id !== id))
      if (id === activeId) newConversation()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  async function send(text) {
    const message = (text ?? input).trim()
    if (!message || sending || !storeId) return
    const pending = { id: `pending-${Date.now()}`, role: 'user', content: message, createdAt: new Date().toISOString() }
    setMessages((list) => [...list, pending])
    setInput('')
    setError(null)
    setSending(true)
    try {
      const data = await assistantApi.chat({ message, conversationId: activeId, storeId })
      setMessages((list) => [...list, data.message])
      if (data.createdConversation) setActiveId(data.conversationId)
      loadConversations()
    } catch (err) {
      // The backend saves nothing on failure: take the message back so it can be retried.
      setMessages((list) => list.filter((m) => m.id !== pending.id))
      setInput(message)
      setError(err.code === 'ECONNABORTED' ? 'The assistant took too long to answer. Please try again.' : errorMessage(err))
      if (err.response?.status === 404 && activeId) {
        setActiveId(null)
        setMessages([])
        loadConversations()
      }
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const showWelcome = !activeId && messages.length === 0 && !conversationLoading

  return (
    <>
      <PageHeader
        live
        title="Business Assistant"
        subtitle={`Ask questions about ${store?.name ?? 'your store'}: revenue, orders, customers, returns and couriers. Read-only — it never changes your data.`}
      />

      {!store ? (
        <div className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">Create a store first to use the assistant.</div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
          {/* Conversation history */}
          <aside className="flex max-h-64 flex-col rounded-[14px] bg-white p-3 shadow-sm lg:max-h-[calc(100vh-14rem)]">
            <button
              onClick={newConversation}
              disabled={sending}
              className="mb-3 flex items-center justify-center gap-2 rounded-xl bg-brand px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              <MessageSquarePlus size={16} /> New conversation
            </button>
            <div className="flex-1 space-y-1 overflow-y-auto">
              {listLoading ? (
                <Skeleton className="h-20" />
              ) : conversations.length === 0 ? (
                <p className="px-2 py-3 text-xs text-muted">No conversations yet.</p>
              ) : (
                conversations.map((c) => (
                  <div
                    key={c.id}
                    className={`group flex items-center gap-1 rounded-lg ${c.id === activeId ? 'bg-blue-50' : 'hover:bg-blue-50/60'}`}
                  >
                    <button
                      onClick={() => openConversation(c.id)}
                      disabled={sending}
                      className="min-w-0 flex-1 px-2.5 py-2 text-left disabled:cursor-not-allowed"
                    >
                      <p dir="auto" className="truncate text-sm font-semibold text-ink">{c.title}</p>
                      <p className="text-[11px] text-muted">{formatTime(c.updatedAt)}</p>
                    </button>
                    <button
                      onClick={() => removeConversation(c.id)}
                      disabled={sending}
                      aria-label={`Delete conversation ${c.title}`}
                      className="me-1 rounded-md p-1.5 text-muted opacity-60 hover:bg-red-50 hover:text-danger group-hover:opacity-100 disabled:opacity-30"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </aside>

          {/* Chat */}
          <section className="flex h-[calc(100vh-14rem)] min-h-[460px] flex-col rounded-[14px] bg-white shadow-sm">
            <div className="flex-1 space-y-4 overflow-auto p-5">
              {conversationLoading && <Skeleton className="h-32" />}

              {showWelcome && (
                <div className="mx-auto max-w-xl py-6 text-center">
                  <Sparkles className="mx-auto mb-2 text-gold" size={28} />
                  <h2 className="text-lg font-bold text-ink">How can I help with your business?</h2>
                  <p className="mb-5 text-sm text-muted">
                    Answers are based on your real store data. Ask in English, French, Arabic or Darija.
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        disabled={sending}
                        className="rounded-xl border border-blue-100 px-3 py-2.5 text-left text-sm text-ink hover:bg-blue-50 disabled:opacity-50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => <MessageBubble key={m.id} message={m} />)}
              {sending && <ThinkingIndicator />}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-blue-50 p-4">
              {error && (
                <div className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-danger">
                  <span>{error}</span>
                  <button onClick={() => send()} disabled={sending || !input.trim()} className="rounded-lg bg-white px-3 py-1 text-ink shadow-sm">
                    Retry
                  </button>
                </div>
              )}
              <form onSubmit={(e) => { e.preventDefault(); send() }} className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  dir="auto"
                  rows={1}
                  value={input}
                  maxLength={MAX_LENGTH}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
                  }}
                  placeholder="Ask about your revenue, orders, returns…"
                  className="max-h-40 min-h-[44px] flex-1 resize-y rounded-xl border border-blue-100 px-3 py-2.5 text-sm outline-none focus:border-brand"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="flex h-[44px] items-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-white disabled:opacity-50"
                >
                  <Send size={16} /> Send
                </button>
              </form>
              <p className="mt-1.5 text-[11px] text-muted">Enter to send · Shift+Enter for a new line</p>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
