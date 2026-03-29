import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '@/services/api'

type State = 'idle' | 'loading' | 'success' | 'error' | 'invalid'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [state, setState] = useState<State>(token ? 'idle' : 'invalid')
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); setState('error'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); setState('error'); return }
    setState('loading')
    try {
      await api.post('/auth/reset-password', { token, newPassword: password })
      setState('success')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Reset link expired or invalid. Please request a new one.')
      setState('error')
    }
  }

  return (
    <div style={{
      minHeight:'100vh', background:'#08060f',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:"'Roboto',sans-serif", position:'relative', overflow:'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes checkDraw { from{stroke-dashoffset:100} to{stroke-dashoffset:0} }
        @keyframes progressGrow { from{width:0%} to{width:100%} }
        @keyframes shake  { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-10px)} 40%{transform:translateX(10px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
        .pass-input {
          width:100%; padding:14px 44px 14px 16px;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:12px; color:#fff;
          font-family:'Roboto',sans-serif; font-size:15px;
          outline:none; transition:all 0.2s;
        }
        .pass-input:focus { border-color:rgba(139,92,246,0.6); background:rgba(139,92,246,0.06); box-shadow:0 0 0 3px rgba(139,92,246,0.1); }
        .pass-input::placeholder { color:rgba(255,255,255,0.2); }
        .submit-btn {
          width:100%; padding:14px; border-radius:50px; border:none;
          font-family:'Roboto',sans-serif; font-size:15px; font-weight:700;
          letter-spacing:0.05em; cursor:pointer; transition:all 0.25s;
          display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .submit-btn:hover:not(:disabled) { transform:translateY(-2px); }
      `}</style>

      <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', top:'-10%', left:'-10%', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', bottom:'-10%', right:'-10%', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:440, margin:'0 1rem', animation:'fadeUp 0.5s ease' }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <Link to="/" style={{ textDecoration:'none' }}>
            <div style={{ fontSize:26, fontFamily:"'Syne',sans-serif", fontWeight:800, color:'#fff', letterSpacing:'-0.5px' }}>
              Loan<span style={{ color:'#8b5cf6' }}>Lens</span>
            </div>
          </Link>
        </div>

        {/* Invalid token */}
        {state === 'invalid' && (
          <div style={{ background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:20, padding:'3rem', textAlign:'center' }}>
            <div style={{ fontSize:52, marginBottom:'1rem' }}>🔗</div>
            <div style={{ fontSize:20, fontWeight:700, color:'#ef4444', marginBottom:8, fontFamily:"'Syne',sans-serif" }}>Invalid Link</div>
            <div style={{ fontSize:14, color:'rgba(255,255,255,0.4)', marginBottom:'1.5rem' }}>
              This reset link is missing or invalid. Please request a new one.
            </div>
            <Link to="/forgot-password" style={{
              display:'inline-block', padding:'10px 28px',
              background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
              borderRadius:50, color:'#ef4444', textDecoration:'none', fontSize:14, fontWeight:500
            }}>Request New Link</Link>
          </div>
        )}

        {/* Success */}
        {state === 'success' && (
          <div style={{ background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:20, padding:'3rem', textAlign:'center', animation:'fadeUp 0.4s ease' }}>
            <div style={{
              width:80, height:80, borderRadius:'50%',
              background:'rgba(16,185,129,0.1)', border:'2px solid rgba(16,185,129,0.4)',
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 1.25rem', animation:'float 3s ease-in-out infinite',
              boxShadow:'0 15px 40px rgba(16,185,129,0.25)'
            }}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M8 18L15 25L28 11" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="100" strokeDashoffset="100"
                  style={{ animation:'checkDraw 0.6s ease 0.2s forwards' }} />
              </svg>
            </div>
            <div style={{ fontSize:22, fontWeight:700, color:'#10b981', marginBottom:8, fontFamily:"'Syne',sans-serif" }}>Password Reset!</div>
            <div style={{ fontSize:14, color:'rgba(255,255,255,0.4)', marginBottom:'1.5rem' }}>
              Your password has been updated successfully.<br/>Redirecting you to login...
            </div>
            <div style={{ height:3, borderRadius:3, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:3, background:'linear-gradient(90deg,#10b981,#34d399)', animation:'progressGrow 3s ease both', boxShadow:'0 0 10px rgba(16,185,129,0.5)' }} />
            </div>
          </div>
        )}

        {/* Form */}
        {(state === 'idle' || state === 'loading' || state === 'error') && (
          <div style={{
            background:'rgba(255,255,255,0.03)',
            border:`1px solid ${state === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius:20, padding:'2.5rem',
            animation: state === 'error' ? 'shake 0.4s ease' : 'none',
            transition:'border-color 0.3s'
          }}>
            <div style={{ marginBottom:'1.5rem' }}>
              <div style={{ fontSize:28, fontWeight:800, color:'#fff', fontFamily:"'Syne',sans-serif", marginBottom:8 }}>
                Reset Password
              </div>
              <div style={{ fontSize:14, color:'rgba(255,255,255,0.4)', fontWeight:300 }}>
                Choose a strong new password for your account.
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
              <div style={{ marginBottom:'1.25rem' }}>
                <label style={{ display:'block', fontSize:12, color:'rgba(255,255,255,0.35)', marginBottom:8, letterSpacing:'0.08em' }}>
                  NEW PASSWORD
                </label>
                <div style={{ position:'relative' }}>
                  <input type={showPass ? 'text' : 'password'}
                    placeholder="Min 8 characters" className="pass-input"
                    value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.3)', fontSize:16 }}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom:'2rem' }}>
                <label style={{ display:'block', fontSize:12, color:'rgba(255,255,255,0.35)', marginBottom:8, letterSpacing:'0.08em' }}>
                  CONFIRM PASSWORD
                </label>
                <div style={{ position:'relative' }}>
                  <input type={showPass ? 'text' : 'password'}
                    placeholder="Repeat your password" className="pass-input"
                    value={confirm} onChange={e => setConfirm(e.target.value)} required />
                  {confirm && (
                    <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontSize:14 }}>
                      {password === confirm ? '✅' : '❌'}
                    </span>
                  )}
                </div>
              </div>

              {/* Password strength */}
              {password.length > 0 && (
                <div style={{ marginBottom:'1.5rem' }}>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginBottom:6, letterSpacing:'0.08em' }}>PASSWORD STRENGTH</div>
                  <div style={{ display:'flex', gap:4 }}>
                    {[1,2,3,4].map(i => {
                      const strength = password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password) ? 4
                        : password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 3
                        : password.length >= 8 ? 2 : 1
                      const colors = ['#ef4444','#f59e0b','#3b82f6','#10b981']
                      return <div key={i} style={{ flex:1, height:4, borderRadius:2, background: i <= strength ? colors[strength-1] : 'rgba(255,255,255,0.08)', transition:'background 0.3s' }} />
                    })}
                  </div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:4 }}>
                    {password.length < 8 ? 'Too short' : password.length < 10 ? 'Fair — try adding numbers' : /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password) ? 'Very strong! 💪' : 'Good — add symbols for stronger'}
                  </div>
                </div>
              )}

              <button type="submit" disabled={state === 'loading'} className="submit-btn"
                style={{
                  background: state === 'loading' ? 'rgba(139,92,246,0.4)' : 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
                  color:'#fff', boxShadow: state === 'loading' ? 'none' : '0 4px 24px rgba(139,92,246,0.4)',
                  marginBottom:'1.5rem'
                }}>
                {state === 'loading' ? (
                  <>
                    <div style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'spin 0.8s linear infinite' }} />
                    Resetting...
                  </>
                ) : 'Reset Password ✓'}
              </button>

              <div style={{ textAlign:'center', fontSize:13, color:'rgba(255,255,255,0.3)' }}>
                <Link to="/login" style={{ color:'#a78bfa', textDecoration:'none', fontWeight:500 }}>← Back to Login</Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
