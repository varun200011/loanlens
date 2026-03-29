import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { portfolioApi, PortfolioSummary } from '@/services/api'

interface PortfolioState { data: PortfolioSummary | null; loading: boolean; error: string | null }
const initialState: PortfolioState = { data: null, loading: false, error: null }

export const fetchPortfolio = createAsyncThunk('portfolio/fetch', async (_, { rejectWithValue }) => {
  try { const { data } = await portfolioApi.getSummary(); return data }
  catch (e: any) { return rejectWithValue(e.response?.data?.message || 'Failed to fetch portfolio') }
})

const portfolioSlice = createSlice({
  name: 'portfolio', initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchPortfolio.pending, (s) => { s.loading = true })
     .addCase(fetchPortfolio.fulfilled, (s, a) => { s.loading = false; s.data = a.payload })
     .addCase(fetchPortfolio.rejected, (s, a) => { s.loading = false; s.error = a.payload as string })
  }
})
export default portfolioSlice.reducer
