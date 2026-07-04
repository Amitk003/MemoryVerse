import { useEffect, useState } from 'react'
import { CATEGORY_COLORS } from '../types'
import type { TimelineItem } from '../types'
import { documentsApi } from '../services/api'

export default function Timeline() {
  const [items, setItems] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    documentsApi.timeline()
      .then((res) => {
        setItems(res.data.items ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const grouped = items.reduce<Record<number, TimelineItem[]>>((acc, item) => {
    if (!acc[item.year]) acc[item.year] = []
    acc[item.year].push(item)
    return acc
  }, {})

  const years = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Your Journey Timeline
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading timeline...</p>
      ) : years.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          No timeline data yet. Upload documents to build your timeline.
        </p>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

          {years.map((year) => (
            <div key={year} className="relative mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative z-10 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {year.toString().slice(2)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{year}</h3>
              </div>

              <div className="ml-12 space-y-3">
                {grouped[year].map((item, i) => (
                  <div key={i} className="bg-white rounded-xl border p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.title}
                      </p>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS] ?? ''
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-500">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
