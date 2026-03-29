interface Props { size?: number; label?: string }

export default function LoadingSpinner({ size = 32, label = 'Loading…' }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '2rem' }}>
      <div style={{
        width: size, height: size,
        border: `2px solid var(--border)`,
        borderTop: `2px solid var(--accent-bright)`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
    </div>
  )
}
