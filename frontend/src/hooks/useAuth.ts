import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from './useAppDispatch'

export function useAuth() {
  const user = useAppSelector(s => s.auth.user)
  return { user, isAuthenticated: !!user }
}

export function useRequireAuth() {
  const { user } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if (!user) navigate('/login', { replace: true })
  }, [user])
  return user
}
