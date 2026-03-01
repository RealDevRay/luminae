import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AnalysisState {
  currentJobId: string | null
  status: string | null
  progress: number
  analyses: Record<string, any>
  
  setCurrentJob: (jobId: string) => void
  setStatus: (status: string) => void
  setProgress: (progress: number) => void
  saveAnalysis: (jobId: string, analysis: any) => void
  clearCurrentJob: () => void
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set) => ({
      currentJobId: null,
      status: null,
      progress: 0,
      analyses: {},

      setCurrentJob: (jobId) =>
        set({ currentJobId: jobId, status: 'processing', progress: 0 }),

      setStatus: (status) => set({ status }),

      setProgress: (progress) => set({ progress }),

      saveAnalysis: (jobId, analysis) =>
        set((state) => ({
          analyses: { ...state.analyses, [jobId]: analysis },
          status: 'complete',
          progress: 100,
        })),

      clearCurrentJob: () =>
        set({ currentJobId: null, status: null, progress: 0 }),
    }),
    {
      name: 'luminae-analyses',
    }
  )
)
