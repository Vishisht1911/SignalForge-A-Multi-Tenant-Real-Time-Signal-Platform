import axios from 'axios'

const API_BASE_URL = 'http://localhost:8001'

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  setToken(token) {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  async login(email, password) {
    const response = await this.api.post('/v1/auth/login', {
      email,
      password
    })
    return response.data
  }

  async uploadCandles(candles, idempotencyKey) {
    const headers = {}
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey
    }

    const response = await this.api.post(
      '/v1/candles',
      { candles },
      { headers }
    )
    return response.data
  }

  async generateSignal(symbol, timeframe) {
    const response = await this.api.post(
      `/v1/signals/generate?symbol=${symbol}&timeframe=${timeframe}`
    )
    return response.data
  }

  async getJobStatus(jobId) {
    const response = await this.api.get(`/v1/jobs/${jobId}`)
    return response.data
  }

  async getLatestSignal(symbol, timeframe) {
    const response = await this.api.get(
      `/v1/signals/latest?symbol=${symbol}&timeframe=${timeframe}`
    )
    return response.data
  }

  async getSignalHistory(symbol, timeframe, page = 1, pageSize = 20) {
    let url = `/v1/signals/history?page=${page}&page_size=${pageSize}`

    if (symbol) url += `&symbol=${symbol}`
    if (timeframe) url += `&timeframe=${timeframe}`

    const response = await this.api.get(url)
    return response.data
  }

  async healthCheck() {
    const response = await this.api.get('/health')
    return response.data
  }
}

export default new ApiService()
