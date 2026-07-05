import { useEffect, useRef, useState } from 'react'
import { documentsApi } from '../services/api'
import type { Document, Relationship } from '../types'

interface GraphNode {
  id: number
  label: string
  x: number
  y: number
  vx: number
  vy: number
  category: string
}

interface GraphEdge {
  source: number
  target: number
  type: string
}

export default function RelationshipGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [docs, setDocs] = useState<Document[]>([])
  const [allRels, setAllRels] = useState<Relationship[]>([])
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    documentsApi.list({ limit: 100 }).then((res) => {
      const allDocs = (res.data ?? []) as Document[]
      setDocs(allDocs)

      Promise.all(allDocs.map((d) =>
        documentsApi.relationships(d.id).catch(() => ({ data: [] as Relationship[] }))
      )).then((relArrs) => {
        const flat = relArrs.flatMap((r) => (r.data ?? []) as Relationship[])
        const unique = flat.filter((r, i, a) => a.findIndex(
          (x) => x.source_document_id === r.source_document_id && x.target_document_id === r.target_document_id
        ) === i)
        setAllRels(unique)
      })
    })
  }, [])

  const nodes: GraphNode[] = docs.map((d, i) => {
    const angle = (2 * Math.PI * i) / docs.length
    return {
      id: d.id,
      label: d.title,
      x: 300 + 200 * Math.cos(angle),
      y: 250 + 180 * Math.sin(angle),
      vx: 0,
      vy: 0,
      category: d.category,
    }
  })

  const edges: GraphEdge[] = allRels.map((r) => ({
    source: r.source_document_id,
    target: r.target_document_id,
    type: r.relationship_type,
  }))

  const hoveredDoc = hoveredId ? docs.find((d) => d.id === hoveredId) : null

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const draw = () => {
      ctx.clearRect(0, 0, rect.width, rect.height)

      edges.forEach((edge) => {
        const src = nodes.find((n) => n.id === edge.source)
        const tgt = nodes.find((n) => n.id === edge.target)
        if (!src || !tgt) return

        const isHovered = hoveredId === edge.source || hoveredId === edge.target
        ctx.beginPath()
        ctx.moveTo(src.x, src.y)
        ctx.lineTo(tgt.x, tgt.y)
        ctx.strokeStyle = isHovered ? '#3b82f6' : '#e5e7eb'
        ctx.lineWidth = isHovered ? 2 : 1
        ctx.stroke()

        const mx = (src.x + tgt.x) / 2
        const my = (src.y + tgt.y) / 2 - 6
        if (isHovered) {
          ctx.fillStyle = '#6b7280'
          ctx.font = '10px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(edge.type, mx, my)
        }
      })

      nodes.forEach((node) => {
        const isHovered = hoveredId === node.id
        const radius = isHovered ? 8 : 6

        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = isHovered ? '#3b82f6' : '#9ca3af'
        ctx.fill()

        if (isHovered) {
          ctx.fillStyle = '#1f2937'
          ctx.font = '12px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(node.label, node.x, node.y - 14)
        }
      })

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [nodes, edges, hoveredId])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const found = nodes.find((n) => Math.hypot(n.x - mx, n.y - my) < 10)
    setHoveredId(found?.id ?? null)
  }

  if (docs.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">Upload documents to see relationships</p>
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="w-full h-[500px] cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredId(null)}
      />
      {hoveredDoc && (
        <div className="text-sm text-gray-600 text-center mt-2">
          <span className="font-medium">{hoveredDoc.title}</span>
          <span className="mx-2">-</span>
          <span className="capitalize">{hoveredDoc.category}</span>
        </div>
      )}
    </div>
  )
}
