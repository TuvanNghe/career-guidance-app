/* --------------------------------------------------------------------------
   src/components/FocusTab.tsx   –  Tab 3 · Mục tiêu ưu tiên
   Gating: cần Knowdell + Holland (đọc duy nhất từ /api/profile/summary)
-------------------------------------------------------------------------- */
"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

type Goal = {
  job        : string | null
  goals      : string | null
  activities : string | null
  start_date : string | null
  end_date   : string | null
  supporters : string | null
}

export default function FocusTab ({ existing }: { existing: Goal | null }) {
  const router                      = useRouter()
  const [pending, startTransition ] = useTransition()

  /* ---------- form state (init từ prop) ---------- */
  const [job       , setJob       ] = useState(existing?.job        ?? "")
  const [goals     , setGoals     ] = useState(existing?.goals      ?? "")
  const [activities, setActivities] = useState(existing?.activities ?? "")
  const [startDate , setStartDate ] = useState(existing?.start_date ?? "")
  const [endDate   , setEndDate   ] = useState(existing?.end_date   ?? "")
  const [supporter , setSupporter ] = useState(existing?.supporters ?? "")

  /* ------------------------ GATING (giống OptionsTab) ------------------- */
  const [ok, setOk] = useState<boolean | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch("/api/profile/summary", {
          cache: "no-store",
          credentials: "include",
        })
        if (!res.ok) throw new Error("bad response")
        const json = await res.json()
        const p = json?.profile ?? json ?? {}

        // Knowdell
        const hasKnowdell =
          typeof p?.knowdell_summary === "string" &&
          p.knowdell_summary.trim().length > 0

        // Holland (ưu tiên key phổ biến; fallback proxy suggested_jobs)
        const hasHolland =
          (typeof p?.holland_code === "string" && p.holland_code.trim().length > 0) ||
          (typeof p?.holland_summary === "string" && p.holland_summary.trim().length > 0) ||
          (typeof p?.holland?.letters === "string" && p.holland.letters.trim().length > 0) ||
          (Array.isArray(p?.holland_scores) && p.holland_scores.length > 0) ||
          (Array.isArray(p?.suggested_jobs) && p.suggested_jobs.length > 0)

        if (alive) setOk(Boolean(hasKnowdell && hasHolland))
      } catch {
        if (alive) setOk(false)
      }
    })()
    return () => { alive = false }
  }, [])

  /* ---------- fallback: fetch nếu prop rỗng ---------- */
  useEffect(() => {
    if (existing) return
    fetch("/api/career/goal", { cache: "no-store", credentials: "include" })
      .then(res => (res.ok ? res.json() : null))
      .then(json => {
        const g: Goal | null = json?.data ?? null
        if (!g) return
        setJob        (g.job        ?? "")
        setGoals      (g.goals      ?? "")
        setActivities (g.activities ?? "")
        setStartDate  (g.start_date ?? "")
        setEndDate    (g.end_date   ?? "")
        setSupporter  (g.supporters ?? "")
      })
      .catch(() => {/* ignore */})
  }, [existing])

  /* ---------- save handler ---------- */
  const handleSave = () => {
    if (!job.trim() || !goals.trim()) {
      return alert("Vui lòng nhập Nghề nghiệp & Mục tiêu ưu tiên.")
    }
    startTransition(async () => {
      await fetch("/api/career/focus", {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({
          job, goals, activities,
          start_date : startDate || null,
          end_date   : endDate   || null,
          supporters : supporter,
        }),
      })
      router.push("/profile?step=plan")
      router.refresh()
    })
  }

  /* ------------------------------- UI ----------------------------------- */
  if (ok === null) {
    return <p className="rounded border bg-gray-50 p-4 text-center">Đang kiểm tra điều kiện…</p>
  }
  if (!ok) {
    return (
      <p className="rounded border bg-yellow-50 p-4 text-center">
        Hoàn tất <b>Holland</b> và <b>Knowdell</b> trước khi thiết lập <b>Mục tiêu ưu tiên</b>.
      </p>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <label className="font-medium block">Nghề nghiệp lựa chọn</label>
        <input
          value={job}
          onChange={e => setJob(e.target.value)}
          className="mt-1 w-full rounded border p-2"
          placeholder="VD: Chuyên viên nhân sự"
        />
      </div>

      <div>
        <label className="font-medium block">
          Những mục tiêu ưu tiên và quan trọng nhất để đạt được nghề nghiệp yêu thích
        </label>
        <textarea
          className="mt-1 w-full rounded border p-2 h-24"
          value={goals}
          onChange={e => setGoals(e.target.value)}
          placeholder="VD: Hoàn thành chứng chỉ HRBP trong 6 tháng…"
        />
      </div>

      <div>
        <label className="font-medium block">
          Hoạt động ưu tiên và quan trọng để đạt được nghề nghiệp yêu thích
        </label>
        <textarea
          className="mt-1 w-full rounded border p-2 h-24"
          value={activities}
          onChange={e => setActivities(e.target.value)}
          placeholder="VD: Tham gia khoá HR Analytics, networking nhóm HR Friday…"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-medium block">Thời gian bắt đầu</label>
          <input
            type="date"
            className="mt-1 w-full rounded border p-2"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="font-medium block">Thời gian hoàn thành</label>
          <input
            type="date"
            className="mt-1 w-full rounded border p-2"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="font-medium block">Người hỗ trợ / đồng hành</label>
        <input
          type="text"
          className="mt-1 w-full rounded border p-2"
          value={supporter}
          onChange={e => setSupporter(e.target.value)}
          placeholder="VD: Anh A (Mentor), Chị B (Leader)…"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={pending}
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded px-6 py-2 disabled:opacity-50"
      >
        {pending ? "Đang lưu…" : "Lưu & sang bước kế"}
      </button>
    </div>
  )
}
