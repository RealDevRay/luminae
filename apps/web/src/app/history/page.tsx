'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  FileText, 
  Clock, 
  ArrowRight, 
  Search, 
  Filter,
  MoreVertical,
  Trash2,
  Download,
  Loader2,
  Brain,
  DollarSign,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { formatDate, truncate } from '@/lib/utils'

interface Analysis {
  id: string
  filename: string
  title: string | null
  status: string
  total_cost_usd: number
  created_at: string
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'complete' | 'error'>('all')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchAnalyses()
    }
  }, [user])

  const fetchAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('papers')
        .select('id, filename, title, status, total_cost_usd, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAnalyses(data || [])
    } catch (err) {
      console.error('Error fetching analyses:', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteAnalysis = async (id: string) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return
    
    try {
      const { error } = await supabase
        .from('papers')
        .delete()
        .eq('id', id)

      if (error) throw error
      setAnalyses(analyses.filter(a => a.id !== id))
    } catch (err) {
      console.error('Error deleting analysis:', err)
    }
  }

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (analysis.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    
    if (filter === 'all') return matchesSearch
    return matchesSearch && analysis.status === filter
  })

  const totalCost = analyses.reduce((sum, a) => sum + a.total_cost_usd, 0)

  if (authLoading || loading) {
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
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                ← Back
              </Link>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-semibold">Analysis History</h1>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              New Analysis
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <div className="p-6 border border-border rounded-2xl bg-background">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Analyses</span>
            </div>
            <p className="text-3xl font-bold">{analyses.length}</p>
          </div>
          <div className="p-6 border border-border rounded-2xl bg-background">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Cost</span>
            </div>
            <p className="text-3xl font-bold">${totalCost.toFixed(2)}</p>
          </div>
          <div className="p-6 border border-border rounded-2xl bg-background">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg. Score</span>
            </div>
            <p className="text-3xl font-bold">--</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search analyses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'complete', 'error'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-foreground text-background'
                    : 'border border-input hover:bg-muted'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredAnalyses.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No analyses found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || filter !== 'all'
                ? 'Try adjusting your search or filter'
                : 'Start by analyzing your first research paper'}
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAnalyses.map((analysis) => (
              <div
                key={analysis.id}
                className="flex items-center gap-4 p-4 border border-border rounded-xl hover:border-foreground/20 transition-colors bg-background"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  analysis.status === 'complete' 
                    ? 'bg-green-500/10 text-green-600' 
                    : analysis.status === 'error'
                    ? 'bg-red-500/10 text-red-600'
                    : 'bg-yellow-500/10 text-yellow-600'
                }`}>
                  {analysis.status === 'complete' ? (
                    <FileText className="w-5 h-5" />
                  ) : analysis.status === 'error' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {analysis.title || analysis.filename}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(analysis.created_at)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium">${analysis.total_cost_usd.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {analysis.status}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {analysis.status === 'complete' && (
                    <Link
                      href={`/analysis/${analysis.id}`}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                  <button
                    onClick={() => deleteAnalysis(analysis.id)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
