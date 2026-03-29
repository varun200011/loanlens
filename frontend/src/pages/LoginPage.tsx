import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { login, clearError } from '@/store/slices/authSlice'
import { useNavigate, Link } from 'react-router-dom'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters')
})
type Form = z.infer<typeof schema>

const MAX_ATTEMPTS = 5
const LOCKOUT_MS   = 10 * 60 * 1000
const STORAGE_KEY  = 'll_login_attempts'

interface AttemptData { count: number; lockedUntil: number | null }

function getAttempts(): AttemptData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { count: 0, lockedUntil: null }
    const d = JSON.parse(raw) as AttemptData
    if (d.lockedUntil && Date.now() > d.lockedUntil) {
      localStorage.removeItem(STORAGE_KEY); return { count: 0, lockedUntil: null }
    }
    return d
  } catch { return { count: 0, lockedUntil: null } }
}
function saveAttempts(d: AttemptData) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)) }
function recordFail(): AttemptData {
  const d = getAttempts()
  const count = d.count + 1
  const lockedUntil = count >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : null
  const updated = { count, lockedUntil }
  saveAttempts(updated); return updated
}
function resetAttempts() { localStorage.removeItem(STORAGE_KEY) }
function fmt(ms: number): string {
  if (ms <= 0) return '0:00'
  return `${Math.floor(ms/60000)}:${String(Math.floor((ms%60000)/1000)).padStart(2,'0')}`
}

