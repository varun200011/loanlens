import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { fetchPortfolio } from '@/store/slices/portfolioSlice'
import { formatINR, formatPct, gradeColor } from '@/utils/format'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { data, loading } = useSelector((s: RootState) => s.portfolio)
  const user = useSelector((s: RootState) => s.auth.user)

  useEffect(() => { dispatch(fetchPortfolio()) }, [])

  return (
    <div>
      <div className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</div>

      {loading && <div style={{ color: 'var(--text-muted)' }}>Loading your financial overview…</div>}

      {data && (
        <>
          <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-label">Total Outstanding</div>
              <div className="stat-value">{formatINR(data.totalOutstanding)}</div>
              <div className="stat-sub">{data.activeLoanCount} active loan{data.activeLoanCount !== 1 ? 's' : ''}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Monthly EMI</div>
              <div className="stat-value">{formatINR(data.totalMonthlyEmi)}</div>
              <div className="stat-sub">of {formatINR(data.monthlyIncome)} income</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">DTI Ratio</div>
              <div className="stat-value" style={{ color: data.dtiRatio > 40 ? 'var(--red)' : data.dtiRatio > 30 ? 'var(--amber)' : 'var(--green)' }}>
                {formatPct(data.dtiRatio)}
              </div>
              <div className="stat-sub">Debt-to-income</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Health Grade</div>
              <div className="stat-value" style={{ color: gradeColor(data.healthGrade) }}>{data.healthGrade}</div>
              <div className="stat-sub">Monthly buffer: {formatINR(data.disposableAfterEmi)}</div>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="section-title">Quick Actions</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <Link to="/app/loans" className="btn btn-primary">+ Add New Loan</Link>
                <Link to="/app/stress" className="btn btn-ghost">⚡ Run Stress Test</Link>
                <Link to="/app/affordability" className="btn btn-ghost">◉ Check Affordability</Link>
              </div>
            </div>
            <div className="card">
              <div className="section-title">Total Interest Payable</div>
              <div style={{ fontSize:28, fontWeight:700, color:'var(--amber)', marginBottom:8 }}>
                {formatINR(data.totalInterestPayable)}
              </div>
              <div style={{ fontSize:13, color:'var(--text-muted)' }}>
                Avalanche strategy saves {formatINR(data.avalanche?.totalInterestSaved || 0)} and{' '}
                {data.avalanche?.monthsSaved || 0} months
              </div>
              <Link to="/app/portfolio" style={{ display:'inline-block', marginTop:12, fontSize:13 }}>
                View prepayment strategies →
              </Link>
            </div>
          </div>
        </>
      )}

      {!loading && !data && (
        <div className="card" style={{ textAlign:'center', padding:'3rem' }}>
          <div style={{ fontSize:18, marginBottom:8 }}>No loans yet</div>
          <div style={{ color:'var(--text-muted)', marginBottom:'1.5rem' }}>Add your first loan to get started</div>
          <Link to="/app/loans" className="btn btn-primary">Add a Loan</Link>
        </div>
      )}
    </div>
  )
}