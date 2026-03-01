'use client'

import Link from 'next/link'
import { FileText, Clock, ArrowRight, Trash2 } from 'lucide-react'
import { useAnalysisStore } from '@/stores/analysisStore'
import { formatDate, truncate } from '@/lib/utils'

interface AnalysisListProps {
  isGuestMode?: boolean
}

export function AnalysisList({ isGuestMode = false }: AnalysisListProps) {
  const { analyses, clearAnalyses } = useAnalysisStore()
  const analysisList = Object.entries(analyses)

  // Don't render the history panel at all for guests
  if (isGuestMode) return null

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Analyses
        </h2>
        {analysisList.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Clear all analysis history?')) {
                clearAnalyses()
              }
            }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-md hover:bg-red-50"
            title="Clear all analyses"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

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
          {analysisList.slice(-5).reverse().map(([jobId, analysis]) => (
            <Link
              key={jobId}
              href={`/analysis/${jobId}`}
              className="block p-3 rounded-lg border hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">
                    {analysis.metadata?.title || 'Untitled'}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(analysis.metadata?.upload_timestamp)}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>

              {analysis.economics && (
                <div className="mt-2 text-xs text-gray-500">
                  Cost: ${analysis.economics.estimated_cost_usd?.toFixed(2) || '0.00'} •{' '}
                  {analysis.economics.processing_time_seconds}s
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {analysisList.length > 5 && (
        <Link
          href="/history"
          className="block text-center text-sm text-indigo-600 hover:text-indigo-700 mt-4"
        >
          View all analyses →
        </Link>
      )}
    </div>
  )
}
