import { useState, useRef } from 'react'
import { Upload as UploadIcon, FileText, X, AlertCircle, CheckCircle } from 'lucide-react'
import { documentsApi } from '../services/api'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.docx', '.txt']

interface FileStatus {
  file: File
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

function validateFile(file: File): string | null {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `Unsupported file type: ${ext}`
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max 10MB)`
  }
  return null
}

export default function Upload() {
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([])
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = (incoming: FileList | File[]) => {
    const newFiles = Array.from(incoming)
    const statuses: FileStatus[] = newFiles.map((file) => ({
      file,
      status: 'pending',
      error: validateFile(file) ?? undefined,
    }))
    setFileStatuses((prev) => [...prev, ...statuses])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    addFiles(e.dataTransfer.files)
  }

  const handleSelect = () => inputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files)
      e.target.value = ''
    }
  }

  const removeFile = (index: number) => {
    setFileStatuses((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    const toUpload = fileStatuses.filter(
      (fs) => fs.status === 'pending' && !fs.error
    )
    if (toUpload.length === 0) return

    setUploading(true)

    setFileStatuses((prev) =>
      prev.map((fs) =>
        fs.status === 'pending' && !fs.error
          ? { ...fs, status: 'uploading' as const }
          : fs
      )
    )

    const uploads = toUpload.map(async (fs, index) => {
      try {
        const formData = new FormData()
        formData.append('file', fs.file)
        await documentsApi.upload(formData)
        return { index, success: true }
      } catch {
        return { index, success: false }
      }
    })

    const settled = await Promise.allSettled(uploads)

    setFileStatuses((prev) => {
      const results = new Map<number, boolean>()
      settled.forEach((r) => {
        if (r.status === 'fulfilled') {
          results.set(r.value.index, r.value.success)
        }
      })

      const uploadingIdxs = new Set(prev.map((fs, i) => fs.status === 'uploading' && !fs.error ? i : -1).filter(i => i >= 0))

      return prev.map((fs, i) => {
        if (fs.status === 'uploading') {
          const ok = uploadingIdxs.has(i) ? results.get(i) : undefined
          return {
            ...fs,
            status: ok ? 'success' as const : 'error' as const,
            error: ok ? undefined : 'Upload failed',
          }
        }
        return fs
      })
    })

    setUploading(false)
  }

  const hasValidFiles = fileStatuses.some((fs) => fs.status === 'pending' && !fs.error)
  const allDone = fileStatuses.length > 0 && fileStatuses.every((fs) => fs.status !== 'pending')

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Documents</h2>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={handleSelect}
        className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400 transition-colors"
      >
        <UploadIcon size={40} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 font-medium">
          Drop files here or click to browse
        </p>
        <p className="text-sm text-gray-400 mt-1">
          PDF, PNG, JPG, DOCX, TXT supported (max 10MB each)
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {fileStatuses.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              {fileStatuses.length} file(s) selected
            </h3>
            {allDone && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle size={14} /> All processed
              </span>
            )}
          </div>
          <div className="divide-y">
            {fileStatuses.map((fs, i) => (
              <div
                key={i}
                className="px-6 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={16} className="text-gray-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm text-gray-700 truncate block">
                      {fs.file.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {(fs.file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {fs.status === 'uploading' && (
                    <span className="text-xs text-blue-600 animate-pulse">
                      Uploading...
                    </span>
                  )}
                  {fs.status === 'success' && (
                    <CheckCircle size={16} className="text-green-500" />
                  )}
                  {fs.status === 'error' && (
                    <span className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} /> {fs.error}
                    </span>
                  )}
                  {fs.status === 'pending' && !fs.error && (
                    <button onClick={() => removeFile(i)}>
                      <X size={16} className="text-gray-400 hover:text-red-500" />
                    </button>
                  )}
                  {fs.error && fs.status === 'pending' && (
                    <span className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} /> {fs.error}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {hasValidFiles && (
            <div className="px-6 py-4 border-t">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload All'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
