import { useEffect, useRef, useState } from 'react'
import { Send, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { sendMessage } from '../services/chat.api'
import { PageHeader, Card, RiskBadge } from '../components/ui'
import { suggestedQuestions as suggestedMessages } from '../data/demo'

const FIELD_LABELS = {
  product: 'Product', color: 'Color', size: 'Size', quantity: 'Quantity',
  wilaya: 'Wilaya', customerName: 'Customer name', phone: 'Phone',
  address: 'Exact address', price: 'Price (DA)',
}

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Salam ! Envoyez votre commande ici (Darija, français ou arabe).' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [draft, setDraft] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text) {
    const message = (text ?? input).trim()
    if (!message || loading) return
    setMessages((m) => [...m, { role: 'user', text: message }])
    setInput('')
    setLoading(true)
    try {
      const data = await sendMessage(message)
      setMessages((m) => [...m, { role: 'ai', text: data.reply }])
      setDraft(data)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHeader
        title="AI Assistant"
        subtitle="Simulated WhatsApp channel: the AI turns a customer chat into a validated order draft."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        {/* Chat */}
        <section className="flex h-[calc(100vh-14rem)] min-h-[420px] flex-col rounded-[14px] bg-white shadow-sm">
          <div className="flex-1 space-y-3 overflow-auto p-5">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p
                  dir="auto"
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === 'user' ? 'bg-brand text-white' : 'bg-blue-50 text-ink'
                  }`}
                >
                  {m.text}
                </p>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <p className="animate-pulse rounded-2xl bg-blue-50 px-4 py-2.5 text-sm text-muted">AI is thinking...</p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-blue-50 p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestedMessages.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  disabled={loading}
                  className="max-w-full truncate rounded-full border border-blue-200 px-3 py-1 text-xs font-semibold text-muted hover:bg-blue-50 disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); send() }}
              className="flex gap-2"
            >
              <input
                dir="auto"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type the customer's message..."
                className="flex-1 rounded-xl border border-blue-100 px-3 py-2.5 text-sm outline-none focus:border-brand"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex items-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-white disabled:opacity-50"
              >
                <Send size={16} /> Send
              </button>
            </form>
          </div>
        </section>

        {/* Draft panel */}
        <div className="space-y-5">
          <Card title="Order draft">
            {!draft ? (
              <p className="text-sm text-muted">Send a message to see the extracted order. Missing fields are never invented.</p>
            ) : (
              <div className="space-y-2.5">
                {Object.entries(FIELD_LABELS).map(([key, label]) => {
                  const value = draft.order?.[key]
                  const missing = draft.missing?.includes(key) || value == null
                  return (
                    <div key={key} className={`flex items-center justify-between rounded-xl border p-2.5 text-sm ${missing ? 'border-gold bg-amber-50' : 'border-blue-100'}`}>
                      <span className="text-muted">{label}</span>
                      {missing ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Missing</span>
                      ) : (
                        <span className="font-bold">{value}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {draft && (
            <>
              <Card title="Delivery risk">
                <RiskBadge band={draft.risk?.band} />
                <p className="mt-2 text-sm text-muted">{draft.risk?.reason}</p>
              </Card>
              <Card title="Courier suggestion">
                <p className="flex items-center gap-2 text-sm font-bold"><Sparkles size={16} className="text-gold" /> {draft.courier?.recommended ?? 'Unknown'}</p>
                <p className="mt-1 text-sm text-muted">{draft.courier?.reason}</p>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  )
}