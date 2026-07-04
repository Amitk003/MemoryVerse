import { useEffect, useState } from 'react'
import { documentsApi } from '../services/api'
import type { Document } from '../types'
import { CATEGORIES, CATEGORY_COLORS } from '../types'
import { FileText, FolderOpen } from 'lucide-react'

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    documentsApi.list().then((res) => {
      setDocuments(res.data ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const categoryCounts = CATEGORIES.map((cat) => ({
    ...cat,
    count: documents.filter((d) => d.category === cat.value).length,
  }))

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {categoryCounts.map((cat) => (
          <div
            key={cat.value}
            className="bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <FolderOpen size={20} className="text-gray-400" />
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[cat.value]}`}
              >
                {cat.count}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-700">{cat.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading documents...</p>
      ) : documents.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            No documents yet
          </h3>
          <p className="text-gray-400">
            Upload your first document to get started.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-900">
              Recent Documents
            </h3>
          </div>
          <div className="divide-y">
            {documents.slice(0, 10).map((doc) => (
              <div
                key={doc.id}
                className="px-6 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">{doc.title}</span>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[doc.category as keyof typeof CATEGORY_COLORS]}`}
                >
                  {doc.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
