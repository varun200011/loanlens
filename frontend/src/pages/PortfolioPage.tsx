import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { fetchPortfolio } from '@/store/slices/portfolioSlice'
import { formatINR, gradeColor } from '@/utils/format'
import DtiGauge from '@/components/portfolio/DtiGauge'
import HealthGaugeChart from '@/components/dashboard/HealthGaugeChart'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function PortfolioPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { data, loading } = useSelector((s: RootState) => s.portfolio)
  useEffect(() => { dispatch(fetchPortfolio()) }, [])

  if (loading) return <LoadingSpinner label="Analysing portfolio…" />
  if (!data) return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ color: 'var(--text-muted)' }}>Add loans first to view portfolio analysis.</div>
    </div>
  )

  return (
    <div>
      <div className="page-title">Portfolio Analysis</div>
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="section-title" style={{ marginBottom: '0.5rem' }}>Health Grade</div>
          <HealthGaugeChart dti={data.dtiRatio} grade={data.healthGrade} />
        </div>
        <div className="card">
          <div className="section-title">Totals</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Outstanding</div>
              <div style={{ fontSize: 20, fontWeight: 600 }}>{formatINR(data.totalOutstanding)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Interest Payable</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--amber)' }}>{formatINR(data.totalInterestPayable)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monthly Buffer</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: data.disposableAfterEmi < 0 ? 'var(--red)' : 'var(--green)' }}>
                {formatINR(data.disposableAfterEmi)}
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="section-title">DTI Ratio</div>
          <DtiGauge dti={data.dtiRatio} />
          <div style={{ marginTop: '1rem', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Monthly EMI {formatINR(data.totalMonthlyEmi)} of {formatINR(data.monthlyIncome)} income
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-title">Avalanche Strategy</div>
          <div style={{ color: 'var(--green)', fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
            Save {formatINR(data.avalanche.totalInterestSaved)}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: '1rem' }}>
            {data.avalanche.monthsSaved} months earlier • Highest rate first
          </div>
          {data.avalanche.payoffOrder.map((o, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--accent-bright)', minWidth: 20 }}>{i + 1}.</span>
              <span style={{ color: 'var(--text-muted)' }}>{o}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="section-title">Snowball Strategy</div>
          <div style={{ color: 'var(--amber)', fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
            Save {formatINR(data.snowball.totalInterestSaved)}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: '1rem' }}>
            {data.snowball.monthsSaved} months earlier • Lowest balance first
          </div>
          {data.snowball.payoffOrder.map((o, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--accent-bright)', minWidth: 20 }}>{i + 1}.</span>
              <span style={{ color: 'var(--text-muted)' }}>{o}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
