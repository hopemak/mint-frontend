import React, { useState, useEffect, useRef } from 'react'
import {
  ChatBubbleLeftIcon,
  PlusIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  EllipsisHorizontalIcon,
  QuestionMarkCircleIcon,
  TrashIcon,
  LightBulbIcon,
  ScaleIcon,
  BanknotesIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { PageHeader } from '../../components/ui.jsx'
import { mlAPI } from '../../services/api.js'
import toast from 'react-hot-toast'

// Storage key for localStorage persistence
const STORAGE_KEY = 'mint_ai_chatbot_conversations'

// Available conversation categories
const CATEGORIES = ['All', 'Government Policies', 'Innovation FAQs']

// Icon mapping for categories
const CATEGORY_ICONS = {
  'Government Policies': ScaleIcon,
  'Innovation FAQs': LightBulbIcon,
}

// Pre-defined suggested questions for new users
const SUGGESTED_QUESTIONS = [
  { text: 'What government grants are available for early-stage startups?', category: 'Government Policies' },
  { text: 'How do I apply for R&D tax credits in Ethiopia?', category: 'Government Policies' },
  { text: 'What makes a strong pitch deck for MInT evaluators?', category: 'Innovation FAQs' },
  { text: 'How is my idea\'s innovation score actually calculated?', category: 'Innovation FAQs' },
]

// Factory function to create a new conversation object
function newConversation(title = 'New Conversation', category = 'Innovation FAQs') {
  return {
    id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    category,
    messages: [],
    updatedAt: Date.now(),
  }
}

// Load conversations from localStorage with fallback
function loadConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // corrupt/unavailable storage — fall through to default
  }
  return [newConversation('Welcome', 'Innovation FAQs')]
}

// Extract reply from API response with fallback handling
function extractChatReply(payload) {
  if (!payload) return null
  if (typeof payload.data === 'string') return payload.data
  return (
    payload.data?.reply ??
    payload.data?.message ??
    payload.data?.response ??
    payload.reply ??
    payload.message ??
    null
  )
}

/**
 * AIChatbot Component
 * Main chat interface for AI-powered assistance with government policies and innovation guidance
 */
