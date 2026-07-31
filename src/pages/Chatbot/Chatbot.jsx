import React, { useState } from 'react'
import { PaperAirplaneIcon, ChatBubbleLeftIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { PageHeader } from '../../components/ui.jsx'
import { conversations } from '../../data/sampleData.js'
import api from '../../services/api.js'

const suggested = ['Startup Grant Guidelines?', 'Market Entry Strategy?', 'Pitch Deck Review?']

export default function Chatbot() {
  const [active, setActive] = useState(conversations[0])
  const [messages, setMessages] = useState([
    { id: 1, from: 'ai', text: 'Hi! Ask me about grants, market strategy, or your pitch deck — I can pull from the platform knowledge base.' },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  const send = async (text) => {
    if (!text.trim()) return
    const userMsg = { id: Date.now(), from: 'user', text }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setSending(true)
    try {
      const { data } = await api.post('/api/chatbot/message', { message: text, conversationId: active.id })
      setMessages((m) => [...m, { id: Date.now() + 1, from: 'ai', text: data.reply }])
    } catch {
      setMessages((m) => [...m, {
        id: Date.now() + 1,
        from: 'ai',
        text: 'Backend is offline, so here is a demo answer: connect the /api/chatbot/message endpoint to get real AI responses grounded in your knowledge base.',
      }])
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Assistant" title="AI Chatbot" />
      <div className="grid lg:grid-cols-4 gap-4 h-[calc(100vh-220px)]">
        <div className="card p-4 overflow-y-auto">
          <h2 className="font-heading font-semibold text-ink dark:text-white mb-3">Conversations</h2>
          <div className="space-y-1.5">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c)}
                className={`w-full text-left flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  active.id === c.id ? 'bg-primary/10 text-primary' : 'hover:bg-slate-50 dark:hover:bg-primary-700 text-ink dark:text-slate-200'
                }`}
              >
                <ChatBubbleLeftIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  <span className="block font-medium">{c.title}</span>
                  <span className="block text-xs text-slate-400">{c.updated}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 card p-0 flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-primary-700 flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-primary" />
            <h2 className="font-heading font-semibold text-ink dark:text-white">{active.title}</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-md rounded-2xl px-4 py-2.5 text-sm ${
                    m.from === 'user' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-primary-700 text-ink dark:text-slate-100'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {sending && <p className="text-xs text-slate-400">AI is typing...</p>}
          </div>
          <div className="p-4 border-t border-slate-100 dark:border-primary-700">
            <div className="flex gap-2 mb-3 flex-wrap">
              {suggested.map((s) => (
                <button key={s} onClick={() => send(s)} className="badge bg-slate-100 dark:bg-primary-700 text-slate-500 dark:text-slate-300">
                  {s}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); send(input) }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about grants, strategy, funding..."
                className="input flex-1"
              />
              <button type="submit" className="btn-primary px-3.5">
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
