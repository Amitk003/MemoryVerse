import { useState } from 'react'
import { Search as SearchIcon, FileText } from 'lucide-react'
import { CATEGORY_COLORS } from '../types'

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setSearched(true)

    try {
      const res = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.results ?? [])
    } catch {
      setResults([])
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Search</h2>

      <form onSubmit={handleSearch} className="relative mb-8">
        <SearchIcon
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Try "Show my certificates" or "Find AI projects"'
          className="w-full pl-11 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>

      {searched && results.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          No results found for "{query}"
        </p>
      )}

      <div className="space-y-3">
        {results.map((r: any, i: number) => (
          <div key={i} className="bg-white rounded-xl border p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {r.document?.title ?? 'Untitled'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {r.matched_content?.slice(0, 150)}
                  </p>
                </div>
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  CATEGORY_COLORS[r.document?.category as keyof typeof CATEGORY_COLORS] ?? ''
                }`}
              >
                {r.document?.category ?? 'other'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
