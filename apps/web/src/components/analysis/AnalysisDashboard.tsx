'use client'

import { useEffect, useState } from 'react'
import { FileText, Brain, Lightbulb, DollarSign, Clock, AlertTriangle, CheckCircle, XCircle, Link, Upload, Download, Printer, FileDown, Code } from 'lucide-react'
import { useAnalysis } from '@/hooks/useAnalysis'
import { formatCurrency, formatTime } from '@/lib/utils'
import { FormattedText, FormattedList, toTitleCase } from '@/components/ui/FormattedText'
import { OverviewTab } from './tabs/OverviewTab'
import { CritiqueTab } from './tabs/CritiqueTab'
import { ExperimentsTab } from './tabs/ExperimentsTab'
import { GrantTab } from './tabs/GrantTab'
import { ReferencesTab } from './tabs/ReferencesTab'
import { EconomicsTab } from './tabs/EconomicsTab'
import { ComparisonTab } from './tabs/ComparisonTab'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface AnalysisDashboardProps {
  jobId: string
}

export function AnalysisDashboard({ jobId }: AnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [numPages, setNumPages] = useState<number>()
  const [pageNumber, setPageNumber] = useState<number>(1)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const { analysis, isLoading, error, connectSSE, retry } = useAnalysis(jobId)

  useEffect(() => {
    const cleanup = connectSSE()
    return () => {
      if (cleanup) cleanup()
    }
  }, [connectSSE])

  // Must be before early returns to maintain consistent hook ordering
  const isComparison = !!analysis?.analysis?.comparison
  useEffect(() => {
    if (isComparison && activeTab === 'overview') {
      setActiveTab('comparison')
    }
  }, [isComparison, activeTab])


  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="border-b px-6 py-4">
            <div className="flex space-x-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 w-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <div className="h-8 w-3/4 bg-gray-200 rounded mb-4"></div>
              <div className="flex gap-3">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded-full"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-lg p-4">
                  <div className="h-4 w-1/2 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 w-1/3 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || analysis?.status === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3 text-red-600">
          <XCircle className="w-6 h-6" />
          <p className="font-medium">Analysis issue</p>
        </div>
        <p className="text-red-600 mt-2">
          {error || analysis?.error_message || 'Unknown error'}
        </p>
        <button
          onClick={retry}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!analysis?.analysis) {
    const status = analysis?.status || 'processing_ocr'
    const steps = [
      { id: 'processing_ocr', label: 'Extracting Text', description: 'OCR processing with Mistral' },
      { id: 'processing_vision', label: 'Analyzing Figures', description: 'Vision analysis of images' },
      { id: 'analyzing', label: 'AI Agents Working', description: '5 agents analyzing in parallel' },
      { id: 'complete', label: 'Complete', description: 'Results ready' },
    ]
    const currentStepIdx = steps.findIndex(s => s.id === status)

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Processing your document...</p>
            <p className="text-sm text-gray-500">This may take 1–3 minutes depending on document size</p>
          </div>
        </div>

        <div className="space-y-3">
          {steps.map((step, i) => {
            const isActive = i === currentStepIdx
            const isDone = i < currentStepIdx
            const isPending = i > currentStepIdx

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-indigo-50 border border-indigo-200' :
                  isDone ? 'bg-green-50 border border-green-200' :
                  'bg-gray-50 border border-gray-100'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isActive ? 'bg-indigo-600' :
                  isDone ? 'bg-green-600' :
                  'bg-gray-300'
                }`}>
                  {isDone ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : isActive ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="text-xs font-bold text-white">{i + 1}</span>
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${
                    isActive ? 'text-primary' :
                    isDone ? 'text-green-800' :
                    'text-muted-foreground'
                  }`}>{step.label}</p>
                  <p className={`text-xs ${
                    isActive ? 'text-primary/80' :
                    isDone ? 'text-green-600' :
                    'text-muted-foreground/80'
                  }`}>{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const data = analysis.analysis
  const methodology = data.critique?.methodology || {}
  const dataset = data.critique?.dataset || {}
  const experiments = data.improvements?.experiments || []
  const grant = data.grant_outline || {}

  const tabs = isComparison
    ? [
        { id: 'comparison', label: 'Comparison Matrix' },
        { id: 'economics', label: 'Economics' },
      ]
    : [
        { id: 'overview', label: 'Overview' },
        { id: 'critique', label: 'Critique' },
        { id: 'experiments', label: 'Experiments' },
        { id: 'grant', label: 'Grant' },
        { id: 'references', label: 'References' },
        { id: 'economics', label: 'Economics' },
      ]


  const getReportMarkdown = () => {
    const title = data.metadata?.title || 'Untitled Document'
    const flaws = methodology.flaws || []
    const expList = experiments || []

    let md = `# Luminae Analysis Report\n\n`
    md += `**Document:** ${title}\n`
    md += `**Analyzed:** ${new Date(data.metadata?.upload_timestamp).toLocaleString()}\n`
    if (data.metadata?.source_url) md += `**Source URL:** ${data.metadata.source_url}\n`
    md += `\n---\n\n`

    // Abstract
    if (data.metadata?.abstract) {
      md += `## Abstract\n\n${data.metadata.abstract}\n\n`
    }

    // Methodology Critique
    md += `## Methodology Critique\n\n`
    md += `**Overall Score:** ${methodology.overall_score || 'N/A'}/100\n`
    md += `**Reproducibility:** ${methodology.reproducibility_rating || 'N/A'}\n\n`
    if (flaws.length > 0) {
      md += `### Issues Found\n\n`
      flaws.forEach((f: any, i: number) => {
        md += `${i + 1}. **[${(f.severity || 'note').toUpperCase()}]** ${f.description || ''}\n`
        if (f.suggested_fix) md += `   - **Fix:** ${f.suggested_fix}\n`
        md += `\n`
      })
    }

    // Dataset Audit
    if (dataset && Object.keys(dataset).length > 0) {
      md += `## Dataset Audit\n\n`
      if (dataset.size_assessment) md += `**Size Assessment:** ${dataset.size_assessment}\n`
      if (dataset.bias_sources?.length) md += `**Bias Sources:** ${dataset.bias_sources.join(', ')}\n`
      if (dataset.recommendations?.length) {
        md += `\n### Recommendations\n\n`
        dataset.recommendations.forEach((r: string) => { md += `- ${r}\n` })
      }
      md += `\n`
    }

    // Experiments
    if (expList.length > 0) {
      md += `## Proposed Experiments\n\n`
      expList.forEach((exp: any, i: number) => {
        md += `### ${i + 1}. ${exp.title || 'Experiment'}\n\n`
        if (exp.hypothesis) md += `**Hypothesis:** ${exp.hypothesis}\n`
        if (exp.method) md += `**Method:** ${exp.method}\n`
        if (exp.expected_outcome) md += `**Expected Outcome:** ${exp.expected_outcome}\n`
        if (exp.feasibility_score) md += `**Feasibility:** ${exp.feasibility_score}/10\n`
        if (exp.estimated_budget) md += `**Budget:** ${exp.estimated_budget}\n`
        md += `\n`
      })
    }

    // Grant Outline
    if (grant && Object.keys(grant).length > 0) {
      md += `## Grant Outline\n\n`
      if (grant.title) md += `**Title:** ${grant.title}\n\n`
      if (grant.specific_aims?.length) {
        md += `### Specific Aims\n\n`
        grant.specific_aims.forEach((aim: string) => { md += `- ${aim}\n` })
        md += `\n`
      }
      if (grant.research_strategy) md += `### Research Strategy\n\n${grant.research_strategy}\n\n`
      if (grant.timeline) md += `### Timeline\n\n${grant.timeline}\n\n`
    }

    // Economics
    md += `## Cost Breakdown\n\n`
    md += `- **Estimated Cost:** $${data.economics?.estimated_cost_usd?.toFixed(2) || '0.00'}\n`
    md += `- **Processing Time:** ${data.economics?.processing_time_seconds || 0}s\n`
    md += `- **Cache Hits:** ${data.economics?.cache_hits || 0}\n\n`

    md += `---\n\n*Generated by Luminae — Built by Aletheia Labs for the Mistral Worldwide Hackathon 2026*\n`
    return md
  }

  const mdToHtml = (md: string) => {
    let html = md
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/gim, '<br><br>')
      .replace(/\n/gim, '<br>')
      .replace(/<br><li>/gim, '<li>')
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Luminae Report</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #111827; max-width: 800px; margin: 0 auto; padding: 2rem; }
          h1, h2, h3 { color: #111827; font-weight: 600; margin-top: 1.5em; margin-bottom: 0.5em; }
          h1 { font-size: 2.25rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
          h2 { font-size: 1.5rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; }
          h3 { font-size: 1.25rem; }
          strong { font-weight: 600; }
          li { margin-bottom: 0.25rem; margin-left: 1.5rem; list-style-type: disc; }
          br { display: block; content: ""; margin-top: 0.5rem; }
          @media print {
            body { max-width: 100%; padding: 0; }
            @page { margin: 2cm; }
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `
  }

  const exportMarkdown = () => {
    const md = getReportMarkdown()
    const title = data.metadata?.title || 'Untitled Document'
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `luminae-report-${title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40)}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportHtml = () => {
    const md = getReportMarkdown()
    const html = mdToHtml(md)
    const title = data.metadata?.title || 'Untitled Document'
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `luminae-report-${title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40)}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const printPdf = () => {
    const md = getReportMarkdown()
    const html = mdToHtml(md)
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  }

  const pdfUrl = data.metadata?.source_type === 'url' && data.metadata?.source_url 
    ? data.metadata.source_url 
    : `${API_URL}/api/v1/pdf/${jobId}`

  const hasPdf = !isComparison && (data.metadata?.source_type === 'file_upload' || data.metadata?.source_url)

  return (
    <div className={`space-y-6 ${hasPdf ? 'xl:grid xl:grid-cols-2 xl:gap-6 xl:space-y-0 xl:h-[calc(100vh-120px)]' : ''}`}>
      
      {/* Side-by-Side PDF Viewer Panel */}
      {hasPdf && (
        <div className="hidden xl:flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden h-full">
          <div className="border-b px-4 py-3 bg-muted/50 flex justify-between items-center shrink-0">
            <span className="font-medium text-sm text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Source Document
            </span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <button 
                 disabled={pageNumber <= 1} 
                 onClick={() => setPageNumber(p => p - 1)}
                 className="px-2 hover:text-foreground disabled:opacity-50"
              >
                Previous
              </button>
              <span>Page {pageNumber} of {numPages || '--'}</span>
              <button 
                 disabled={pageNumber >= (numPages || 1)} 
                 onClick={() => setPageNumber(p => p + 1)}
                 className="px-2 hover:text-foreground disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-gray-100 flex justify-center py-4 relative">
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              className="max-w-full"
              loading={
                <div className="flex h-full items-center justify-center text-muted-foreground">
                   <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                   Loading PDF...
                </div>
              }
              error={
                <div className="text-muted-foreground p-4 text-center">
                   <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                   Unable to load PDF. It may have expired from cache or blocked by CORS.
                </div>
              }
            >
              <Page 
                 pageNumber={pageNumber} 
                 width={600}
                 renderTextLayer={true}
                 renderAnnotationLayer={true}
                 className="shadow-lg bg-white"
              />
            </Document>
          </div>
        </div>
      )}

      {/* Analysis Panel */}
      <div className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col ${hasPdf ? 'h-full' : ''}`}>
        <div className="border-b overflow-x-auto scrollbar-hide shrink-0">
          <nav className="flex -mb-px min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-4 sm:px-6 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Export button bar */}
        <div className="flex items-center justify-end px-6 pt-4 gap-2 border-b pb-4 bg-gray-50/50">
          <span className="text-sm text-gray-500 mr-2">Export Report:</span>
          <button
            onClick={exportMarkdown}
            title="Download formatted Markdown"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            .MD
          </button>
          <button
            onClick={exportHtml}
            title="Download pure HTML Document"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
            .HTML
          </button>
          <button
            onClick={printPdf}
            title="Print to PDF via Browser"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            .PDF
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'comparison' && <ComparisonTab comparison={data.comparison} metadata={data.metadata} />}
          {activeTab === 'overview' && <OverviewTab data={data} methodology={methodology} />}
          {activeTab === 'critique' && <CritiqueTab methodology={methodology} dataset={dataset} />}
          {activeTab === 'experiments' && <ExperimentsTab experiments={experiments} keyInsights={data.improvements?.key_insights} />}
          {activeTab === 'grant' && <GrantTab grant={grant} />}
          {activeTab === 'references' && <ReferencesTab references={data.references || []} />}
          {activeTab === 'economics' && <EconomicsTab economics={data.economics} />}
        </div>
      </div>
    </div>
  )
}
