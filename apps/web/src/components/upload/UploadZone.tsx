'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, AlertCircle } from 'lucide-react'
import { useUpload } from '@/hooks/useAnalysis'
import { cn } from '@/lib/utils'

interface UploadZoneProps {
  onAnalysisComplete?: (jobId: string) => void
  isGuestMode?: boolean
}

export function UploadZone({ onAnalysisComplete, isGuestMode = false }: UploadZoneProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const { uploadFile, isUploading, error } = useUpload()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setUploadProgress(10)

      try {
        const result = await uploadFile(file)
        setUploadProgress(100)
        onAnalysisComplete?.(result.job_id)
      } catch (err) {
        console.error('Upload error:', err)
      }
    },
    [uploadFile, onAnalysisComplete]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
    disabled: isUploading,
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-gray-400',
          isUploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          {isUploading ? (
            <>
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-600">Uploading and processing...</p>
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mt-4">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-indigo-600" />
              </div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop your paper here' : 'Drag & drop your PDF'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or click to browse (max 20MB)
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="text-sm text-gray-500">
        <p className="font-medium mb-1">Estimated costs:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>OCR processing: ~$0.05</li>
          <li>Vision analysis: ~$0.02</li>
          <li>AI critique: ~$0.75</li>
          <li className="font-medium text-indigo-600">Total: ~$0.82 per paper</li>
        </ul>
      </div>
    </div>
  )
}
