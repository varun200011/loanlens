import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { stressApi, StressRequest, StressResponse } from '@/services/api'

interface StressState { result: StressResponse | null; loading: boolean; error: string | null }
const initialState: StressState = { result: null, loading: false, error: null }

export const runStress = createAsyncThunk('stress/run', async (req: StressRequest, { rejectWithValue }) => {
  try { const { data } = await stressApi.simulate(req); return data }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Simulation failed') }
})

const stressSlice = createSlice({
  name: 'stress', initialState,
  reducers: { clearResult: (s) => { s.result = null } },
  extraReducers: (b) => {
    b.addCase(runStress.pending, (s) => { s.loading = true; s.error = null })
     .addCase(runStress.fulfilled, (s, a) => { s.loading = false; s.result = a.payload })
     .addCase(runStress.rejected, (s, a) => { s.loading = false; s.error = a.payload as string })
  }
})
export const { clearResult } = stressSlice.actions
export default stressSlice.reducer