export default function LoginPage() {
  const dispatch   = useDispatch<AppDispatch>()
  const { error, user } = useSelector((s: RootState) => s.auth)
  const navigate   = useNavigate()

  const [showPass,    setShowPass]    = useState(false)
  const [status,      setStatus]      = useState<'idle'|'loading'|'success'|'error'|'locked'|'not_found'>('idle')
  const [attemptsLeft,setAttemptsLeft]= useState(MAX_ATTEMPTS)
  const [timeLeft,    setTimeLeft]    = useState('')
  const [lockedUntil, setLockedUntil] = useState<number|null>(null)
  const [notFoundEmail, setNotFoundEmail] = useState('')
  const submittedEmailRef = useRef('')
  const [notFoundCountdown, setNotFoundCountdown] = useState(4)

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema)
  })

  // Check lockout on mount
  useEffect(() => {
    const d = getAttempts()
    if (d.lockedUntil) { setLockedUntil(d.lockedUntil); setStatus('locked') }
    else { setAttemptsLeft(MAX_ATTEMPTS - d.count) }
  }, [])

  // Countdown timer
  useEffect(() => {
    if (!lockedUntil) return
    const tick = setInterval(() => {
      const rem = lockedUntil - Date.now()
      if (rem <= 0) {
        setLockedUntil(null); setStatus('idle')
        setAttemptsLeft(MAX_ATTEMPTS); resetAttempts()
      } else { setTimeLeft(fmt(rem)) }
    }, 1000)
    setTimeLeft(fmt(lockedUntil - Date.now()))
    return () => clearInterval(tick)
  }, [lockedUntil])

  // Success redirect
  useEffect(() => {
    if (user) { setStatus('success'); resetAttempts(); setTimeout(()=>navigate('/app'), 2200) }
  }, [user])

  const handleLoginResult = (errorMsg: string, email: string) => {
    const msg = errorMsg.toLowerCase()
    console.log('🔥 LOGIN ERROR:', JSON.stringify(errorMsg), '| lower:', msg)

    if (msg.includes('user_not_found') || msg.includes('user not found')) {
      console.log('✅ USER NOT FOUND, email:', email)
      setNotFoundEmail(email)
      setStatus('not_found')
      setNotFoundCountdown(4)
      let count = 4
      const iv = setInterval(() => {
        count -= 1
        setNotFoundCountdown(count)
        if (count <= 0) { clearInterval(iv); dispatch(clearError()) }
      }, 1000)
      setTimeout(() => navigate(`/register?email=${encodeURIComponent(email)}`), 4000)
    } else {
      const d = recordFail()
      if (d.lockedUntil) { setLockedUntil(d.lockedUntil); setStatus('locked') }
      else {
        setAttemptsLeft(MAX_ATTEMPTS - d.count)
        setStatus('error')
        dispatch(clearError())
        setTimeout(() => { setStatus('idle') }, 3500)
      }
    }
  }

  const onSubmit = async (data: Form) => {
    const d = getAttempts()
    if (d.lockedUntil) { setLockedUntil(d.lockedUntil); setStatus('locked'); return }
    const email = data.email
    submittedEmailRef.current = email
    setStatus('loading')
    setNotFoundEmail('')
    dispatch(clearError())
    const result = await dispatch(login(data))
    if (login.rejected.match(result)) {
      const errorMsg = (result.payload as string) || 'Login failed'
      handleLoginResult(errorMsg, email)
    }
  }

  const isLocked   = status === 'locked'
  const isLoading  = status === 'loading'
  const isSuccess  = status === 'success'
  const isError    = status === 'error'
  const isNotFound = status === 'not_found'

  return (
    <div style={{ minHeight:'100vh', background:'#060410', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans',sans-serif", position:'relative', overflow:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes checkDraw{from{stroke-dashoffset:80}to{stroke-dashoffset:0}}
        @keyframes progressW{from{width:0%}to{width:100%}}
        @keyframes orb1{0%,100%{transform:translate(0,0)}33%{transform:translate(60px,-40px)}66%{transform:translate(-40px,60px)}}
        @keyframes orb2{0%,100%{transform:translate(0,0)}33%{transform:translate(-50px,50px)}66%{transform:translate(70px,-30px)}}
        @keyframes shake{0%,100%{transform:translateX(0)}15%{transform:translateX(-10px)}30%{transform:translateX(10px)}45%{transform:translateX(-7px)}60%{transform:translateX(7px)}75%{transform:translateX(-4px)}90%{transform:translateX(4px)}}
        @keyframes popIn{0%{transform:scale(0.85);opacity:0}70%{transform:scale(1.03)}100%{transform:scale(1);opacity:1}}
        @keyframes countBar{from{transform:scaleX(1)}to{transform:scaleX(0)}}
        @keyframes slideRight{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}

        .inp{width:100%;background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.08);border-radius:14px;padding:14px 46px 14px 18px;color:#fff;font-family:'DM Sans',sans-serif;font-size:15px;outline:none;transition:border-color .2s,background .2s,box-shadow .2s;caret-color:#a78bfa}
        .inp:focus{border-color:rgba(167,139,250,.5);background:rgba(167,139,250,.06);box-shadow:0 0 0 4px rgba(167,139,250,.08)}
        .inp::placeholder{color:rgba(255,255,255,.2)}
        .inp.err{border-color:rgba(248,113,113,.5);background:rgba(248,113,113,.04)}
        .inp:disabled{opacity:.4;cursor:not-allowed}
        .tog{position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(255,255,255,.25);font-size:18px;transition:color .2s;line-height:1;padding:2px}
        .tog:hover{color:rgba(255,255,255,.6)}
        .btn{width:100%;padding:15px;background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;border-radius:100px;color:#fff;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;letter-spacing:.05em;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 20px rgba(124,58,237,.35)}
        .btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 30px rgba(124,58,237,.5)}
        .btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
        .lbl{display:block;font-size:11px;color:rgba(255,255,255,.3);letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px;font-weight:500}
      `}</style>

      {/* Ambient orbs */}
      <div style={{position:'fixed',inset:0,pointerEvents:'none',overflow:'hidden'}}>
        <div style={{position:'absolute',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(124,58,237,.15) 0%,transparent 70%)',top:'-15%',left:'-10%',animation:'orb1 20s ease-in-out infinite'}}/>
        <div style={{position:'absolute',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(59,130,246,.08) 0%,transparent 70%)',bottom:'-10%',right:'5%',animation:'orb2 25s ease-in-out infinite'}}/>
        <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.025}}>
          <defs><pattern id="g" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#g)"/>
        </svg>
      </div>

      {/* Card */}
      <div style={{
        width:'100%', maxWidth:980, margin:'1.5rem',
        display:'flex', borderRadius:28, overflow:'hidden', minHeight:560,
        boxShadow: isLocked ? '0 0 0 1.5px rgba(248,113,113,.25),0 40px 100px rgba(0,0,0,.8)'
          : isSuccess ? '0 0 0 1.5px rgba(52,211,153,.3),0 40px 100px rgba(0,0,0,.8)'
          : isNotFound ? '0 0 0 1.5px rgba(251,191,36,.2),0 40px 100px rgba(0,0,0,.8)'
          : '0 0 0 1.5px rgba(255,255,255,.07),0 40px 100px rgba(0,0,0,.8)',
        animation: isError ? 'shake .5s ease' : 'fadeUp .6s ease both',
        transition:'box-shadow .5s ease',
      }}>

        {/* ── LEFT: form ── */}
        <div style={{flex:'0 0 480px',background:'#0d0b1a',padding:'3.5rem',display:'flex',flexDirection:'column'}}>

          {/* Logo */}
          <Link to="/" style={{textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8,marginBottom:'2.5rem'}}>
            <div style={{width:32,height:32,borderRadius:10,background:'linear-gradient(135deg,#7c3aed,#a855f7)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 12L5 6L8 9L11 4L14 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{fontSize:16,fontWeight:700,color:'#fff',fontFamily:"'Syne',sans-serif",letterSpacing:'-.02em'}}>
              Loan<span style={{color:'#a78bfa'}}>Lens</span>
            </span>
          </Link>

          {/* Title */}
          <div style={{marginBottom:'2rem'}}>
            <h1 style={{fontSize:32,fontWeight:800,color:'#fff',fontFamily:"'Syne',sans-serif",letterSpacing:'-.03em',lineHeight:1,marginBottom:8}}>
              {isSuccess?'You\'re in! 🎉':isLocked?'Account Locked 🔐':isNotFound?'Not registered 🤔':'Welcome back'}
            </h1>
            <p style={{fontSize:14,color:'rgba(255,255,255,.35)',fontWeight:300}}>
              {isSuccess?'Redirecting to your dashboard...'
                :isLocked?`Wait ${timeLeft} before trying again`
                :isNotFound?'This email isn\'t registered yet'
                :'Sign in to your loan risk dashboard'}
            </p>
          </div>

          {/* ── SUCCESS ── */}
          {isSuccess && (
            <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'1rem',animation:'popIn .4s ease'}}>
              <div style={{width:80,height:80,borderRadius:'50%',background:'rgba(52,211,153,.1)',border:'2px solid rgba(52,211,153,.4)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 40px rgba(52,211,153,.2)'}}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <path d="M8 18L15 25L28 11" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="80" strokeDashoffset="80" style={{animation:'checkDraw .5s ease .2s forwards'}}/>
                </svg>
              </div>
              <div style={{width:'80%',height:3,borderRadius:3,background:'rgba(255,255,255,.06)',overflow:'hidden'}}>
                <div style={{height:'100%',background:'linear-gradient(90deg,#34d399,#10b981)',borderRadius:3,animation:'progressW 2s ease both',boxShadow:'0 0 10px rgba(52,211,153,.5)'}}/>
              </div>
            </div>
          )}

          {/* ── LOCKED ── */}
          {isLocked && (
            <div style={{flex:1,display:'flex',flexDirection:'column',gap:'1rem',animation:'popIn .4s ease'}}>
              <div style={{background:'rgba(248,113,113,.06)',border:'1.5px solid rgba(248,113,113,.15)',borderRadius:16,padding:'1.5rem'}}>
                <div style={{display:'flex',gap:6,marginBottom:'1rem'}}>
                  {Array.from({length:MAX_ATTEMPTS}).map((_,i)=>(
                    <div key={i} style={{width:10,height:10,borderRadius:'50%',background:'rgba(248,113,113,.8)',boxShadow:'0 0 6px rgba(248,113,113,.4)'}}/>
                  ))}
                </div>
                <div style={{fontSize:15,color:'#f87171',fontWeight:600,fontFamily:"'Syne',sans-serif",marginBottom:6}}>{MAX_ATTEMPTS} failed attempts</div>
                <div style={{fontSize:13,color:'rgba(255,255,255,.4)',marginBottom:'1rem'}}>Account temporarily locked for security.</div>
                <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:'1rem'}}>
                  <span style={{fontSize:36,fontWeight:800,color:'#f87171',fontFamily:"'Syne',sans-serif",letterSpacing:'-.03em'}}>{timeLeft}</span>
                  <span style={{fontSize:13,color:'rgba(255,255,255,.3)'}}>remaining</span>
                </div>
                <div style={{height:4,borderRadius:2,background:'rgba(248,113,113,.1)',overflow:'hidden'}}>
                  <div style={{height:'100%',background:'linear-gradient(90deg,#ef4444,#f87171)',borderRadius:2,transformOrigin:'left',animation:`countBar ${10*60}s linear both`}}/>
                </div>
              </div>
              <p style={{fontSize:12,color:'rgba(255,255,255,.25)',textAlign:'center'}}>
                Forgot your password?{' '}
                <Link to="/forgot-password" style={{color:'#a78bfa',textDecoration:'none'}}>Reset it here</Link>
              </p>
            </div>
          )}

          {/* ── USER NOT FOUND ── */}
          {isNotFound && (
            <div style={{flex:1,display:'flex',flexDirection:'column',gap:'1.25rem',animation:'popIn .4s ease'}}>
              <div style={{background:'rgba(251,191,36,.05)',border:'1.5px solid rgba(251,191,36,.15)',borderRadius:16,padding:'1.5rem'}}>
                <div style={{fontSize:32,marginBottom:12}}>🔍</div>
                <div style={{fontSize:15,color:'rgba(251,191,36,.9)',fontWeight:600,fontFamily:"'Syne',sans-serif",marginBottom:8}}>
                  No account found
                </div>
                <div style={{fontSize:13,color:'rgba(255,255,255,.45)',lineHeight:1.6,marginBottom:'1.25rem'}}>
                  <span style={{color:'rgba(255,255,255,.7)',fontWeight:500}}>{notFoundEmail}</span>
                  {' '}is not registered in LoanLens yet.
                </div>
                <div style={{fontSize:12,color:'rgba(251,191,36,.6)',marginBottom:'1rem',display:'flex',alignItems:'center',gap:6}}>
                  <div style={{width:16,height:16,borderRadius:'50%',background:'rgba(251,191,36,.15)',border:'1px solid rgba(251,191,36,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'rgba(251,191,36,.8)',fontWeight:700,flexShrink:0}}>{notFoundCountdown}</div>
                  Redirecting to sign up in {notFoundCountdown}s...
                </div>
                <Link to={`/register?email=${encodeURIComponent(notFoundEmail)}`}
                  style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,width:'100%',padding:'13px',background:'linear-gradient(135deg,#92400e,#d97706)',borderRadius:100,color:'#fff',textDecoration:'none',fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,letterSpacing:'.04em',boxShadow:'0 4px 20px rgba(217,119,6,.3)',transition:'all .2s'}}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 28px rgba(217,119,6,.45)'}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 4px 20px rgba(217,119,6,.3)'}}>
                  Create account →
                </Link>
              </div>
              <button onClick={()=>{setStatus('idle');dispatch(clearError())}}
                style={{background:'none',border:'1.5px solid rgba(255,255,255,.08)',borderRadius:100,padding:'11px',color:'rgba(255,255,255,.4)',fontFamily:"'DM Sans',sans-serif",fontSize:14,cursor:'pointer',transition:'all .2s'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,.2)';e.currentTarget.style.color='rgba(255,255,255,.7)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,.08)';e.currentTarget.style.color='rgba(255,255,255,.4)'}}>
                ← Try different email
              </button>
            </div>
          )}

          {/* ── FORM (idle / loading / error) ── */}
          {!isSuccess && !isLocked && !isNotFound && (
            <form onSubmit={handleSubmit(onSubmit)} style={{flex:1,display:'flex',flexDirection:'column'}}>

              {/* Wrong password error banner */}
              {isError && (
                <div style={{background:'rgba(248,113,113,.07)',border:'1.5px solid rgba(248,113,113,.18)',borderRadius:12,padding:'12px 16px',marginBottom:'1.25rem',animation:'fadeIn .3s ease',display:'flex',gap:10,alignItems:'flex-start'}}>
                  <span style={{color:'#f87171',fontSize:16,flexShrink:0,marginTop:1}}>⚠</span>
                  <div>
                    <div style={{fontSize:13,color:'#f87171',fontWeight:500,marginBottom:5}}>
                      {error?.includes('WRONG_PASSWORD') || error?.includes('credentials')
                        ? 'Wrong password. Please try again.'
                        : error || 'Incorrect email or password'}
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      {Array.from({length:MAX_ATTEMPTS}).map((_,i)=>(
                        <div key={i} style={{width:8,height:8,borderRadius:'50%',background:i<attemptsLeft?'rgba(248,113,113,.6)':'rgba(255,255,255,.1)',transition:'background .3s'}}/>
                      ))}
                      <span style={{fontSize:11,color:'rgba(248,113,113,.6)',marginLeft:2}}>
                        {attemptsLeft} attempt{attemptsLeft!==1?'s':''} left before lockout
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Attempts warning */}
              {!isError && attemptsLeft < MAX_ATTEMPTS && attemptsLeft > 0 && (
                <div style={{background:'rgba(251,191,36,.06)',border:'1.5px solid rgba(251,191,36,.15)',borderRadius:10,padding:'9px 14px',marginBottom:'1rem',display:'flex',alignItems:'center',gap:8,animation:'fadeIn .3s ease'}}>
                  <span style={{fontSize:14}}>⚠️</span>
                  <span style={{fontSize:12,color:'rgba(251,191,36,.8)'}}>
                    {attemptsLeft} attempt{attemptsLeft!==1?'s':''} left before 10-min lockout
                  </span>
                </div>
              )}

              {/* Email */}
              <div style={{marginBottom:'1.25rem'}}>
                <label className="lbl">Email</label>
                <div style={{position:'relative'}}>
                  <input type="email" placeholder="you@example.com"
                    className={`inp${errors.email?' err':''}`}
                    disabled={isLoading}
                    {...register('email')}/>
                  <span style={{position:'absolute',right:16,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,.2)',fontSize:15,pointerEvents:'none'}}>✉</span>
                </div>
                {errors.email && <p style={{fontSize:11,color:'#f87171',marginTop:5}}>{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div style={{marginBottom:'.75rem'}}>
                <label className="lbl">Password</label>
                <div style={{position:'relative'}}>
                  <input type={showPass?'text':'password'} placeholder="••••••••"
                    className={`inp${errors.password?' err':''}`}
                    disabled={isLoading}
                    {...register('password')}/>
                  <button type="button" className="tog" onClick={()=>setShowPass(!showPass)} tabIndex={-1}>
                    {showPass?'🙈':'👁'}
                  </button>
                </div>
                {errors.password && <p style={{fontSize:11,color:'#f87171',marginTop:5}}>{errors.password.message}</p>}
              </div>

              {/* Forgot */}
              <div style={{textAlign:'right',marginBottom:'1.75rem'}}>
                <Link to="/forgot-password" style={{fontSize:12,color:'rgba(167,139,250,.7)',textDecoration:'none',transition:'color .2s'}}
                  onMouseEnter={e=>(e.currentTarget.style.color='#a78bfa')}
                  onMouseLeave={e=>(e.currentTarget.style.color='rgba(167,139,250,.7)')}>
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={isLoading} className="btn" style={{marginBottom:'1.25rem'}}>
                {isLoading ? (
                  <><div style={{width:17,height:17,borderRadius:'50%',border:'2px solid rgba(255,255,255,.25)',borderTopColor:'#fff',animation:'spin .7s linear infinite'}}/>Signing in...</>
                ) : 'Sign In →'}
              </button>

              <p style={{textAlign:'center',fontSize:13,color:'rgba(255,255,255,.25)'}}>
                No account?{' '}
                <Link to="/register" style={{color:'#a78bfa',textDecoration:'none',fontWeight:600}}>Create one</Link>
              </p>
            </form>
          )}
        </div>

        {/* ── RIGHT: visual panel ── */}
        <div style={{
          flex:1, position:'relative', overflow:'hidden',
          background: isSuccess ? 'linear-gradient(145deg,#052e1e,#065f3a,#0a7a47)'
            : isLocked ? 'linear-gradient(145deg,#1a0505,#3b0f0f,#4c1414)'
            : isNotFound ? 'linear-gradient(145deg,#1a1200,#3d2e00,#4a3800)'
            : 'linear-gradient(145deg,#130828,#1e0d42,#2a1060,#1a0840)',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          padding:'3rem', textAlign:'center', transition:'background .7s ease',
        }}>
          <div style={{position:'absolute',width:320,height:320,borderRadius:'50%',border:'1px solid rgba(255,255,255,.04)',top:-80,right:-80,pointerEvents:'none'}}/>
          <div style={{position:'absolute',width:220,height:220,borderRadius:'50%',border:'1px solid rgba(255,255,255,.03)',bottom:-60,left:-60,pointerEvents:'none'}}/>

          <div style={{fontSize:64,marginBottom:'1.5rem',filter:'drop-shadow(0 8px 24px rgba(0,0,0,.5))',lineHeight:1}}>
            {isSuccess?'🎉':isLocked?'🔐':isNotFound?'🤔':isLoading?'⏳':'👋'}
          </div>

          <h2 style={{fontSize:38,fontWeight:800,color:'#fff',fontFamily:"'Syne',sans-serif",letterSpacing:'-.03em',lineHeight:1.05,marginBottom:'1rem',textAlign:'center',textShadow:'0 4px 20px rgba(0,0,0,.5)'}}>
            {isSuccess?'Welcome\nBack!'
              :isLocked?'Access\nPaused'
              :isNotFound?'New\nHere?'
              :isLoading?'Just a\nMoment...'
              :'Welcome\nBack!'}
          </h2>

          <p style={{fontSize:14,color:'rgba(255,255,255,.45)',textAlign:'center',lineHeight:1.7,maxWidth:200,fontWeight:300}}>
            {isSuccess?'Your dashboard is ready.'
              :isLocked?`Security lockout active.\n${timeLeft} remaining.`
              :isNotFound?'This email has no account.\nCreate one to get started.'
              :isLoading?'Verifying your credentials.'
              :'Your loan risk intelligence platform.'}
          </p>

          {/* Feature pills — only on idle */}
          {!isSuccess && !isLocked && !isNotFound && !isLoading && (
            <div style={{position:'absolute',bottom:28,display:'flex',flexDirection:'column',gap:8,width:'calc(100% - 4rem)'}}>
              {[
                {icon:'📊',label:'Real-time risk analysis'},
                {icon:'🛡',label:'BCrypt encrypted passwords'},
                {icon:'⚡',label:'JWT secured sessions'},
              ].map((f,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.06)',borderRadius:10,padding:'8px 14px',animation:`fadeIn .4s ease ${i*.1}s both`}}>
                  <span style={{fontSize:14}}>{f.icon}</span>
                  <span style={{fontSize:12,color:'rgba(255,255,255,.4)',fontFamily:"'DM Sans',sans-serif"}}>{f.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}