interface Props { dti: number }

export default function DtiGauge({ dti }: Props) {
  const pct = Math.min(100, Math.max(0, dti))
  const color = pct <= 30 ? 'var(--green)' : pct <= 50 ? 'var(--amber)' : 'var(--red)'
  const label = pct <= 30 ? 'Healthy' : pct <= 50 ? 'Moderate' : 'High Risk'

  return (
    <div style={{ padding: '0.5rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
        <span style={{ color: 'var(--text-muted)' }}>Debt-to-Income Ratio</span>
        <span style={{ color, fontWeight: 600 }}>{pct.toFixed(1)}% — {label}</span>
      </div>
      <div style={{ height: 8, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color,
          borderRadius: 4, transition: 'width 0.6s ease'
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'var(--text-dim)' }}>
        <span>0%</span><span>Ideal ≤30%</span><span>Danger ≥50%</span><span>100%</span>
      </div>
    </div>
  )
}
