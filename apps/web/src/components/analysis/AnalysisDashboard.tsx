'use client'

import { useEffect, useState } from 'react'
import { FileText, Brain, Lightbulb, DollarSign, Clock, AlertTriangle, CheckCircle, XCircle, Link, Upload } from 'lucide-react'
import { useAnalysis } from '@/hooks/useAnalysis'
import { formatCurrency, formatTime } from '@/lib/utils'
import { FormattedText, FormattedList, toTitleCase } from '@/components/ui/FormattedText'

interface AnalysisDashboardProps {
  jobId: string
}

export function AnalysisDashboard({ jobId }: AnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const { analysis, isLoading, error, fetchAnalysis } = useAnalysis(jobId)

  useEffect(() => {
    fetchAnalysis()
    const interval = setInterval(() => {
      if (analysis?.status !== 'complete') {
        fetchAnalysis()
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [jobId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading analysis...</p>
        </div>
      </div>
    )
  }

  if (error || analysis?.status === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3 text-red-600">
          <XCircle className="w-6 h-6" />
          <p className="font-medium">Analysis failed</p>
        </div>
        <p className="text-red-600 mt-2">
          {error || analysis?.error_message || 'Unknown error'}
        </p>
      </div>
    )
  }

  if (!analysis?.analysis) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-center gap-3 text-yellow-600">
          <Clock className="w-6 h-6" />
          <p className="font-medium">Analysis in progress</p>
        </div>
        <p className="text-yellow-600 mt-2">
          Your paper is being processed. This typically takes 30-60 seconds.
        </p>
      </div>
    )
  }

  const data = analysis.analysis
  const methodology = data.critique?.methodology || {}
  const dataset = data.critique?.dataset || {}
  const experiments = data.improvements?.experiments || []
  const grant = data.grant_outline || {}

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'critique', label: 'Critique' },
    { id: 'experiments', label: 'Experiments' },
    { id: 'grant', label: 'Grant' },
    { id: 'economics', label: 'Economics' },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="border-b">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {data.metadata?.title || 'Untitled Document'}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-gray-500">
                    Uploaded: {new Date(data.metadata?.upload_timestamp).toLocaleString()}
                  </p>
                  {data.metadata?.source_type === 'url' && (
                    <span className="inline-flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      <Link className="w-3 h-3" />
                      URL
                    </span>
                  )}
                  {data.metadata?.source_type === 'file_upload' && (
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      <Upload className="w-3 h-3" />
                      File Upload
                    </span>
                  )}
                </div>
                {data.metadata?.source_url && (
                  <p className="text-sm text-gray-400 mt-1 truncate max-w-xl" title={data.metadata.source_url}>
                    Source: {data.metadata.source_url}
                  </p>
                )}
              </div>

              {/* Analysis error (e.g. auth-walled URL) */}
              {data.error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-800">Analysis Issue</p>
                    <p className="text-red-700 text-sm mt-1">{data.error}</p>
                  </div>
                </div>
              )}

              {data.metadata?.abstract && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Abstract</h3>
                  <p className="text-gray-600">{data.metadata.abstract}</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Brain className="w-4 h-4" />
                    <span className="text-sm">Methodology Score</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {methodology.overall_score || 'N/A'}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Reproducibility</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 capitalize">
                    {methodology.reproducibility_rating || 'N/A'}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Cost</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    ${data.economics?.estimated_cost_usd?.toFixed(2) || '0.00'}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Time</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatTime(data.economics?.processing_time_seconds || 0)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'critique' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Methodology Critique
                </h3>

                {methodology.flaws?.length > 0 ? (
                  <div className="space-y-3">
                    {methodology.flaws.map((flaw: any, i: number) => (
                      <div
                        key={i}
                        className={`p-4 rounded-lg border ${
                          flaw.severity === 'critical'
                            ? 'bg-red-50 border-red-200'
                            : flaw.severity === 'warning'
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              flaw.severity === 'critical'
                                ? 'bg-red-600 text-white'
                                : flaw.severity === 'warning'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            {flaw.severity}
                          </span>
                          <span className="text-sm text-gray-600">
                            {toTitleCase(flaw.category)}
                          </span>
                        </div>
                        <FormattedText text={flaw.description} className="text-gray-800" />
                        {flaw.impact && (
                          <p className="text-sm text-gray-500 mt-1 italic">
                            Impact: {flaw.impact}
                          </p>
                        )}
                        {flaw.suggested_fix && (
                          <div className="text-sm text-gray-600 mt-2">
                            <strong>Suggested Fix:</strong>{' '}
                            <FormattedText text={flaw.suggested_fix} as="span" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No methodology flaws detected.</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Dataset Audit
                </h3>

                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Size Assessment:
                    </span>{' '}
                    <FormattedText text={dataset.size_assessment || 'Not assessed'} as="span" className="text-gray-900 capitalize" />
                  </div>

                  {dataset.bias_sources?.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Potential Bias Sources:
                      </span>
                      <FormattedList items={dataset.bias_sources} className="mt-1 text-gray-900" />
                    </div>
                  )}

                  {dataset.recommendations?.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Recommendations:
                      </span>
                      <FormattedList items={dataset.recommendations} className="mt-1 text-gray-900" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'experiments' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Proposed Experiments
              </h3>

              {experiments.length > 0 ? (
                <div className="space-y-4">
                  {experiments.map((exp: any, i: number) => (
                    <div
                      key={i}
                      className="p-4 border rounded-lg hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {i + 1}. {exp.title}
                          </h4>
                          <FormattedText text={exp.hypothesis} className="text-sm text-gray-600 mt-1" />
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-500">
                            Feasibility
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-bold text-gray-900">
                              {exp.feasibility_score}
                            </span>
                            <span className="text-gray-500">/10</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-gray-600">
                        <div>
                          <strong>Method:</strong>{' '}
                          <FormattedText text={exp.method} as="span" />
                        </div>
                        <div className="mt-1">
                          <strong>Expected:</strong>{' '}
                          <FormattedText text={exp.expected_outcome} as="span" />
                        </div>
                        <div className="mt-1">
                          <strong>Budget:</strong>{' '}
                          <FormattedText text={exp.estimated_budget} as="span" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No experiments proposed.</p>
              )}

              {data.improvements?.key_insights?.length > 0 && (
                <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                  <h4 className="font-medium text-indigo-900 mb-2">
                    Key Insights
                  </h4>
                  <FormattedList items={data.improvements.key_insights} className="text-indigo-800" />
                </div>
              )}
            </div>
          )}

          {activeTab === 'grant' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Grant Proposal Outline
              </h3>

              {grant.title ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {grant.title}
                    </h4>
                  </div>

                  {grant.specific_aims?.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">
                        Specific Aims
                      </h5>
                      <FormattedList items={grant.specific_aims} className="text-gray-700" ordered />
                    </div>
                  )}

                  {grant.research_strategy && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">
                        Research Strategy
                      </h5>
                      <FormattedText text={grant.research_strategy} className="text-gray-700" />
                    </div>
                  )}

                  {grant.expected_outcomes && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">
                        Expected Outcomes
                      </h5>
                      <FormattedText text={grant.expected_outcomes} className="text-gray-700" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {grant.timeline && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Timeline</span>
                        <p className="font-medium text-gray-900">
                          {grant.timeline}
                        </p>
                      </div>
                    )}

                    {grant.budget_estimate && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Budget</span>
                        <p className="font-medium text-gray-900">
                          {grant.budget_estimate}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">
                  Grant outline not generated. Enable grant generation in options.
                </p>
              )}
            </div>
          )}

          {activeTab === 'economics' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Cost Breakdown
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Total Cost</span>
                  <p className="text-2xl font-bold text-gray-900">
                    ${data.economics?.estimated_cost_usd?.toFixed(2) || '0.00'}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Processing Time</span>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatTime(data.economics?.processing_time_seconds || 0)}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Tokens Used</span>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.economics?.total_tokens_used?.toLocaleString() || '0'}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Cache Hits</span>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.economics?.cache_hits || 0}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  This analysis cost approximately $
                  {data.economics?.estimated_cost_usd?.toFixed(2) || '0.82'}{' '}
                  - well under the $15 budget. You can analyze approximately{' '}
                  {Math.floor(15 / (data.economics?.estimated_cost_usd || 0.82))}{' '}
                  more papers with the remaining budget.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
