import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import loanReducer from './slices/loanSlice'
import portfolioReducer from './slices/portfolioSlice'
import stressReducer from './slices/stressSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    loans: loanReducer,
    portfolio: portfolioReducer,
    stress: stressReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
