import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { logout } from '@/store/slices/authSlice'

export default function Layout() {
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((s: RootState) => s.auth.user)
  const navigate = useNavigate()

  const handleLogout = () => { dispatch(logout()); navigate('/login') }

  const navItems = [
    { to: '/app', label: 'Dashboard', icon: '⬡' },
    { to: '/app/loans', label: 'My Loans', icon: '◈' },
    { to: '/app/portfolio', label: 'Portfolio', icon: '◎' },
    { to: '/app/stress', label: 'Stress Test', icon: '⚡' },
    { to: '/app/affordability', label: 'Affordability', icon: '◉' }
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{
        width: 240, background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '1.5rem 0', flexShrink: 0
      }}>
        <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-bright)', letterSpacing: '-0.5px', cursor: 'pointer' }}
            onClick={() => navigate('/app')}>
            LoanLens
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Risk Analyzer</div>
        </div>
        <div style={{ flex: 1, padding: '1rem 0.75rem' }}>
          {navItems.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} end={to === '/app'} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
              borderRadius: 'var(--radius-sm)', marginBottom: 2, fontSize: 14, fontWeight: 500,
              color: isActive ? 'var(--accent-bright)' : 'var(--text-muted)',
              background: isActive ? 'rgba(59,130,246,0.1)' : 'transparent',
              transition: 'all 0.1s', textDecoration: 'none'
            })}>
              <span style={{ fontSize: 16 }}>{icon}</span>{label}
            </NavLink>
          ))}
        </div>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{user?.name}</div>
          <button className="btn btn-ghost" style={{ width: '100%', fontSize: 13 }} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </nav>
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}