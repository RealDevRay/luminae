'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api-client'
import { useParams } from 'next/navigation'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUGGESTED_QUESTIONS_WITH_PAPER = [
  "Summarize this paper's key findings",
  "What methodology does this paper use?",
  "What are the main limitations?",
  "How could the experiments be improved?",
  "Explain the statistical approach used",
]

const SUGGESTED_QUESTIONS_GENERAL = [
  "How does Luminae analyze papers?",
  "What does the methodology critique include?",
  "How much does each analysis cost?",
  "What file formats are supported?",
  "How do I export my analysis results?",
]

interface ChatbotProps {
  paperId?: string
}

export function Chatbot({ paperId }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: paperId
        ? "Hi! I'm Luminae's AI assistant. I have access to the paper you're analyzing — ask me anything about its methodology, findings, or how to improve the research."
        : "Hi! I'm Luminae's AI research assistant. I can help with questions about research methodology, our analysis features, or academic writing. How can I help?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const suggestedQuestions = paperId ? SUGGESTED_QUESTIONS_WITH_PAPER : SUGGESTED_QUESTIONS_GENERAL

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setIsLoading(true)

    try {
      // Build conversation history from messages (exclude welcome)
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }))

      const response = await apiClient.chat(currentInput, history, paperId)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I couldn't process your request right now. Please try again in a moment.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
  }

  // Render markdown-style formatting in messages
  const renderContent = (content: string) => {
    // Simple markdown: **bold**, *italic*, `code`, and newlines
    const parts = content.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\n)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i}>{part.slice(1, -1)}</em>
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1 py-0.5 bg-muted rounded text-xs">{part.slice(1, -1)}</code>
      }
      if (part === '\n') {
        return <br key={i} />
      }
      return part
    })
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-foreground text-background rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center z-50 group"
        aria-label="Open AI assistant"
      >
        <MessageCircle className="w-6 h-6 group-hover:hidden" />
        <Sparkles className="w-6 h-6 hidden group-hover:block" />
      </button>
    )
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 w-96 bg-background border border-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden transition-all animate-slide-in-right',
        isMinimized ? 'h-16' : 'h-[500px]'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b bg-foreground text-background">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <div>
            <span className="font-medium text-sm">Luminae AI</span>
            {paperId && (
              <span className="block text-xs opacity-70">Analyzing your paper</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:opacity-80 transition-opacity"
            aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:opacity-80 transition-opacity"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' && 'flex-row-reverse'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    message.role === 'assistant'
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {message.role === 'assistant' ? (
                    <Bot className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={cn(
                    'max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed',
                    message.role === 'assistant'
                      ? 'bg-muted rounded-tl-sm'
                      : 'bg-foreground text-background rounded-tr-sm'
                  )}
                >
                  {renderContent(message.content)}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-muted p-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && !isLoading && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">
                {paperId ? 'Ask about this paper:' : 'Suggested questions:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-xs px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={paperId ? "Ask about this paper..." : "Ask a question..."}
                className="flex-1 px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
