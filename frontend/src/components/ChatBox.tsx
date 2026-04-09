import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Wrench, Loader2 } from 'lucide-react'
import axios from 'axios'

interface ToolCallInfo {
  tool: string
  args: Record<string, unknown>
  result: Record<string, unknown>
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolCalls?: ToolCallInfo[]
}

interface Props {
  onToolExecuted: () => void
}

const TOOL_LABELS: Record<string, string> = {
  get_battery_status: '🔋 Kiểm tra pin',
  get_tire_pressure: '🛞 Kiểm tra lốp',
  find_charging_station: '⚡ Tìm trạm sạc',
  turn_on_ac: '❄️ Bật điều hoà',
}

export default function ChatBox({ onToolExecuted }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await axios.post('/api/chat', { messages: apiMessages })

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: res.data.reply,
        toolCalls: res.data.tool_calls?.length ? res.data.tool_calls : undefined,
      }

      setMessages([...updatedMessages, assistantMsg])

      // Nếu có tool_calls → refresh dashboard
      if (res.data.tool_calls?.length) {
        onToolExecuted()
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể kết nối server'
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `⚠️ Lỗi: ${errorMessage}. Hãy kiểm tra backend đã chạy và OPENAI_API_KEY đã được cấu hình.`,
      }
      setMessages([...updatedMessages, errorMsg])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-full flex flex-col glass-card overflow-hidden">
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-vinfast-border/30 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-vinfast-accent to-vinfast-cyan flex items-center justify-center">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Trợ lý VinFast</p>
          <p className="text-[10px] text-vinfast-text-muted">Hỏi tôi bất kỳ điều gì về xe</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col items-center justify-center text-center gap-3 py-8"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-vinfast-accent/20 to-vinfast-cyan/20 flex items-center justify-center animate-float">
              <Bot className="w-7 h-7 text-vinfast-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-vinfast-text-muted">Xin chào! 👋</p>
              <p className="text-xs text-vinfast-text-muted/60 mt-1 max-w-[240px]">
                Tôi là trợ lý AI trên xe VinFast. Hãy hỏi tôi về trạng thái xe hoặc yêu cầu điều khiển.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
              {['Xe còn bao nhiêu pin?', 'Bật điều hoà', 'Kiểm tra lốp'].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); inputRef.current?.focus() }}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-vinfast-border/50 text-vinfast-text-muted hover:border-vinfast-accent/50 hover:text-vinfast-accent transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-vinfast-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3 h-3 text-vinfast-accent" />
                </div>
              )}
              <div className={`max-w-[85%] flex flex-col gap-1.5`}>
                {/* Tool calls badge */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {msg.toolCalls.map((tc, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-vinfast-accent/10 text-vinfast-accent-glow font-medium">
                        <Wrench className="w-2.5 h-2.5" />
                        {TOOL_LABELS[tc.tool] || tc.tool}
                      </span>
                    ))}
                  </div>
                )}

                {/* Message bubble */}
                <div className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-vinfast-accent to-blue-600 text-white rounded-br-md'
                    : 'bg-vinfast-card border border-vinfast-border/30 text-vinfast-text rounded-bl-md'
                }`}>
                  {msg.content}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-lg bg-vinfast-accent/30 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3 h-3 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 items-start"
          >
            <div className="w-6 h-6 rounded-lg bg-vinfast-accent/15 flex items-center justify-center shrink-0">
              <Bot className="w-3 h-3 text-vinfast-accent" />
            </div>
            <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-vinfast-card border border-vinfast-border/30 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-vinfast-accent animate-spin" />
              <span className="text-xs text-vinfast-text-muted">Đang xử lý...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-vinfast-border/30">
        <div className="flex items-center gap-2 bg-vinfast-darker/80 rounded-xl px-3 py-2 border border-vinfast-border/30 focus-within:border-vinfast-accent/40 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi trợ lý VinFast..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-white placeholder-vinfast-text-muted/50 outline-none disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 rounded-lg bg-vinfast-accent hover:bg-vinfast-accent-glow disabled:bg-vinfast-border disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
