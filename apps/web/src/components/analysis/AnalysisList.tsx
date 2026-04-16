import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FileText, Clock, ArrowRight, Trash2, SplitSquareHorizontal, CheckCircle2, Circle } from 'lucide-react'
import { useAnalysisStore } from '@/stores/analysisStore'
import { useCompare } from '@/hooks/useAnalysis'
import { formatDate, truncate } from '@/lib/utils'

interface AnalysisListProps {
  isGuestMode?: boolean
}

export function AnalysisList({ isGuestMode = false }: AnalysisListProps) {
  const { analyses, clearAnalyses } = useAnalysisStore()
  const { compareJobs, isComparing } = useCompare()
  const router = useRouter()
  
  const [isCompareMode, setIsCompareMode] = useState(false)
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set())

  const analysisList = Object.entries(analyses).filter(([_, a]) => a.metadata?.title !== 'Multi-Paper Comparison')

  // Don't render the history panel at all for guests
  if (isGuestMode) return null

  const handleToggleCompare = () => {
    setIsCompareMode(!isCompareMode)
    setSelectedJobs(new Set())
  }

  const toggleJobSelection = (jobId: string) => {
    const newSet = new Set(selectedJobs)
    if (newSet.has(jobId)) {
      newSet.delete(jobId)
    } else {
      if (newSet.size < 5) {
        newSet.add(jobId)
      } else {
        alert("You can compare up to 5 papers at once.")
      }
    }
    setSelectedJobs(newSet)
  }

  const handleCompareSubmit = async () => {
    if (selectedJobs.size < 2) return
    try {
      const response = await compareJobs(Array.from(selectedJobs))
      router.push(`/analysis/${response.job_id}`)
    } catch (err) {
      alert("Failed to start comparison.")
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Analyses
        </h2>
        <div className="flex items-center gap-2">
          {analysisList.length > 1 && (
            <button
              onClick={handleToggleCompare}
              className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors ${
                isCompareMode 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              title="Compare multiple papers"
            >
              <SplitSquareHorizontal className="w-3.5 h-3.5" />
              {isCompareMode ? 'Cancel' : 'Compare'}
            </button>
          )}
          {analysisList.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Clear all analysis history?')) {
                  clearAnalyses()
                }
              }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-md hover:bg-destructive/10"
              title="Clear all analyses"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {isCompareMode && (
        <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <p className="text-sm text-foreground">
            Select 2-5 papers to compare ({selectedJobs.size} selected)
          </p>
          <button
            onClick={handleCompareSubmit}
            disabled={selectedJobs.size < 2 || isComparing}
            className="px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-sm"
          >
            {isComparing ? 'Synthesizing...' : 'Compare Selected'}
          </button>
        </div>
      )}

      {analysisList.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No analyses yet</p>
          <p className="text-sm text-gray-400">
            Upload a document to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {analysisList.slice(-5).reverse().map(([jobId, analysis]) => {
            const isSelected = selectedJobs.has(jobId)
            const CardWrapper = isCompareMode ? 'div' : Link
            const wrapperProps = isCompareMode 
              ? {
                  onClick: () => toggleJobSelection(jobId),
                  className: `block p-3 rounded-lg border text-left cursor-pointer transition-colors ${
                    isSelected 
                      ? 'border-primary ring-1 ring-primary bg-primary/5' 
                      : 'border-border hover:border-primary/30 hover:bg-muted/50 bg-card'
                  }`
                }
              : {
                  href: `/analysis/${jobId}`,
                  className: "block p-3 rounded-lg border hover:border-primary/30 hover:bg-muted/50 transition-colors bg-card"
                }

            return (
              <CardWrapper key={jobId} {...(wrapperProps as any)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {isCompareMode && (
                      <div className="mt-0.5 flex-shrink-0 text-primary">
                        {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4 text-muted-foreground/30" />}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {analysis.metadata?.title || 'Untitled'}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(analysis.metadata?.upload_timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  {!isCompareMode && <ArrowRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />}
                </div>

                {analysis.economics && (
                  <div className={`mt-2 text-xs text-muted-foreground ${isCompareMode ? 'pl-7' : ''}`}>
                    Cost: ${analysis.economics.estimated_cost_usd?.toFixed(2) || '0.00'} •{' '}
                    {analysis.economics.processing_time_seconds}s
                  </div>
                )}
              </CardWrapper>
            )
          })}
        </div>
      )}

      {analysisList.length > 5 && (
        <Link
          href="/history"
          className="block text-center text-sm text-primary hover:text-primary/80 font-medium mt-4"
        >
          View all analyses →
        </Link>
      )}
    </div>
  )
}
