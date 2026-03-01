'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, Brain, Lightbulb, DollarSign, Clock, Loader2, History } from 'lucide-react'
import { AnalysisDashboard } from '@/components/analysis/AnalysisDashboard'
import { Chatbot } from '@/components/chatbot/Chatbot'
import { useAuth } from '@/hooks/useAuth'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function AnalysisPage({ params }: PageProps) {
  const { id } = use(params)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Dashboard
              </Link>
              <div className="h-6 w-px bg-border" />
              <span className="text-sm text-muted-foreground">
                Analysis #{id.slice(0, 8)}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/history"
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <History className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnalysisDashboard jobId={id} />
      </main>

      <Chatbot />
    </div>
  )
}
