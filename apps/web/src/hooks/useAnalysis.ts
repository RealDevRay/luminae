import { useState, useCallback } from 'react'
import { apiClient, AnalysisJob } from '@/lib/api-client'
import { useAnalysisStore } from '@/stores/analysisStore'

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setCurrentJob, setStatus } = useAnalysisStore()

  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const bytes = Array.from(new Uint8Array(arrayBuffer))
      const hex = bytes.map(b => b.toString(16).padStart(2, '0')).join('')

      const response = await apiClient.analyze(hex, file.name, {
        extract_figures: true,
        generate_grant: true,
      })

      setCurrentJob(response.job_id)
      setStatus('processing_ocr')

      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
      throw err
    } finally {
      setIsUploading(false)
    }
  }, [setCurrentJob, setStatus])

  return { uploadFile, isUploading, error }
}

export function useAnalysis(jobId: string) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisJob | null>(null)
  const { saveAnalysis } = useAnalysisStore()

  const fetchAnalysis = useCallback(async () => {
    if (!jobId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.getResults(jobId)
      setAnalysis(response)

      if (response.status === 'complete' && response.analysis) {
        saveAnalysis(jobId, response.analysis)
      }

      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch analysis'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [jobId, saveAnalysis])

  return { analysis, isLoading, error, fetchAnalysis }
}

export function useBudget() {
  const [budget, setBudget] = useState<{
    remaining: number
    total: number
    papersRemaining: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchBudget = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await apiClient.getBudget()
      setBudget({
        remaining: data.remaining_usd,
        total: data.total_budget_usd,
        papersRemaining: data.papers_remaining,
      })
    } catch (err) {
      // Silently fail if Render backend is sleeping to prevent console spam
      // The component handles undefined budget states gracefully
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { budget, isLoading, fetchBudget }
}
