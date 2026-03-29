import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { register as registerUser } from '@/store/slices/authSlice'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'

const schema = z.object({
  name: z.string().min(2, 'Min 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
  monthlyIncome: z.coerce.number().min(0).optional(),
  monthlyExpenses: z.coerce.number().min(0).optional(),
  monthlySipCommitment: z.coerce.number().min(0).optional(),
  emergencyBufferTarget: z.coerce.number().min(0).optional(),
  dependents: z.coerce.number().min(0).max(20).optional()
})
type Form = z.infer<typeof schema>
type AnimState = 'idle' | 'loading' | 'success' | 'error'

export default function RegisterPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { error, user } = useSelector((s: RootState) => s.auth)
  const navigate = useNavigate()

  // ── Read pre-filled email from URL (e.g. /register?email=varun@gmail.com) ──
  const [searchParams] = useSearchParams()
  const prefillEmail = searchParams.get('email') || ''

  const [animState, setAnimState] = useState<AnimState>('idle')
  const [step, setStep] = useState(1)

  const { register, handleSubmit, formState: { errors }, trigger } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: prefillEmail }  // pre-fill email if coming from login
  })

  useEffect(() => {
    if (user) { setAnimState('success'); setTimeout(() => navigate('/app'), 2000) }
  }, [user])

  useEffect(() => {
    if (error) { setAnimState('error'); setTimeout(() => setAnimState('idle'), 2500) }
  }, [error])

  const goNext = async () => {
    const valid = await trigger(['name', 'email', 'password'])
    if (valid) setStep(2)
  }

  const onSubmit = async (data: Form) => {
    setAnimState('loading')
    await dispatch(registerUser(data))
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#050810',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem', fontFamily: "'Syne', 'DM Sans', sans-serif",
      position: 'relative', overflow: 'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideRight  { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideLeft   { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes success-burst { 0%{transform:scale(0.5);opacity:0} 50%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
        @keyframes spin-ring   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes confetti-fall { 0%{transform:translateY(-20px) rotate(0deg);opacity:1} 100%{transform:translateY(80px) rotate(360deg);opacity:0} }
        @keyframes error-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes progress-fill { from{width:0%} to{width:100%} }
        @keyframes prefillGlow { 0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,0)} 50%{box-shadow:0 0 0 4px rgba(59,130,246,0.15)} }

        .reg-input {
          width:100%; padding:13px 16px;
          background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08);
          border-radius:12px; color:#fff;
          font-family:'DM Sans',sans-serif; font-size:14px;
          outline:none; transition:all 0.2s ease;
        }
        .reg-input:focus { border-color:rgba(59,130,246,0.5); background:rgba(59,130,246,0.05); box-shadow:0 0 0 3px rgba(59,130,246,0.08); }
        .reg-input::placeholder { color:rgba(255,255,255,0.18); }
        .reg-input.err { border-color:rgba(239,68,68,0.4); }
        .reg-input.prefilled { border-color:rgba(59,130,246,0.3); background:rgba(59,130,246,0.06); animation:prefillGlow 1.5s ease 0.3s; }

        .submit-btn {
          width:100%; padding:14px; border-radius:12px; border:none;
          cursor:pointer; font-family:'Syne',sans-serif; font-size:14px;
          font-weight:700; letter-spacing:0.05em; text-transform:uppercase;
          transition:all 0.2s ease; display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .submit-btn:hover:not(:disabled) { transform:translateY(-1px); }
      `}</style>

      {/* Background orbs */}
      <div style={{position:'absolute',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(16,185,129,0.07) 0%,transparent 70%)',top:'-20%',right:'-20%',pointerEvents:'none'}}/>
      <div style={{position:'absolute',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(59,130,246,0.07) 0%,transparent 70%)',bottom:'-10%',left:'-10%',pointerEvents:'none'}}/>

      <div style={{ width:'100%', maxWidth:500, animation:'fadeSlideUp 0.5s ease' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
          <Link to="/" style={{ textDecoration:'none' }}>
            <div style={{ fontSize:26, fontWeight:800, color:'#fff', letterSpacing:'-0.5px' }}>
              Loan<span style={{ color:'#3b82f6' }}>Lens</span>
            </div>
          </Link>
        </div>

        {/* Pre-fill notice */}
        {prefillEmail && (
          <div style={{
            background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)',
            borderRadius:12, padding:'10px 16px', marginBottom:'1rem',
            display:'flex', alignItems:'center', gap:10, animation:'fadeSlideUp 0.4s ease'
          }}>
            <span style={{ fontSize:16 }}>👋</span>
            <span style={{ fontSize:13, color:'rgba(59,130,246,0.9)', fontFamily:"'DM Sans',sans-serif" }}>
              Creating account for <strong style={{ color:'#60a5fa' }}>{prefillEmail}</strong>
            </span>
          </div>
        )}

        {/* Success State */}
        {animState === 'success' ? (
          <div style={{
            background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.25)',
            borderRadius:20, padding:'3rem 2rem', textAlign:'center',
            animation:'success-burst 0.5s ease', position:'relative', overflow:'hidden'
          }}>
            {Array.from({length:20}).map((_,i) => (
              <div key={i} style={{
                position:'absolute', width:8, height:8,
                borderRadius: i%3===0 ? '50%' : 2,
                background:['#3b82f6','#10b981','#f59e0b','#8b5cf6'][i%4],
                top:'20%', left:`${5+(i*4.5)}%`,
                animation:`confetti-fall ${0.8+Math.random()*0.8}s ease ${i*0.08}s both`,
              }}/>
            ))}
            <div style={{
              width:90, height:90, borderRadius:'50%',
              background:'rgba(16,185,129,0.12)', border:'2px solid rgba(16,185,129,0.4)',
              display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem'
            }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M8 20L17 29L32 12" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ fontSize:26, fontWeight:800, color:'#10b981', marginBottom:8 }}>Account created! 🎉</div>
            <div style={{ fontSize:14, color:'rgba(255,255,255,0.4)', fontFamily:"'DM Sans',sans-serif", marginBottom:4 }}>Your LoanLens account is ready.</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.25)', fontFamily:"'DM Sans',sans-serif" }}>Redirecting to your dashboard...</div>
          </div>
        ) : (
          <div style={{
            background:'rgba(255,255,255,0.03)',
            border:`1px solid ${animState==='error'?'rgba(239,68,68,0.35)':'rgba(255,255,255,0.07)'}`,
            borderRadius:20, padding:'2rem',
            animation: animState==='error' ? 'error-shake 0.4s ease' : 'none',
            transition:'border-color 0.3s ease'
          }}>
            {/* Step indicator */}
            <div style={{ display:'flex', gap:8, marginBottom:'1.5rem', alignItems:'center' }}>
              {[1,2].map(s => (
                <div key={s} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{
                    width:28, height:28, borderRadius:'50%',
                    background: step>=s ? '#3b82f6' : 'rgba(255,255,255,0.08)',
                    border: step===s ? '2px solid #60a5fa' : '2px solid transparent',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:12, fontWeight:700, color: step>=s ? '#fff' : 'rgba(255,255,255,0.3)',
                    transition:'all 0.3s ease'
                  }}>{s}</div>
                  <span style={{ fontSize:12, color: step===s ? '#fff' : 'rgba(255,255,255,0.3)', transition:'color 0.3s' }}>
                    {s===1 ? 'Account' : 'Financial Profile'}
                  </span>
                  {s<2 && <div style={{ width:30, height:1, background: step>s ? '#3b82f6' : 'rgba(255,255,255,0.1)', transition:'background 0.3s' }}/>}
                </div>
              ))}
            </div>

            {/* Error banner */}
            {animState === 'error' && (
              <div style={{
                background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)',
                borderRadius:10, padding:'10px 14px', marginBottom:'1.25rem',
                fontSize:13, color:'#ef4444', display:'flex', gap:8,
                animation:'fadeSlideUp 0.3s ease', fontFamily:"'DM Sans',sans-serif"
              }}>
                <span>✕</span>{error || 'Something went wrong. Please try again.'}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Step 1 */}
              {step === 1 && (
                <div style={{ animation:'slideRight 0.3s ease' }}>
                  <div style={{ marginBottom:'1rem' }}>
                    <label style={{ display:'block', fontSize:12, color:'rgba(255,255,255,0.35)', marginBottom:7, fontFamily:"'DM Sans',sans-serif", letterSpacing:'0.05em' }}>FULL NAME</label>
                    <input placeholder="Varun Nataraj" className={`reg-input${errors.name?' err':''}`} {...register('name')}/>
                    {errors.name && <div style={{ fontSize:11, color:'#ef4444', marginTop:5 }}>{errors.name.message}</div>}
                  </div>
                  <div style={{ marginBottom:'1rem' }}>
                    <label style={{ display:'block', fontSize:12, color:'rgba(255,255,255,0.35)', marginBottom:7, fontFamily:"'DM Sans',sans-serif", letterSpacing:'0.05em' }}>EMAIL</label>
                    <input type="email" placeholder="you@example.com"
                      className={`reg-input${errors.email?' err':''} ${prefillEmail?'prefilled':''}`}
                      {...register('email')}/>
                    {prefillEmail && <div style={{ fontSize:11, color:'rgba(59,130,246,0.7)', marginTop:4, fontFamily:"'DM Sans',sans-serif" }}>✓ Pre-filled from login</div>}
                    {errors.email && <div style={{ fontSize:11, color:'#ef4444', marginTop:5 }}>{errors.email.message}</div>}
                  </div>
                  <div style={{ marginBottom:'1.5rem' }}>
                    <label style={{ display:'block', fontSize:12, color:'rgba(255,255,255,0.35)', marginBottom:7, fontFamily:"'DM Sans',sans-serif", letterSpacing:'0.05em' }}>PASSWORD</label>
                    <input type="password" placeholder="Min 8 characters" className={`reg-input${errors.password?' err':''}`} {...register('password')}/>
                    {errors.password && <div style={{ fontSize:11, color:'#ef4444', marginTop:5 }}>{errors.password.message}</div>}
                  </div>
                  <button type="button" className="submit-btn" onClick={goNext}
                    style={{ background:'linear-gradient(135deg,#3b82f6,#2563eb)', color:'#fff', boxShadow:'0 0 25px rgba(59,130,246,0.25)' }}>
                    Continue →
                  </button>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div style={{ animation:'slideLeft 0.3s ease' }}>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)', marginBottom:'1.25rem', fontFamily:"'DM Sans',sans-serif" }}>
                    For accurate stress testing and affordability scoring
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.875rem', marginBottom:'1.25rem' }}>
                    {[
                      {label:'MONTHLY INCOME (₹)',name:'monthlyIncome',placeholder:'80000'},
                      {label:'MONTHLY EXPENSES (₹)',name:'monthlyExpenses',placeholder:'25000'},
                      {label:'MONTHLY SIP (₹)',name:'monthlySipCommitment',placeholder:'5000'},
                      {label:'EMERGENCY FUND TARGET (₹)',name:'emergencyBufferTarget',placeholder:'300000'},
                    ].map(f => (
                      <div key={f.name}>
                        <label style={{ display:'block', fontSize:11, color:'rgba(255,255,255,0.3)', marginBottom:6, fontFamily:"'DM Sans',sans-serif", letterSpacing:'0.05em' }}>{f.label}</label>
                        <input type="number" placeholder={f.placeholder} className="reg-input" style={{ fontSize:13 }} {...register(f.name as any)}/>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom:'1.5rem', maxWidth:160 }}>
                    <label style={{ display:'block', fontSize:11, color:'rgba(255,255,255,0.3)', marginBottom:6, fontFamily:"'DM Sans',sans-serif", letterSpacing:'0.05em' }}>DEPENDENTS</label>
                    <input type="number" min={0} max={20} placeholder="0" className="reg-input" style={{ fontSize:13 }} {...register('dependents')}/>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:10 }}>
                    <button type="button" className="submit-btn" onClick={()=>setStep(1)}
                      style={{ background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.5)', border:'1px solid rgba(255,255,255,0.1)' }}>
                      ← Back
                    </button>
                    <button type="submit" disabled={animState==='loading'} className="submit-btn"
                      style={{
                        background: animState==='loading' ? 'rgba(16,185,129,0.3)' : 'linear-gradient(135deg,#10b981,#059669)',
                        color:'#fff', boxShadow: animState==='loading' ? 'none' : '0 0 25px rgba(16,185,129,0.25)'
                      }}>
                      {animState==='loading' ? (
                        <><div style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'spin-ring 0.8s linear infinite' }}/> Creating...</>
                      ) : 'Create Account ✓'}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div style={{ textAlign:'center', marginTop:'1.25rem', fontSize:13, color:'rgba(255,255,255,0.25)', fontFamily:"'DM Sans',sans-serif" }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color:'#60a5fa', textDecoration:'none', fontWeight:500 }}>Sign in</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}