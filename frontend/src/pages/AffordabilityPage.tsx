import { useEffect, useState } from 'react'
import { affordabilityApi, AffordabilityScore } from '@/services/api'
import { formatINR, gradeColor } from '@/utils/format'

export default function AffordabilityPage() {
  const [data, setData] = useState<AffordabilityScore | null>(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try { const { data: d } = await affordabilityApi.getScore(); setData(d) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  return (
    <div>
      <div className="page-title">Affordability Score</div>
      {loading && <div style={{ color:'var(--text-muted)' }}>Calculating…</div>}
      {data && (
        <>
          <div className="grid-3" style={{ marginBottom:'1.5rem' }}>
            <div className="stat-card">
              <div className="stat-label">Affordability Score</div>
              <div className="stat-value" style={{ color: gradeColor(data.grade) }}>{data.score}/100</div>
              <div className="stat-sub">Grade {data.grade}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Safe Borrow Limit</div>
              <div className="stat-value" style={{ color:'var(--green)' }}>{formatINR(data.safeBorrowLimit)}</div>
              <div className="stat-sub">Your real capacity</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Bank's Offer</div>
              <div className="stat-value" style={{ color:'var(--amber)' }}>{formatINR(data.bankEligibilityLimit)}</div>
              <div className="stat-sub">May be overestimated</div>
            </div>
          </div>
          <div className="card" style={{ marginBottom:'1rem' }}>
            <div className="section-title">Summary</div>
            <div style={{ fontSize:14, color:'var(--text)', lineHeight:1.7 }}>{data.summary}</div>
          </div>
          {data.insights.length > 0 && (
            <div className="card">
              <div className="section-title">Insights</div>
              {data.insights.map((ins, i) => (
                <div key={i} style={{ padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:13, color:'var(--text)', display:'flex', gap:8 }}>
                  <span style={{ color:'var(--accent-bright)' }}>→</span>{ins}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
