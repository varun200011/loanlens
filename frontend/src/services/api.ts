import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT from memory store (never localStorage)
let _token: string | null = null
export const setToken = (t: string | null) => { _token = t }
export const getToken = () => _token

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (_token) config.headers.Authorization = `Bearer ${_token}`
  return config
})

api.interceptors.response.use(
  r => r,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      setToken(null)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// ─── Auth ───
export const authApi = {
  register: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data),
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data)
}

// ─── Loans ───
export const loanApi = {
  getAll: () => api.get<LoanResponse[]>('/loans'),
  add: (data: LoanRequest) => api.post<LoanResponse>('/loans', data),
  delete: (id: string) => api.delete(`/loans/${id}`)
}

// ─── Portfolio ───
export const portfolioApi = {
  getSummary: () => api.get<PortfolioSummary>('/portfolio/summary')
}

// ─── Stress ───
export const stressApi = {
  simulate: (data: StressRequest) => api.post<StressResponse>('/stress/simulate', data)
}

// ─── Affordability ───
export const affordabilityApi = {
  getScore: () => api.get<AffordabilityScore>('/affordability/score')
}

// ─── Reports ───
export const reportApi = {
  generate: () => api.post<{ signedUrl: string; healthGrade: string }>('/reports/generate')
}

// ─── Types ───
export interface RegisterRequest {
  name: string; email: string; password: string
  monthlyIncome?: number; monthlyExpenses?: number
  monthlySipCommitment?: number; emergencyBufferTarget?: number; dependents?: number
}
export interface LoginRequest { email: string; password: string }
export interface AuthResponse {
  accessToken: string; refreshToken: string; tokenType: string
  expiresIn: number; userId: string; name: string; email: string
}
export interface LoanRequest {
  loanType: string; principal: number; interestRate: number
  tenureMonths: number; startDate: string; lenderName?: string; notes?: string
}
export interface LoanResponse {
  id: string; loanType: string; principal: number; interestRate: number
  tenureMonths: number; startDate: string; lenderName?: string
  emi: number; totalInterest: number; totalPayable: number
  outstandingBalance: number; remainingMonths: number; active: boolean
}
export interface PortfolioSummary {
  totalOutstanding: number; totalMonthlyEmi: number; dtiRatio: number
  healthGrade: string; monthlyIncome: number; disposableAfterEmi: number
  activeLoanCount: number; totalInterestPayable: number; loans: LoanResponse[]
  avalanche: PrepaymentComparison; snowball: PrepaymentComparison
}
export interface PrepaymentComparison {
  strategy: string; totalInterestSaved: number; monthsSaved: number; payoffOrder: string[]
}
export interface StressRequest { scenarioType: string; parameterDelta: number }
export interface StressResponse {
  scenarioType: string; parameterDelta: number; riskBand: string; riskMessage: string
  currentMonthlyEmi: number; projectedMonthlyEmi: number
  availableAfterEmi: number; projectedAvailableAfterEmi: number
  breachThreshold: number; isAtRisk: boolean; recommendations: string[]
}
export interface AffordabilityScore {
  score: number; grade: string; safeBorrowLimit: number; bankEligibilityLimit: number
  currentMonthlyEmi: number; disposableAfterAllCommitments: number
  recommendedMaxEmi: number; summary: string; insights: string[]
}
