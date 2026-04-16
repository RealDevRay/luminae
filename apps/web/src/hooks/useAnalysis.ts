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
      const bytes = new Uint8Array(arrayBuffer)
      // Use base64 encoding (33% overhead) instead of hex (100% overhead)
      let binary = ''
      const chunkSize = 8192
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
      }
      const base64 = btoa(binary)

      const response = await apiClient.analyze(base64, file.name, {
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

export function useUploadUrl() {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setCurrentJob, setStatus } = useAnalysisStore()

  const uploadUrl = useCallback(async (url: string, filename: string) => {
    setIsUploading(true)
    setError(null)

    try {
      const response = await apiClient.analyzeUrl(url, filename, {
        extract_figures: true,
        generate_grant: true,
      })

      setCurrentJob(response.job_id)
      setStatus('processing_ocr')

      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'URL analysis failed'
      setError(message)
      throw err
    } finally {
      setIsUploading(false)
    }
  }, [setCurrentJob, setStatus])

  return { uploadUrl, isUploading, error }
}

export function useCompare() {
  const [isComparing, setIsComparing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setCurrentJob, setStatus } = useAnalysisStore()

  const compareJobs = useCallback(async (jobIds: string[]) => {
    setIsComparing(true)
    setError(null)

    try {
      const response = await apiClient.compare(jobIds)
      setCurrentJob(response.job_id)
      setStatus('synthesizing')
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Comparison failed'
      setError(message)
      throw err
    } finally {
      setIsComparing(false)
    }
  }, [setCurrentJob, setStatus])

  return { compareJobs, isComparing, error }
}

export function useAnalysis(jobId: string) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisJob | null>(null)
  const { saveAnalysis } = useAnalysisStore()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const connectSSE = useCallback(() => {
    if (!jobId) return

    setIsLoading(true)
    setError(null)

    const eventSource = new EventSource(`${API_URL}/api/v1/stream/${jobId}`)

    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.error) {
          setError(data.error)
          setIsLoading(false)
          eventSource.close()
          return
        }

        setAnalysis(data)
        setIsLoading(false)

        if (data.status === 'complete') {
          try {
             // Fetch full populated results from the normal endpoint since SSE might only have metadata
             const fullResponse = await apiClient.getResults(jobId)
             setAnalysis(fullResponse)
             if (fullResponse.analysis) {
               saveAnalysis(jobId, fullResponse.analysis)
             }
          } catch (e) {
             console.error("Failed to fetch full results after stream completion", e)
             if (data.analysis) {
               saveAnalysis(jobId, data.analysis)
             }
          }
          eventSource.close()
        }

        if (data.status === 'error') {
          setError(data.error_message || 'Analysis failed')
          eventSource.close()
        }
      } catch (err) {
        console.error('Failed to parse SSE message', err)
      }
    }

    eventSource.onerror = () => {
      // Reconnect handled automatically by EventSource, but update UI
      eventSource.close()
      // Fallback to fetch Results directly if SSE drops
      apiClient.getResults(jobId).then(res => {
        setAnalysis(res)
        setIsLoading(false)
        if (res.status === 'complete' && res.analysis) {
           saveAnalysis(jobId, res.analysis)
        }
      }).catch(err => {
        setError('Connection lost. The server may be restarting — click Retry.')
        setIsLoading(false)
      })
    }

    return () => {
      eventSource.close()
    }
  }, [jobId, saveAnalysis, API_URL])

  const fetchAnalysis = useCallback(async () => {
     // fallback for manual retry
     if (!jobId) return
     try {
       setIsLoading(true)
       const res = await apiClient.getResults(jobId)
       setAnalysis(res)
       if (res.status === 'complete' && res.analysis) saveAnalysis(jobId, res.analysis)
     } catch (err) {
       setError('Failed to fetch analysis')
     } finally {
       setIsLoading(false)
     }
  }, [jobId, saveAnalysis])

  const retry = useCallback(() => {
    setError(null)
    setIsLoading(true)
    connectSSE()
  }, [connectSSE])

  return { analysis, isLoading, error, connectSSE, fetchAnalysis, retry }
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