export default function AIChatbot() {
  // State management
  const [conversations, setConversations] = useState(loadConversations)
  const [activeId, setActiveId] = useState(() => loadConversations()[0]?.id)
  const [activeCategory, setActiveCategory] = useState('All')
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)

  // Get the active conversation
  const active = conversations.find((c) => c.id === activeId) || conversations[0]

  // Persist conversations to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
    } catch {
      // storage unavailable — conversations still work for this session
    }
  }, [conversations])

  // Auto-scroll to the newest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [active?.messages?.length, sending])

  // Filter conversations based on selected category
  const visibleConversations = conversations
    .filter((c) => activeCategory === 'All' || c.category === activeCategory)
    .sort((a, b) => b.updatedAt - a.updatedAt)

  // Create a new conversation
  const handleNewConversation = () => {
    const conv = newConversation()
    setConversations((prev) => [conv, ...prev])
    setActiveId(conv.id)
    toast.success('Started a new conversation')
  }

  // Delete a conversation
  const handleDeleteConversation = (id, e) => {
    e.stopPropagation()
    if (conversations.length === 1) {
      toast.error('You need at least one conversation')
      return
    }
    const remaining = conversations.filter((c) => c.id !== id)
    setConversations(remaining)
    if (activeId === id) setActiveId(remaining[0].id)
  }

  // Send a message to the AI assistant
  const sendMessage = async (rawText) => {
    const text = (rawText || '').trim()
    if (!text || sending || !active) return

    // Create user message
    const userMsg = { id: `u-${Date.now()}`, role: 'user', text, time: Date.now() }
    const isFirstMessage = active.messages.length === 0

    // Update conversation with user message
    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? {
              ...c,
              title: isFirstMessage ? text.slice(0, 48) : c.title,
              messages: [...c.messages, userMsg],
              updatedAt: Date.now(),
            }
          : c
      )
    )
    setDraft('')
    setSending(true)

    try {
      // Prepare conversation history for context
      const recentHistory = active.messages.slice(-6).map((m) => ({ role: m.role, text: m.text }))
      
      // Call AI API
      const response = await mlAPI.chat(
        {
          message: text,
          context: {
            title: `MInT Innovation Platform — ${active.category} conversation`,
            history: recentHistory,
          },
        },
        { timeout: 20000 }
      )
      
      // Extract and add AI response
      const reply = extractChatReply(response?.data)
      const aiMsg = {
        id: `a-${Date.now()}`,
        role: 'ai',
        text: reply || "I received that, but the response wasn't in a recognized format.",
        time: Date.now(),
      }
      setConversations((prev) =>
        prev.map((c) => (c.id === active.id ? { ...c, messages: [...c.messages, aiMsg], updatedAt: Date.now() } : c))
      )
    } catch (err) {
      // Handle errors gracefully
      const errText =
        err.code === 'ECONNABORTED'
          ? 'The AI assistant took too long to respond (timed out).'
          : err.response
            ? `The AI assistant returned an error (status ${err.response.status}).`
            : 'Could not reach the AI assistant — it may be offline.'
      const aiMsg = { id: `a-${Date.now()}`, role: 'ai', text: errText, time: Date.now(), isError: true }
      setConversations((prev) =>
        prev.map((c) => (c.id === active.id ? { ...c, messages: [...c.messages, aiMsg], updatedAt: Date.now() } : c))
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        eyebrow="AI Chatbot"
        title="AI Chat Assistant"
        description="Ask questions about government policies, funding, and innovation guidance — answered live by AI."
      />

      <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Conversation list sidebar */}
        <aside className="lg:col-span-1 card p-4 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-semibold text-ink dark:text-white">Conversations</h2>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setConversations(loadConversations())}
                aria-label="Reload conversations"
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <ArrowPathIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNewConversation}
                aria-label="New conversation"
                className="bg-primary text-white rounded-lg p-1.5 hover:bg-primary-700"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Category filters */}
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary text-white border-primary'
                    : 'border-slate-200 dark:border-primary-600 text-slate-500 hover:border-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto space-y-1.5 -mx-1 px-1">
            {visibleConversations.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">No conversations in this category yet.</p>
            )}
            {visibleConversations.map((c) => {
              const Icon = CATEGORY_ICONS[c.category] || ChatBubbleLeftIcon
              const lastMsg = c.messages[c.messages.length - 1]
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  className={`w-full flex items-start gap-2.5 rounded-xl p-2.5 text-left transition-colors group ${
                    c.id === activeId ? 'bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-primary-700'
                  }`}
                >
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink dark:text-white truncate">{c.title}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {lastMsg ? lastMsg.text : 'No messages yet'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteConversation(c.id, e)}
                    aria-label="Delete conversation"
                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 shrink-0 p-1"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </button>
              )
            })}
          </div>
        </aside>

        {/* Active chat area */}
        <div className="lg:col-span-3 card p-0 flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-primary-700">
            <h2 className="font-heading font-semibold text-ink dark:text-white">{active?.title || 'AI Chat Assistant'}</h2>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Help" className="text-slate-400 hover:text-slate-600">
                <QuestionMarkCircleIcon className="h-5 w-5" />
              </button>
              <button type="button" aria-label="More options" className="text-slate-400 hover:text-slate-600">
                <EllipsisHorizontalIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages container */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Empty state */}
            {(!active || active.messages.length === 0) && (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <ChatBubbleLeftIcon className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-ink dark:text-white mb-1">Start the conversation</p>
                <p className="text-xs text-slate-500 max-w-xs">
                  Ask about funding, policy, or evaluation guidance — or try one of the suggested questions below.
                </p>
              </div>
            )}

            {/* Messages */}
            {active?.messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    m.role === 'user' ? 'bg-accent-500 text-white' : m.isError ? 'bg-red-100 text-red-500' : 'bg-primary text-white'
                  }`}
                >
                  {m.role === 'user' ? (
                    <span className="text-xs font-semibold">You</span>
                  ) : (
                    <ChatBubbleLeftIcon className="h-4 w-4" />
                  )}
                </div>
                {/* Message content */}
                <div className={`max-w-[75%] ${m.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-primary text-white'
                        : m.isError
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-slate-50 dark:bg-primary-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 px-1">
                    {new Date(m.time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {sending && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                  <ChatBubbleLeftIcon className="h-4 w-4 animate-pulse" />
                </div>
                <div className="rounded-2xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-primary-700 text-slate-400 italic">
                  Thinking…
                </div>
              </div>
            )}
          </div>

          {/* Suggested questions for new conversations */}
          {active?.messages.length === 0 && (
            <div className="px-5 pb-3 flex flex-wrap gap-2">
              <span className="text-xs font-medium text-slate-400 flex items-center px-1">Suggested:</span>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q.text}
                  type="button"
                  onClick={() => sendMessage(q.text)}
                  disabled={sending}
                  className="text-xs rounded-full border border-slate-200 dark:border-primary-600 px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                >
                  {q.text}
                </button>
              ))}
            </div>
          )}

          {/* Message input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage(draft)
            }}
            className="flex items-center gap-2 px-5 py-4 border-t border-slate-100 dark:border-primary-700"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask a question…"
              disabled={sending}
              className="input flex-1 disabled:opacity-60"
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={sending || !draft.trim()}
              className="btn-primary p-2.5 disabled:opacity-50"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
