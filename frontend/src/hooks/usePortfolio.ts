import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './useAppDispatch'
import { fetchPortfolio } from '@/store/slices/portfolioSlice'

export function usePortfolio() {
  const dispatch = useAppDispatch()
  const { data, loading, error } = useAppSelector(s => s.portfolio)

  useEffect(() => {
    if (!data && !loading) dispatch(fetchPortfolio())
  }, [])

  return { portfolio: data, loading, error, refresh: () => dispatch(fetchPortfolio()) }
}
