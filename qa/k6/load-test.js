import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend } from 'k6/metrics'

const errorRate = new Rate('error_rate')
const stressLatency = new Trend('stress_api_latency')

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '60s', target: 100 },
    { duration: '30s', target: 0 }
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'],
    error_rate: ['rate<0.01'],
    stress_api_latency: ['p(95)<1200']
  }
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080'

export function setup() {
  const reg = http.post(`${BASE_URL}/api/auth/register`, JSON.stringify({
    name: 'K6 Load Test', email: `k6_${Date.now()}@test.com`,
    password: 'LoadTest123!', monthlyIncome: 80000, monthlyExpenses: 25000
  }), { headers: { 'Content-Type': 'application/json' } })
  return { token: reg.json('accessToken') }
}

export default function(data) {
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${data.token}` }

  // GET /portfolio/summary
  const portfolio = http.get(`${BASE_URL}/api/portfolio/summary`, { headers })
  check(portfolio, { 'portfolio 200': r => r.status === 200 })
  errorRate.add(portfolio.status !== 200)

  // GET /affordability/score
  const afford = http.get(`${BASE_URL}/api/affordability/score`, { headers })
  check(afford, { 'affordability 200': r => r.status === 200 })

  // POST /stress/simulate
  const start = Date.now()
  const stress = http.post(`${BASE_URL}/api/stress/simulate`, JSON.stringify({
    scenarioType: 'INCOME_DROP', parameterDelta: -30
  }), { headers })
  stressLatency.add(Date.now() - start)
  check(stress, { 'stress 200': r => r.status === 200 })
  errorRate.add(stress.status !== 200)

  sleep(1)
}
