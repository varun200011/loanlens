import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { runStress } from '@/store/slices/stressSlice'
import { formatINR, riskBandClass } from '@/utils/format'

const SCENARIOS = [
  { type: 'INCOME_DROP', label: 'Income Drop', description: 'What if your income drops?', unit: '% drop', min: 1, max: 90, defaultVal: 20 },
  { type: 'RATE_HIKE',   label: 'Rate Hike',   description: 'What if interest rates rise?', unit: '% hike', min: 0.5, max: 5, defaultVal: 2 },
  { type: 'EXPENSE_SHOCK', label: 'Expense Shock', description: 'What if a big expense hits?', unit: '₹ extra/month', min: 1000, max: 200000, defaultVal: 20000 },
  { type: 'JOB_LOSS',   label: 'Job Loss',   description: 'Complete income loss scenario', unit: 'N/A', min: 0, max: 0, defaultVal: 100 }
]

export default function StressPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { result, loading, error } = useSelector((s: RootState) => s.stress)
  const [selected, setSelected] = useState(SCENARIOS[0])
  const [delta, setDelta] = useState(20)

  const handleRun = () => {
    const val = selected.type === 'JOB_LOSS' ? 100 : -Math.abs(delta)
    dispatch(runStress({ scenarioType: selected.type, parameterDelta: selected.type === 'EXPENSE_SHOCK' ? delta : val }))
  }

  return (
    <div>
      <div className="page-title">Financial Stress Simulator</div>
      <div style={{ color:'var(--text-muted)', marginBottom:'1.5rem', fontSize:14 }}>
        Test how your finances hold up under different stress scenarios
      </div>

      <div className="grid-2" style={{ marginBottom:'1.5rem' }}>
        <div className="card">
          <div className="section-title">Choose Scenario</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:'1.5rem' }}>
            {SCENARIOS.map(s => (
              <button key={s.type} onClick={() => { setSelected(s); setDelta(s.defaultVal) }}
                style={{
                  padding:'12px 16px', borderRadius:'var(--radius-sm)', cursor:'pointer',
                  background: selected.type === s.type ? 'rgba(59,130,246,0.15)' : 'var(--bg)',
                  border: selected.type === s.type ? '1px solid var(--accent)' : '1px solid var(--border)',
                  color: selected.type === s.type ? 'var(--accent-bright)' : 'var(--text-muted)',
                  textAlign:'left', fontFamily:'var(--font)', fontSize:14, fontWeight:500, transition:'all 0.1s'
                }}>
                <div>{s.label}</div>
                <div style={{ fontSize:12, opacity:0.7, marginTop:2 }}>{s.description}</div>
              </button>
            ))}
          </div>

          {selected.type !== 'JOB_LOSS' && (
            <div className="form-group">
              <label>{selected.unit}: {delta}{selected.unit.startsWith('₹') ? '' : selected.unit.includes('%') ? '%' : ''}</label>
              <input type="range" min={selected.min} max={selected.max} step={selected.unit.includes('%') ? 0.5 : 1000}
                value={delta} onChange={e => setDelta(Number(e.target.value))}
                style={{ width:'100%', accentColor:'var(--accent)' }} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-dim)', marginTop:4 }}>
                <span>{selected.unit.startsWith('₹') ? `₹${selected.min.toLocaleString('en-IN')}` : selected.min + '%'}</span>
                <span style={{ color:'var(--accent-bright)', fontWeight:600 }}>{selected.unit.startsWith('₹') ? `₹${delta.toLocaleString('en-IN')}` : delta + '%'}</span>
                <span>{selected.unit.startsWith('₹') ? `₹${selected.max.toLocaleString('en-IN')}` : selected.max + '%'}</span>
              </div>
            </div>
          )}

          <button className="btn btn-primary" style={{ width:'100%' }} onClick={handleRun} disabled={loading}>
            {loading ? 'Simulating…' : '⚡ Run Simulation'}
          </button>
          {error && <div className="error-msg" style={{ marginTop:8 }}>{error}</div>}
        </div>

        <div>
          {result ? (
            <div className="card" style={{ borderColor: result.isAtRisk ? 'var(--red)' : 'var(--green)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
                <div style={{ fontSize:16, fontWeight:600 }}>Simulation Result</div>
                <span className={`badge ${riskBandClass(result.riskBand)}`}>{result.riskBand}</span>
              </div>
              <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:'1.5rem', lineHeight:1.6 }}>
                {result.riskMessage}
              </div>
              <div className="grid-2" style={{ marginBottom:'1.5rem' }}>
                <div>
                  <div style={{ fontSize:11, color:'var(--text-dim)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Current EMI</div>
                  <div style={{ fontSize:20, fontWeight:600, marginTop:4 }}>{formatINR(result.currentMonthlyEmi)}</div>
                </div>
                <div>
                  <div style={{ fontSize:11, color:'var(--text-dim)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Projected EMI</div>
                  <div style={{ fontSize:20, fontWeight:600, color: result.projectedMonthlyEmi > result.currentMonthlyEmi ? 'var(--red)' : 'var(--green)', marginTop:4 }}>
                    {formatINR(result.projectedMonthlyEmi)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize:11, color:'var(--text-dim)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Buffer Now</div>
                  <div style={{ fontSize:20, fontWeight:600, color:'var(--green)', marginTop:4 }}>{formatINR(result.availableAfterEmi)}</div>
                </div>
                <div>
                  <div style={{ fontSize:11, color:'var(--text-dim)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Buffer After Stress</div>
                  <div style={{ fontSize:20, fontWeight:600, color: result.projectedAvailableAfterEmi < 0 ? 'var(--red)' : 'var(--amber)', marginTop:4 }}>
                    {formatINR(result.projectedAvailableAfterEmi)}
                  </div>
                </div>
              </div>
              {result.recommendations.length > 0 && (
                <div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:8, fontWeight:600 }}>RECOMMENDATIONS</div>
                  {result.recommendations.map((r, i) => (
                    <div key={i} style={{ fontSize:13, color:'var(--text)', padding:'6px 0', borderBottom:'1px solid var(--border)', display:'flex', gap:8 }}>
                      <span style={{ color:'var(--accent-bright)', flexShrink:0 }}>→</span>{r}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ textAlign:'center', padding:'3rem', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ color:'var(--text-muted)' }}>Select a scenario and run simulation to see results</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
