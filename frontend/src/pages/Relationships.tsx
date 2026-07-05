import { Share2 } from 'lucide-react'
import RelationshipGraph from '../components/RelationshipGraph'

export default function Relationships() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Share2 size={24} className="text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Document Relationships</h2>
      </div>
      <p className="text-gray-500 mb-6">
        Hover over nodes to see document names and relationship types.
      </p>
      <div className="bg-white rounded-xl border p-6">
        <RelationshipGraph />
      </div>
    </div>
  )
}
