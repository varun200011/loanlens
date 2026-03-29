import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// ── Floating loan card data ──
const LOAN_CARDS = [
  { type: 'HOME LOAN', amount: '₹45,00,000', emi: '₹39,842/mo', rate: '8.5%', color: '#3b82f6', delay: 0 },
  { type: 'CAR LOAN',  amount: '₹8,50,000',  emi: '₹17,632/mo', rate: '9.0%', color: '#10b981', delay: 0.4 },
  { type: 'PERSONAL',  amount: '₹3,20,000',  emi: '₹10,234/mo', rate: '12%', color: '#f59e0b', delay: 0.8 },
  { type: 'EDUCATION', amount: '₹12,00,000', emi: '₹22,150/mo', rate: '10%', color: '#8b5cf6', delay: 1.2 },
]

const FEATURES = [
  {
    icon: '⚡',
    title: 'Stress Simulator',
    desc: 'What happens if you lose your job? Or rates spike 3%? Simulate income shocks, rate hikes, and expense emergencies — see exactly which EMI breaks first.',
    stat: '4 scenario types',
    color: '#ef4444'
  },
  {
    icon: '◎',
    title: 'Portfolio Intelligence',
    desc: 'Stop managing loans one-by-one. See your entire debt portfolio — DTI ratio, health grade, combined interest payable, and the exact repayment order to save the most.',
    stat: 'Avalanche + Snowball strategies',
    color: '#3b82f6'
  },
  {
    icon: '◈',
    title: 'Real Affordability',
    desc: "Banks tell you what you're eligible for. We tell you what you can actually afford — after rent, SIPs, groceries, and your emergency buffer.",
    stat: 'Safe borrow limit in seconds',
    color: '#10b981'
  },
  {
    icon: '◉',
    title: 'PDF Risk Report',
    desc: 'Download a complete financial risk report — health grade, loan breakdown, stress test results, prepayment strategy comparison, and 12-month cashflow forecast.',
    stat: 'Shareable PDF export',
    color: '#f59e0b'
  }
]

