import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from './store'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import LoansPage from './pages/LoansPage'
import PortfolioPage from './pages/PortfolioPage'
import StressPage from './pages/StressPage'
import AffordabilityPage from './pages/AffordabilityPage'
import Layout from './components/common/Layout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useSelector((s: RootState) => s.auth.user)
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="loans" element={<LoansPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="stress" element={<StressPage />} />
          <Route path="affordability" element={<AffordabilityPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
