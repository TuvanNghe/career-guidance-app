'use client'

import { useEffect, useState } from 'react'
import AnalysisCard from './AnalysisCard'

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

    fetch('/api/profile/summary')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!json) return
        // Hỗ trợ cả shape cũ (flat) lẫn shape mới bọc trong "profile"
        const summary =
          json.knowdell_summary ?? json.profile?.knowdell_summary ?? ''
        // Chỉ cần có summary là coi như đã có kết quả (gợi ý nghề có thể rỗng)
        if (typeof summary === 'string' && summary.trim().length > 0) {
          setAnalysed(true)
        }
      })
      .catch(() => {})
  }, [canAnalyse, analysed])

  const runAnalyse = async () => {
    if (!canAnalyse || analysed || loading) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/career/analyse', { method: 'POST' })
      const js = await res.json()
      if (!res.ok) throw new Error(js?.error || 'ERROR')
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
