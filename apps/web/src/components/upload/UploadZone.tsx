'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Link, AlertCircle, FileText, Image } from 'lucide-react'
import { useUpload, useUploadUrl } from '@/hooks/useAnalysis'
import { cn } from '@/lib/utils'

interface UploadZoneProps {
  onAnalysisComplete?: (jobId: string) => void
  isGuestMode?: boolean
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/avif': ['.avif'],
  'image/webp': ['.webp'],
}

export function UploadZone({ onAnalysisComplete, isGuestMode = false }: UploadZoneProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [urlInput, setUrlInput] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)
  const { uploadFile, isUploading, error } = useUpload()
  const { uploadUrl, isUploading: isUrlUploading, error: urlUploadError } = useUploadUrl()

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

  const handleUrlSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setUrlError(null)

      const trimmedUrl = urlInput.trim()
      if (!trimmedUrl) {
        setUrlError('Please enter a document URL')
        return
      }

      try {
        new URL(trimmedUrl)
      } catch {
        setUrlError('Please enter a valid URL')
        return
      }

      try {
        // Extract filename from URL
        const urlPath = new URL(trimmedUrl).pathname
        const filename = urlPath.split('/').pop() || 'document'

        const result = await uploadUrl(trimmedUrl, filename)
        onAnalysisComplete?.(result.job_id)
        setUrlInput('')
      } catch (err) {
        console.error('URL analysis error:', err)
      }
    },
    [urlInput, uploadUrl, onAnalysisComplete]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
    disabled: isUploading,
  })

  const isProcessing = isUploading || isUrlUploading
  const displayError = error || urlUploadError || urlError

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setActiveTab('upload')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors',
            activeTab === 'upload'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <Upload className="w-4 h-4" />
          Upload File
        </button>
        <button
          onClick={() => setActiveTab('url')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors',
            activeTab === 'url'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <Link className="w-4 h-4" />
          Paste URL
        </button>
      </div>

      {/* Upload tab */}
      {activeTab === 'upload' && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-gray-400',
            isProcessing && 'opacity-50 cursor-not-allowed'
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
                  {isDragActive ? 'Drop your document here' : 'Drag & drop your document'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to browse (max 20MB)
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                  <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    <FileText className="w-3 h-3" /> PDF
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    <FileText className="w-3 h-3" /> DOCX
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    <FileText className="w-3 h-3" /> PPTX
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    <Image className="w-3 h-3" /> PNG / JPG
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* URL tab */}
      {activeTab === 'url' && (
        <form onSubmit={handleUrlSubmit} className="space-y-3">
          <div className="border-2 border-dashed rounded-xl p-6 transition-colors border-gray-300">
            <div className="flex flex-col items-center mb-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Link className="w-8 h-8 text-indigo-600" />
              </div>
              <p className="text-lg font-medium text-gray-900">
                Paste a document URL
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Supports public PDFs, DOCX, PPTX, and image URLs
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value)
                  setUrlError(null)
                }}
                placeholder="https://arxiv.org/pdf/2201.04234"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                disabled={isUrlUploading}
              />
              <button
                type="submit"
                disabled={isUrlUploading || !urlInput.trim()}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium whitespace-nowrap"
              >
                {isUrlUploading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  'Analyze'
                )}
              </button>
            </div>

            <div className="flex items-start gap-2 mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                URL must be <strong>publicly accessible</strong>. Links behind login pages (e.g. Moodle, private Google Drive) will not work — upload the file directly instead.
              </p>
            </div>
          </div>
        </form>
      )}

      {displayError && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{displayError}</p>
        </div>
      )}

      <div className="text-sm text-gray-500">
        <p className="font-medium mb-1">Estimated costs:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>OCR processing: ~$0.01</li>
          <li>Vision analysis: ~$0.01</li>
          <li>AI critique: ~$0.03</li>
          <li className="font-medium text-indigo-600">Total: ~$0.05 per document</li>
        </ul>
      </div>
    </div>
  )
}
