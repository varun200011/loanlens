import { useMemo } from 'react'
import { formatINR } from '@/utils/format'

interface Props {
  principal: number
  annualRate: number
  tenureMonths: number
  maxRows?: number
}

interface Row { month: number; emi: number; principal: number; interest: number; balance: number }

function buildSchedule(P: number, r: number, n: number): Row[] {
  const monthly = r / 1200
  const emi = monthly === 0
    ? P / n
    : P * monthly * Math.pow(1 + monthly, n) / (Math.pow(1 + monthly, n) - 1)
  const rows: Row[] = []
  let balance = P
  for (let m = 1; m <= n && balance > 0; m++) {
    const interest = balance * monthly
    const principal = emi - interest
    balance = Math.max(0, balance - principal)
    rows.push({ month: m, emi, principal, interest, balance })
  }
  return rows
}

export default function AmortizationTable({ principal, annualRate, tenureMonths, maxRows = 12 }: Props) {
  const schedule = useMemo(
    () => buildSchedule(principal, annualRate, tenureMonths).slice(0, maxRows),
    [principal, annualRate, tenureMonths, maxRows]
  )

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['Month', 'EMI', 'Principal', 'Interest', 'Balance'].map(h => (
              <th key={h} style={{ padding: '6px 10px', textAlign: 'right', color: 'var(--text-muted)',
                fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: 11 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {schedule.map(row => (
            <tr key={row.month} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 10px', textAlign: 'right', color: 'var(--text-muted)' }}>{row.month}</td>
              <td style={{ padding: '5px 10px', textAlign: 'right' }}>{formatINR(row.emi)}</td>
              <td style={{ padding: '5px 10px', textAlign: 'right', color: 'var(--accent-bright)' }}>{formatINR(row.principal)}</td>
              <td style={{ padding: '5px 10px', textAlign: 'right', color: 'var(--amber)' }}>{formatINR(row.interest)}</td>
              <td style={{ padding: '5px 10px', textAlign: 'right', color: 'var(--text-muted)' }}>{formatINR(row.balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
