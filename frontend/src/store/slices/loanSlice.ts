import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { loanApi, LoanRequest, LoanResponse } from '@/services/api'

interface LoanState { loans: LoanResponse[]; loading: boolean; error: string | null }
const initialState: LoanState = { loans: [], loading: false, error: null }

export const fetchLoans = createAsyncThunk('loans/fetch', async (_, { rejectWithValue }) => {
  try { const { data } = await loanApi.getAll(); return data }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed to fetch loans') }
})
export const addLoan = createAsyncThunk('loans/add', async (req: LoanRequest, { rejectWithValue }) => {
  try { const { data } = await loanApi.add(req); return data }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed to add loan') }
})
export const deleteLoan = createAsyncThunk('loans/delete', async (id: string, { rejectWithValue }) => {
  try { await loanApi.delete(id); return id }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed to delete loan') }
})

const loanSlice = createSlice({
  name: 'loans', initialState,
  reducers: { clearError: (s) => { s.error = null } },
  extraReducers: (b) => {
    b.addCase(fetchLoans.pending, (s) => { s.loading = true })
     .addCase(fetchLoans.fulfilled, (s, a) => { s.loading = false; s.loans = a.payload })
     .addCase(fetchLoans.rejected, (s, a) => { s.loading = false; s.error = a.payload as string })
     .addCase(addLoan.fulfilled, (s, a) => { s.loans.push(a.payload) })
     .addCase(deleteLoan.fulfilled, (s, a) => { s.loans = s.loans.filter(l => l.id !== a.payload) })
  }
})
export const { clearError } = loanSlice.actions
export default loanSlice.reducer
