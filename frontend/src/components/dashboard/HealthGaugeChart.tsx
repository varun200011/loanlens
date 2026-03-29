import { useEffect, useRef } from 'react'
import { Chart, ArcElement, Tooltip, DoughnutController } from 'chart.js'

Chart.register(ArcElement, Tooltip, DoughnutController)

interface Props { dti: number; grade: string }

const GRADE_COLOR: Record<string, string> = {
  'A+': '#10b981', 'A': '#34d399', 'B': '#60a5fa', 'C': '#f59e0b', 'D': '#fb923c', 'F': '#ef4444'
}

export default function HealthGaugeChart({ dti, grade }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    chartRef.current?.destroy()
    const clamped = Math.min(100, Math.max(0, dti))
    const color = GRADE_COLOR[grade] || '#ef4444'

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [clamped, 100 - clamped],
          backgroundColor: [color, '#1a2234'],
          borderWidth: 0,
          circumference: 180,
          rotation: 270
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '78%',
        plugins: { tooltip: { enabled: false }, legend: { display: false } }
      }
    })

    return () => { chartRef.current?.destroy() }
  }, [dti, grade])

  return (
    <div style={{ position: 'relative', height: 120, width: '100%' }}>
      <canvas ref={canvasRef} />
      <div style={{
        position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: GRADE_COLOR[grade] || '#ef4444' }}>{grade}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>DTI {dti.toFixed(1)}%</div>
      </div>
    </div>
  )
}