// ── EMI Calculator ──
function EmiCalculator() {
  const [principal, setPrincipal] = useState(3000000)
  const [rate, setRate] = useState(8.5)
  const [tenure, setTenure] = useState(240)

  const r = rate / 1200
  const emi = r === 0 ? principal / tenure
    : (principal * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1)
  const total = emi * tenure
  const interest = total - principal

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 20,
      padding: '2.5rem',
      backdropFilter: 'blur(20px)',
    }}>
      <div style={{ fontSize: 13, letterSpacing: '0.1em', color: '#60a5fa', marginBottom: '1.5rem', fontWeight: 600 }}>
        LIVE EMI CALCULATOR
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Loan Amount</label>
          <span style={{ fontSize: 13, color: '#fff', fontWeight: 600, fontFamily: 'monospace' }}>{fmt(principal)}</span>
        </div>
        <input type="range" min={100000} max={10000000} step={50000} value={principal}
          onChange={e => setPrincipal(+e.target.value)}
          style={{ width: '100%', accentColor: '#3b82f6', height: 4 }} />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Interest Rate</label>
          <span style={{ fontSize: 13, color: '#fff', fontWeight: 600, fontFamily: 'monospace' }}>{rate.toFixed(1)}%</span>
        </div>
        <input type="range" min={5} max={24} step={0.1} value={rate}
          onChange={e => setRate(+e.target.value)}
          style={{ width: '100%', accentColor: '#10b981', height: 4 }} />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Tenure</label>
          <span style={{ fontSize: 13, color: '#fff', fontWeight: 600, fontFamily: 'monospace' }}>{tenure} months</span>
        </div>
        <input type="range" min={12} max={360} step={12} value={tenure}
          onChange={e => setTenure(+e.target.value)}
          style={{ width: '100%', accentColor: '#f59e0b', height: 4 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {[
          { label: 'Monthly EMI', value: fmt(emi), color: '#60a5fa' },
          { label: 'Total Interest', value: fmt(interest), color: '#f59e0b' },
          { label: 'Total Payable', value: fmt(total), color: '#10b981' },
        ].map(item => (
          <div key={item.label} style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 12,
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6, letterSpacing: '0.05em' }}>{item.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: item.color, fontFamily: 'monospace' }}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Landing Page ──
export default function LandingPage() {
  const navigate = useNavigate()
  const [scrollY, setScrollY] = useState(0)
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set())
  const featureRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = featureRefs.current.indexOf(entry.target as HTMLDivElement)
            if (idx !== -1) setVisibleSections(prev => new Set([...prev, idx]))
          }
        })
      },
      { threshold: 0.15 }
    )
    featureRefs.current.forEach(ref => ref && observer.observe(ref))
    return () => observer.disconnect()
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050810',
      fontFamily: "'Syne', 'DM Sans', sans-serif",
      color: '#fff',
      overflowX: 'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-18px) rotate(-2deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(-8px) rotate(3deg); }
          50% { transform: translateY(12px) rotate(3deg); }
        }
        @keyframes floatC {
          0%, 100% { transform: translateY(5px) rotate(-1deg); }
          50% { transform: translateY(-14px) rotate(-1deg); }
        }
        @keyframes floatD {
          0%, 100% { transform: translateY(-4px) rotate(2deg); }
          50% { transform: translateY(16px) rotate(2deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes number-tick {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .float-a { animation: floatA 6s ease-in-out infinite; }
        .float-b { animation: floatB 7s ease-in-out infinite; }
        .float-c { animation: floatC 5s ease-in-out infinite; }
        .float-d { animation: floatD 8s ease-in-out infinite; }

        .hero-btn {
          padding: 16px 36px;
          border-radius: 50px;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.05em;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
          text-transform: uppercase;
        }
        .hero-btn:hover { transform: translateY(-2px); }
        .hero-btn-primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #fff;
          box-shadow: 0 0 40px rgba(59,130,246,0.4);
        }
        .hero-btn-primary:hover {
          box-shadow: 0 0 60px rgba(59,130,246,0.6);
        }
        .hero-btn-ghost {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.8);
          border: 1px solid rgba(255,255,255,0.15);
        }
        .hero-btn-ghost:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.3);
        }
        .feature-card {
          transition: transform 0.3s ease, border-color 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-4px);
        }
        .nav-link {
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          transition: color 0.2s;
          background: none;
          border: none;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-link:hover { color: #fff; }

        input[type=range] {
          -webkit-appearance: none;
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
          height: 4px;
          outline: none;
          cursor: pointer;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(255,255,255,0.4);
        }
      `}</style>

      {/* ── Nav ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '1.25rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrollY > 50 ? 'rgba(5,8,16,0.9)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Loan<span style={{ color: '#3b82f6' }}>Lens</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <button className="nav-link" onClick={() => navigate('/login')}>Sign in</button>
          <button className="hero-btn hero-btn-primary" style={{ padding: '10px 24px', fontSize: 13 }}
            onClick={() => navigate('/register')}>
            Get Started
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '8rem 2rem 4rem',
        maxWidth: 1200,
        margin: '0 auto',
        gap: '4rem',
        position: 'relative'
      }}>
        {/* Glow orbs */}
        <div style={{
          position: 'absolute', width: 600, height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
          top: '10%', left: '-10%', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
          bottom: '10%', right: '0%', pointerEvents: 'none'
        }} />

        {/* Left — text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: 50, padding: '6px 16px',
            fontSize: 12, fontWeight: 600, color: '#60a5fa',
            letterSpacing: '0.08em', marginBottom: '1.5rem'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'pulse-glow 2s infinite' }} />
            INTELLIGENT LOAN RISK ANALYSIS
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem'
          }}>
            Know what your
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              loans actually cost
            </span>
            <br />
            you.
          </h1>

          <p style={{
            fontSize: 18,
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.7,
            maxWidth: 480,
            marginBottom: '2.5rem',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300
          }}>
            Stress-test your finances. Simulate job loss, rate hikes, and expense shocks.
            Find out your real borrowing limit — not the bank's inflated number.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="hero-btn hero-btn-primary" onClick={() => navigate('/register')}>
              Analyse my loans →
            </button>
            <button className="hero-btn hero-btn-ghost" onClick={() => navigate('/login')}>
              Sign in
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '2.5rem', marginTop: '3rem' }}>
            {[
              { val: '4', label: 'Stress scenarios' },
              { val: 'A+→F', label: 'Health grading' },
              { val: '₹0', label: 'Cost to use' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>{s.val}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — floating cards */}
        <div style={{
          flex: 1, minWidth: 0,
          position: 'relative', height: 480,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {LOAN_CARDS.map((card, i) => {
            const positions = [
              { top: '5%', left: '10%' },
              { top: '15%', right: '5%' },
              { bottom: '20%', left: '5%' },
              { bottom: '5%', right: '10%' },
            ]
            const floatClasses = ['float-a', 'float-b', 'float-c', 'float-d']
            return (
              <div key={card.type}
                className={floatClasses[i]}
                style={{
                  position: 'absolute',
                  ...positions[i],
                  width: 200,
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${card.color}33`,
                  borderRadius: 16,
                  padding: '1.25rem',
                  animationDelay: `${card.delay}s`,
                  boxShadow: `0 0 40px ${card.color}22`
                }}>
                <div style={{ fontSize: 10, letterSpacing: '0.1em', color: card.color, marginBottom: 8, fontWeight: 700 }}>
                  {card.type}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, fontFamily: 'monospace' }}>
                  {card.amount}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif" }}>
                  EMI {card.emi}
                </div>
                <div style={{
                  marginTop: 12, padding: '4px 10px',
                  background: `${card.color}22`,
                  borderRadius: 20, display: 'inline-block',
                  fontSize: 11, color: card.color, fontWeight: 600
                }}>
                  @ {card.rate} p.a.
                </div>
              </div>
            )
          })}

          {/* Center glow */}
          <div style={{
            width: 200, height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
            animation: 'pulse-glow 3s infinite'
          }} />
        </div>
      </section>

      {/* ── EMI Calculator Section ── */}
      <section style={{
        padding: '6rem 2rem',
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: '0.1em', color: '#60a5fa', fontWeight: 600, marginBottom: '1rem' }}>
              INSTANT CALCULATION
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1.5rem' }}>
              See your EMI
              <br />
              <span style={{ color: '#10b981' }}>before you commit.</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, fontFamily: "'DM Sans', sans-serif", fontWeight: 300, maxWidth: 400 }}>
              Drag the sliders. Watch your monthly commitment, total interest burden, and repayment timeline update in real time. No signup required for this.
            </p>
            <div style={{ marginTop: '2rem', padding: '1rem 1.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, marginBottom: 4 }}>⚠ Banks don't tell you this</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif" }}>
                The interest you pay often equals or exceeds the principal. Use LoanLens to understand your true cost.
              </div>
            </div>
          </div>
          <EmiCalculator />
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '6rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ fontSize: 12, letterSpacing: '0.1em', color: '#60a5fa', fontWeight: 600, marginBottom: '1rem' }}>
            WHAT LOANLENS DOES
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Beyond EMI calculation.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              ref={el => featureRefs.current[i] = el}
              className="feature-card"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${visibleSections.has(i) ? f.color + '33' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 20,
                padding: '2rem',
                opacity: visibleSections.has(i) ? 1 : 0,
                transform: visibleSections.has(i) ? 'translateY(0)' : 'translateY(30px)',
                transition: `all 0.6s ease ${i * 0.15}s`,
              }}>
              <div style={{ fontSize: 28, marginBottom: '1rem' }}>{f.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>{f.title}</div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif", fontWeight: 300, marginBottom: '1.5rem' }}>
                {f.desc}
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 12px',
                background: `${f.color}15`,
                border: `1px solid ${f.color}30`,
                borderRadius: 20,
                fontSize: 11, color: f.color, fontWeight: 600, letterSpacing: '0.04em'
              }}>
                ✓ {f.stat}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: '8rem 2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', width: 800, height: 800,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none'
        }} />
        <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1.5rem' }}>
            Your loans.
            <br />
            <span style={{ color: '#3b82f6' }}>Fully understood.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '2.5rem', fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 18 }}>
            Free. No credit check. No bank account needed.
          </p>
          <button className="hero-btn hero-btn-primary" style={{ fontSize: 16, padding: '18px 48px' }}
            onClick={() => navigate('/register')}>
            Start analysing for free →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '2rem',
        textAlign: 'center',
        fontSize: 13,
        color: 'rgba(255,255,255,0.2)',
        fontFamily: "'DM Sans', sans-serif"
      }}>
        LoanLens — Built as a Java Fullstack portfolio project. Not financial advice.
      </footer>
    </div>
  )
}
