import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authApi, LoginRequest, RegisterRequest, AuthResponse, setToken } from '@/services/api'

interface AuthState {
  user: AuthResponse | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = { user: null, loading: false, error: null }

export const login = createAsyncThunk('auth/login', async (req: LoginRequest, { rejectWithValue }) => {
  try {
    const { data } = await authApi.login(req)
    setToken(data.accessToken)
    return data
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Login failed')
  }
})

export const register = createAsyncThunk('auth/register', async (req: RegisterRequest, { rejectWithValue }) => {
  try {
    const { data } = await authApi.register(req)
    setToken(data.accessToken)
    return data
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Registration failed')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => { state.user = null; setToken(null) },
    clearError: (state) => { state.error = null }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => { s.loading = true; s.error = null })
      .addCase(login.fulfilled, (s, a) => { s.loading = false; s.user = a.payload })
      .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.payload as string })
      .addCase(register.pending, (s) => { s.loading = true; s.error = null })
      .addCase(register.fulfilled, (s, a) => { s.loading = false; s.user = a.payload })
      .addCase(register.rejected, (s, a) => { s.loading = false; s.error = a.payload as string })
  }
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
