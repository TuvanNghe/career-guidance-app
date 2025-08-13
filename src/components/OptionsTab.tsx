'use client'

import { useEffect, useState } from 'react'
import AnalysisCard from './AnalysisCard'

// Helper: đọc JSON an toàn, không crash nếu body rỗng/invalid
async function safeJson(res: Response): Promise<any | null> {
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    try {
      return await res.json()
    } catch {
      return null
    }
  }
  // Nếu server trả text/204 → cố đọc text rồi bỏ qua nếu không phải JSON
  try {
    const txt = await res.text()
    if (!txt) return null
    return JSON.parse(txt)
  } catch {
    return null
  }
}

export default function OptionsTab({
  canAnalyse,
  hasAnalysed,
}: {
  canAnalyse: boolean
  hasAnalysed: boolean
}) {
  const [analysed, setAnalysed] = useState(hasAnalysed)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Khi mount: nếu đủ điều kiện và chưa analysed → kiểm tra lại từ API
  useEffect(() => {
    if (!canAnalyse || analysed) return

    ;(async () => {
      try {
        const r = await fetch('/api/profile/summary')
        if (!r.ok) return
        const json = await safeJson(r)
        if (!json) return

        // Hỗ trợ cả shape cũ (flat) lẫn shape mới bọc trong "profile"
        const summary =
          json.knowdell_summary ?? json.profile?.knowdell_summary ?? ''
        // Chỉ cần có summary là coi như đã có kết quả (gợi ý nghề có thể rỗng)
        if (typeof summary === 'string' && summary.trim().length > 0) {
          setAnalysed(true)
        }
      } catch {
        // nuốt lỗi im lặng như trước
      }
    })()
  }, [canAnalyse, analysed])

  const runAnalyse = async () => {
    if (!canAnalyse || analysed || loading) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/career/analyse', { method: 'POST' })

      // 🔒 Không còn gọi res.json() trực tiếp → tránh lỗi body rỗng
      const js = await safeJson(res)

      if (!res.ok) {
        throw new Error(js?.error || js?.message || 'ERROR')
      }

      setAnalysed(true)
    } catch (e) {
      console.error(e)
      setError('Phân tích thất bại – thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  if (!canAnalyse) {
    return (
      <p className="rounded border bg-yellow-50 p-4 text-center">
        Hoàn tất <b>Holland</b> và <b>Knowdell</b> trước khi phân tích.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {!analysed && (
        <button
          onClick={runAnalyse}
          disabled={loading}
          className="rounded bg-indigo-600 px-6 py-2 text-white disabled:opacity-50"
        >
          {loading ? 'Đang phân tích…' : 'Phân tích kết hợp'}
        </button>
      )}

      {error && <p className="text-red-600">{error}</p>}

      {analysed && <AnalysisCard />}
    </div>
  )
}
