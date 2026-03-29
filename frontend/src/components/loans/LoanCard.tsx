import { useState } from 'react'
import { LoanResponse } from '@/services/api'
import { formatINR, formatPct } from '@/utils/format'
import AmortizationTable from './AmortizationTable'

interface Props { loan: LoanResponse; onDelete: (id: string) => void }

export default function LoanCard({ loan, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '1.5rem', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>LOAN TYPE</div>
          <div style={{ fontWeight: 600 }}>{loan.loanType.replace('_', ' ')}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{loan.lenderName || '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>OUTSTANDING</div>
          <div style={{ fontWeight: 600 }}>{formatINR(loan.outstandingBalance)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{loan.remainingMonths} months left</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>MONTHLY EMI</div>
          <div style={{ fontWeight: 600, color: 'var(--accent-bright)' }}>{formatINR(loan.emi)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatPct(loan.interestRate)} p.a.</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>TOTAL INTEREST</div>
          <div style={{ fontWeight: 600, color: 'var(--amber)' }}>{formatINR(loan.totalInterest)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>of {formatINR(loan.totalPayable)}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}
            onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Hide' : 'Schedule'}
          </button>
          <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 12 }}
            onClick={() => onDelete(loan.id)}>Remove</button>
        </div>
      </div>
      {expanded && (
        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>AMORTIZATION SCHEDULE (first 12 months)</div>
          <AmortizationTable
            principal={loan.principal} annualRate={loan.interestRate}
            tenureMonths={loan.tenureMonths} maxRows={12} />
        </div>
      )}
    </div>
  )
}
