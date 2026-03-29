import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '@/services/api'

type State = 'idle' | 'loading' | 'sent' | 'error'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setState('loading')
    try {
      await api.post('/auth/forgot-password', { email })
      setState('sent')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.')
      setState('error')
      setTimeout(() => setState('idle'), 3000)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#08060f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Roboto', sans-serif", position: 'relative', overflow: 'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-10px)} 40%{transform:translateX(10px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
        .email-input {
          width:100%; padding:14px 16px;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:12px; color:#fff;
          font-family:'Roboto',sans-serif; font-size:15px;
          outline:none; transition:all 0.2s;
        }
        .email-input:focus { border-color:rgba(139,92,246,0.6); background:rgba(139,92,246,0.06); box-shadow:0 0 0 3px rgba(139,92,246,0.1); }
        .email-input::placeholder { color:rgba(255,255,255,0.2); }
        .submit-btn {
          width:100%; padding:14px; border-radius:50px; border:none;
          font-family:'Roboto',sans-serif; font-size:15px; font-weight:700;
          letter-spacing:0.05em; cursor:pointer; transition:all 0.25s;
          display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .submit-btn:hover:not(:disabled) { transform:translateY(-2px); }
      `}</style>

      <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', top:'-10%', left:'-10%', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', bottom:'-10%', right:'-10%', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:440, margin:'0 1rem', animation:'fadeUp 0.5s ease' }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <Link to="/" style={{ textDecoration:'none' }}>
            <div style={{ fontSize:26, fontFamily:"'Syne',sans-serif", fontWeight:800, color:'#fff', letterSpacing:'-0.5px' }}>
              Loan<span style={{ color:'#8b5cf6' }}>Lens</span>
            </div>
          </Link>
        </div>

        {state === 'sent' ? (
          <div style={{
            background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.3)',
            borderRadius:20, padding:'3rem 2.5rem', textAlign:'center',
            animation:'fadeUp 0.4s ease'
          }}>
            <div style={{ fontSize:56, marginBottom:'1rem', animation:'float 3s ease-in-out infinite' }}>📧</div>
            <div style={{ fontSize:22, fontWeight:700, color:'#10b981', marginBottom:10, fontFamily:"'Syne',sans-serif" }}>
              Check your inbox!
            </div>
            <div style={{ fontSize:14, color:'rgba(255,255,255,0.5)', lineHeight:1.7, marginBottom:'1.5rem' }}>
              We sent a password reset link to<br/>
              <span style={{ color:'#fff', fontWeight:500 }}>{email}</span>
            </div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginBottom:'1.5rem' }}>
              Didn't receive it? Check spam or try again in a few minutes.
            </div>
            <Link to="/login" style={{
              display:'inline-block', padding:'10px 28px',
              background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.3)',
              borderRadius:50, color:'#a78bfa', textDecoration:'none',
              fontSize:14, fontWeight:500, transition:'all 0.2s'
            }}>← Back to Login</Link>
          </div>
        ) : (
          <div style={{
            background:'rgba(255,255,255,0.03)', border:`1px solid ${state === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius:20, padding:'2.5rem',
            animation: state === 'error' ? 'shake 0.4s ease' : 'none',
            transition:'border-color 0.3s'
          }}>
            <div style={{ marginBottom:'1.5rem' }}>
              <div style={{ fontSize:28, fontWeight:800, color:'#fff', fontFamily:"'Syne',sans-serif", marginBottom:8 }}>
                Forgot Password?
              </div>
              <div style={{ fontSize:14, color:'rgba(255,255,255,0.4)', fontFamily:"'Roboto',sans-serif", fontWeight:300 }}>
                Enter your registered email and we'll send you a reset link.
              </div>
            </div>

            {state === 'error' && (
              <div style={{
                background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
                borderRadius:10, padding:'10px 14px', marginBottom:'1.25rem',
                fontSize:13, color:'#ef4444', display:'flex', alignItems:'center', gap:8
              }}>
                <span>⚠</span>{error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom:'1.5rem' }}>
                <label style={{ display:'block', fontSize:12, color:'rgba(255,255,255,0.35)', marginBottom:8, letterSpacing:'0.08em' }}>
                  EMAIL ADDRESS
                </label>
                <input
                  type="email" placeholder="you@example.com"
                  className="email-input"
                  value={email} onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" disabled={state === 'loading'} className="submit-btn"
                style={{
                  background: state === 'loading' ? 'rgba(139,92,246,0.4)' : 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
                  color:'#fff', boxShadow: state === 'loading' ? 'none' : '0 4px 24px rgba(139,92,246,0.4)',
                  marginBottom:'1.5rem'
                }}>
                {state === 'loading' ? (
                  <>
                    <div style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'spin 0.8s linear infinite' }} />
                    Sending link...
                  </>
                ) : 'Send Reset Link →'}
              </button>

              <div style={{ textAlign:'center', fontSize:13, color:'rgba(255,255,255,0.3)' }}>
                Remember your password?{' '}
                <Link to="/login" style={{ color:'#a78bfa', textDecoration:'none', fontWeight:500 }}>Sign in</Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
