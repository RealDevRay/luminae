'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUGGESTED_QUESTIONS = [
  "How does Luminae analyze papers?",
  "What does the methodology critique include?",
  "How much does each analysis cost?",
  "Can I export my analysis results?",
  "How do I view my analysis history?",
]

const KNOWLEDGE_BASE: Record<string, string> = {
  "how does luminae analyze": "Luminae uses a multi-agent AI pipeline: 1) OCR extracts text from PDFs, 2) Vision analyzes figures, 3) Five specialized agents critique methodology, audit datasets, design experiments, synthesize findings, and generate grant proposals. Each paper costs approximately $0.82.",
  "methodology critique": "The methodology critique identifies: Design flaws (confounding variables, selection bias), Statistical power (sample size, effect sizes), Reproducibility (protocol clarity, code availability), and Validity threats. Each issue is severity-rated as critical, warning, or note.",
  "cost": "Each complete analysis costs approximately $0.82: OCR ($0.05), Vision ($0.02), AI Agents ($0.75). With a $15 budget, you can analyze approximately 18 papers per month.",
  "export": "Yes! You can export analysis results in multiple formats: Markdown, JSON, and the dashboard allows copying grant proposals directly. Look for the export buttons on the analysis results page.",
  "history": "Sign in to access your analysis history. All your previous analyses are stored in your personal dashboard where you can retrieve and re-view results anytime.",
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm Luminae's AI assistant. I can help you with questions about our platform, features, pricing, and troubleshooting. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getAnswer = (question: string): string => {
    const lowerQuestion = question.toLowerCase()
    
    for (const [key, answer] of Object.entries(KNOWLEDGE_BASE)) {
      if (lowerQuestion.includes(key)) {
        return answer
      }
    }
    
    return "I don't have specific information about that. You can try asking about our features, pricing, or how analysis works. For detailed support, please contact our team."
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500))

    const answer = getAnswer(input)
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: answer,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, assistantMessage])
    setIsLoading(false)
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-foreground text-background rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center z-50"
      >
        <MessageCircle className="w-6 h-6" />
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
          <span className="font-medium">Luminae Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:opacity-80 transition-opacity"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:opacity-80 transition-opacity"
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
                    'max-w-[80%] p-3 rounded-2xl text-sm',
                    message.role === 'assistant'
                      ? 'bg-muted rounded-tl-sm'
                      : 'bg-foreground text-background rounded-tr-sm'
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-muted p-3 rounded-2xl rounded-tl-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && !isLoading && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((question) => (
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
                placeholder="Ask a question..."
                className="flex-1 px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
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
