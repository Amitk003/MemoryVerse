import { useState, useRef } from 'react'
import { Upload as UploadIcon, FileText, X } from 'lucide-react'

export default function Upload() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const dropped = Array.from(e.dataTransfer.files)
    setFiles((prev) => [...prev, ...dropped])
  }

  const handleSelect = () => inputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setUploading(true)
    setMessage('')

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        await fetch('/api/v1/documents/upload', {
          method: 'POST',
          body: formData,
        })
      }
      setMessage(`Uploaded ${files.length} file(s) successfully`)
      setFiles([])
    } catch {
      setMessage('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

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
          PDF, PNG, JPG, DOCX, TXT supported
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

      {files.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-900">
              {files.length} file(s) selected
            </h3>
          </div>
          <div className="divide-y">
            {files.map((file, i) => (
              <div
                key={i}
                className="px-6 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <span className="text-xs text-gray-400">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button onClick={() => removeFile(i)}>
                  <X size={16} className="text-gray-400 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload All'}
            </button>
          </div>
        </div>
      )}

      {message && (
        <p className="mt-4 text-sm text-green-600">{message}</p>
      )}
    </div>
  )
}
