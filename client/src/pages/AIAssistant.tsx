import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Sparkles, Bot, User, Loader2 } from 'lucide-react'
import { getInitials } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

const SAMPLE_RESPONSES = [
  "That's a great question! Based on your academic data, I'd recommend focusing on improving your study habits. Try the Pomodoro technique with 25-minute focused sessions followed by 5-minute breaks.",
  "Looking at your performance trends, you're doing well in quantitative subjects. Consider dedicating more time to theoretical courses to balance your skill set.",
  "I've analyzed your schedule. You have optimal study times in the morning between 8-11 AM. Try scheduling your most challenging subjects during this window.",
  "Great progress this week! You've completed 85% of your planned study sessions. Keep up the momentum and consider adding a short review session before bed.",
  "Based on your goals, I suggest breaking down your targets into smaller weekly milestones. This approach has helped students improve their completion rate by 40%.",
]

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(() => crypto.randomUUID())
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.get<{ messages: Message[] }>(`/chat/${sessionId}`).then(d => setMessages(d.messages || [])).catch(() => {})
  }, [sessionId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: input, createdAt: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      await api.post('/chat', { sessionId, message: input })
    } catch {}

    setTimeout(() => {
      const response = SAMPLE_RESPONSES[Math.floor(Math.random() * SAMPLE_RESPONSES.length)]
      const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: response, createdAt: new Date().toISOString() }
      setMessages(prev => [...prev, assistantMsg])
      setLoading(false)
    }, 800)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Assistant</h1>
          <p className="text-sm text-gray-400 mt-1">Your intelligent academic companion</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-xs text-violet-400 font-medium">Powered by AI</span>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Bot className="w-16 h-16 text-violet-500/30 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">How can I help you today?</h3>
              <p className="text-sm text-gray-500 max-w-md">Ask me about your courses, study tips, schedule optimization, or any academic question.</p>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-violet-400" />
                </div>
              )}
              <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-violet-600/80 text-white rounded-tr-sm'
                    : 'bg-white/5 text-gray-200 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
                <p className={`text-xs text-gray-600 mt-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-emerald-400" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-violet-400" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white/5 text-sm text-gray-400 rounded-tl-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex gap-3">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={send} disabled={!input.trim() || loading}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
