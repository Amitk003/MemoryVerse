import { useEffect, useState } from 'react'
import { X, FileText, Trash2, Share2 } from 'lucide-react'
import { documentsApi } from '../services/api'
import type { Document, Relationship } from '../types'
import { CATEGORY_COLORS } from '../types'

interface Props {
  docId: number | null
  onClose: () => void
  onDeleted: (id: number) => void
}

export default function DocumentModal({ docId, onClose, onDeleted }: Props) {
  const [doc, setDoc] = useState<Document | null>(null)
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!docId) return
    setLoading(true)
    Promise.all([
      documentsApi.get(docId),
      documentsApi.relationships(docId).catch(() => ({ data: [] })),
    ]).then(([docRes, relRes]) => {
      setDoc(docRes.data)
      setRelationships(relRes.data ?? [])
    }).catch(() => setDoc(null))
      .finally(() => setLoading(false))
  }, [docId])

  if (!docId) return null

  const handleDelete = async () => {
    if (!doc) return
    setDeleting(true)
    try {
      await documentsApi.delete(doc.id)
      onDeleted(doc.id)
      onClose()
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl border shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 truncate max-w-md">
              {doc?.title || 'Loading...'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting || !doc}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Delete document"
            >
              <Trash2 size={18} />
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : !doc ? (
          <div className="p-6 text-center text-red-500">Document not found</div>
        ) : (
          <div className="p-6 overflow-auto space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Category</span>
                <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[doc.category as keyof typeof CATEGORY_COLORS] || 'bg-gray-100 text-gray-800'}`}>
                  {doc.category}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Type</span>
                <span className="ml-2 text-gray-700">{doc.file_type}</span>
              </div>
              <div>
                <span className="text-gray-500">Size</span>
                <span className="ml-2 text-gray-700">{(doc.file_size / 1024).toFixed(1)} KB</span>
              </div>
              <div>
                <span className="text-gray-500">Indexed</span>
                <span className={`ml-2 ${doc.is_indexed ? 'text-green-600' : 'text-gray-400'}`}>
                  {doc.is_indexed ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Created</span>
                <span className="ml-2 text-gray-700">{new Date(doc.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {doc.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{doc.description}</p>
              </div>
            )}

            {doc.extracted_text && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Content Preview</h3>
                <pre className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap max-h-40 overflow-auto">
                  {doc.extracted_text.slice(0, 2000)}
                </pre>
              </div>
            )}

            {relationships.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Share2 size={16} className="text-blue-600" />
                  <h3 className="text-sm font-medium text-gray-700">Relationships</h3>
                </div>
                <div className="space-y-2">
                  {relationships.map((rel) => (
                    <div key={rel.id} className="flex items-center gap-3 text-sm bg-blue-50 rounded-lg p-3">
                      <span className="font-medium text-blue-700 capitalize">{rel.relationship_type}</span>
                      <span className="text-blue-400">→</span>
                      <span className="text-gray-600">Doc #{rel.source_document_id === doc.id ? rel.target_document_id : rel.source_document_id}</span>
                      {rel.description && (
                        <span className="text-gray-400 text-xs ml-2">- {rel.description}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
