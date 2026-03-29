export const formatINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

export const formatPct = (val: number, decimals = 1) => `${val.toFixed(decimals)}%`

export const gradeColor = (grade: string) => {
  if (grade === 'A+' || grade === 'A') return 'var(--green)'
  if (grade === 'B') return 'var(--accent-bright)'
  if (grade === 'C') return 'var(--amber)'
  return 'var(--red)'
}

export const riskBandColor = (band: string) => {
  if (band === 'GREEN')    return 'var(--green)'
  if (band === 'AMBER')    return 'var(--amber)'
  if (band === 'RED')      return 'var(--red)'
  if (band === 'CRITICAL') return '#ff0000'
  return 'var(--text-muted)'
}

export const riskBandClass = (band: string) => {
  if (band === 'GREEN')    return 'badge-green'
  if (band === 'AMBER')    return 'badge-amber'
  return 'badge-red'
}
