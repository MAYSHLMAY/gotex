'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function AIProcurementChat({ availableProduce }: { availableProduce: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('/api/ai/procurement-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          availableProduce,
          conversationHistory: messages
        })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
        style={{ background: '#D4A017', color: '#1A1A2E' }}
      >
        <span className="text-2xl">AI</span>
      </button>

      {/* Side Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-96 z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: '#FFFDF8', borderLeft: '2px solid #D4A017', boxShadow: '-4px 0 20px rgba(0,0,0,0.1)' }}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid #D4A01730' }}>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#D4A017', color: '#1A1A2E' }}>AI</span>
            <div>
              <p className="font-semibold text-sm" style={{ color: '#3d2914' }}>Gotera AI Assistant</p>
              <p className="text-xs" style={{ color: '#8B4513' }}>Procurement helper</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} style={{ color: '#8B4513', fontSize: '20px' }}>x</button>
        </div>

        {/* Messages */}
        <div className="h-[calc(100%-140px)] overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: '#8B4513' }}>
                Hi! I can help you plan bulk produce orders. Try asking:
              </p>
              <p className="mt-2 text-xs italic" style={{ color: '#8B4513' }}>
                &quot;I need vegetables for 200 guests this weekend&quot;
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'ml-auto' : ''}`}
              style={{
                background: msg.role === 'user' ? '#D4A017' : '#F5F0E8',
                color: msg.role === 'user' ? '#1A1A2E' : '#3d2914',
              }}
            >
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 p-3 rounded-xl max-w-[85%]" style={{ background: '#F5F0E8' }}>
              <span className="inline-block w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#D4A017', borderTopColor: 'transparent' }} />
              <span className="text-sm" style={{ color: '#8B4513' }}>Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="absolute bottom-0 left-0 right-0 p-4" style={{ borderTop: '1px solid #D4A01730', background: '#FFFDF8' }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your order..."
              className="flex-1 px-3 py-2 rounded-lg text-sm"
              style={{ background: '#F5F0E8', border: '1px solid #D4A01730', color: '#3d2914' }}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: '#D4A017', color: '#1A1A2E' }}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
