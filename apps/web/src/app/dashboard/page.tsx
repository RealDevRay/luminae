'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UploadZone } from '@/components/upload/UploadZone'
import { BudgetCard } from '@/components/upload/BudgetCard'
import { AnalysisList } from '@/components/analysis/AnalysisList'
import { Chatbot } from '@/components/chatbot/Chatbot'
import { Brain, ArrowLeft, History, Loader2, User, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const { user, loading } = useAuth()
  const isGuestMode = !loading && !user

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Home
              </Link>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-background" />
                </div>
                <span className="text-xl font-bold">Luminae</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <BudgetCard />
              <Link
                href="/history"
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <History className="w-5 h-5" />
              </Link>
              <Link
                href="/auth"
                className="flex items-center gap-2 px-3 py-2 bg-foreground text-background rounded-lg text-sm font-medium"
              >
                <User className="w-4 h-4" />
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      {isGuestMode && (
        <div className="bg-amber-500/10 border-b border-amber-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-amber-700">
                Guest Mode - Analysis results will not be saved. 
              </span>
              <Link href="/auth" className="font-medium underline text-amber-800 hover:text-amber-900">
                Sign in to save results
              </Link>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-background border border-border rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">
                Upload Research Paper
              </h2>
              <UploadZone onAnalysisComplete={setCurrentJobId} isGuestMode={isGuestMode} />
            </div>

            {currentJobId && (
              <div className="bg-background border border-border rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Analysis in Progress
                </h2>
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-foreground" />
                    <p className="text-muted-foreground">
                      Processing your paper...
                    </p>
                    <Link
                      href={`/analysis/${currentJobId}`}
                      className="mt-4 inline-flex items-center font-medium hover:underline"
                    >
                      View Results →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <AnalysisList isGuestMode={isGuestMode} />
          </div>
        </div>
      </main>

      <Chatbot />
    </div>
  )
}
