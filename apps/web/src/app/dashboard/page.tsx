'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UploadZone } from '@/components/upload/UploadZone'
import { BudgetCard } from '@/components/upload/BudgetCard'
import { AnalysisList } from '@/components/analysis/AnalysisList'
import dynamic from 'next/dynamic'
const AnalysisDashboard = dynamic(() => import('@/components/analysis/AnalysisDashboard').then(mod => mod.AnalysisDashboard), { ssr: false })
import { Chatbot } from '@/components/chatbot/Chatbot'
import { Brain, ArrowLeft, History, Loader2, User, AlertTriangle, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const { user, loading, signOut } = useAuth()
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
              {user ? (
                <div className="flex items-center gap-3 bg-secondary/50 pl-3 pr-2 py-1.5 rounded-full border border-border">
                  <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium mr-2 max-w-[120px] truncate hidden sm:inline-block">
                    {user.email}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="flex items-center gap-2 px-3 py-2 bg-foreground text-background rounded-lg text-sm font-medium"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
              )}
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
        {!currentJobId ? (
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-background border border-border rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 text-center text-foreground">
                Upload Document for Analysis
              </h2>
              <UploadZone onAnalysisComplete={setCurrentJobId} isGuestMode={isGuestMode} />
            </div>
            
            {!isGuestMode && (
              <div className="w-full">
                <AnalysisList isGuestMode={isGuestMode} />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row gap-8 animate-in fade-in duration-500">
            {/* Left/Main Column - Analysis Results (Wider) */}
            <div className="flex-1 min-w-0">
              <div className="bg-background border border-border rounded-2xl p-6 shadow-sm">
                <AnalysisDashboard jobId={currentJobId} />
              </div>
            </div>

            {/* Right Sidebar - Upload New & History (Sticky) */}
            <div className="xl:w-[400px] flex-shrink-0 space-y-6">
              <div className="bg-background border border-border rounded-2xl p-6 shadow-sm sticky top-24">
                <h2 className="text-lg font-semibold mb-4 text-foreground">
                  Analyze Another Document
                </h2>
                <div className="scale-95 origin-top">
                  <UploadZone onAnalysisComplete={setCurrentJobId} isGuestMode={isGuestMode} />
                </div>
                
                {!isGuestMode && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <AnalysisList isGuestMode={isGuestMode} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Chatbot />

      <footer className="border-t mt-8 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-center text-muted-foreground">
            Built by <strong>Aletheia Labs</strong> for the <strong>Mistral Worldwide Hackathon 2026</strong> • Powered by Mistral AI
          </p>
          <div className="flex justify-center items-center space-x-4 mt-2 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
