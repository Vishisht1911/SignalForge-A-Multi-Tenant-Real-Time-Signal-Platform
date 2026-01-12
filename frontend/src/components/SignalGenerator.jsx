import React, { useState, useEffect } from 'react'
import api from '../services/api'

const SignalGenerator = ({ token, onSignalGenerated }) => {
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [timeframe, setTimeframe] = useState('1h')
  const [loading, setLoading] = useState(false)
  const [job, setJob] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (job && (job.status === 'PENDING' || job.status === 'RUNNING')) {
      const interval = setInterval(async () => {
        try {
          const updated = await api.getJobStatus(job.id)
          setJob(updated)

          if (updated.status === 'SUCCESS' || updated.status === 'FAILED') {
            clearInterval(interval)

            if (updated.status === 'SUCCESS') {
              onSignalGenerated()
            }
          }
        } catch (err) {
          clearInterval(interval)
        }
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [job, onSignalGenerated])

  const handleGenerate = async () => {
    setError('')
    setJob(null)
    setLoading(true)

    try {
      const response = await api.generateSignal(symbol, timeframe)
      const jobData = await api.getJobStatus(response.job_id)
      setJob(jobData)
    } catch (err) {
      setError(
        err?.response?.data?.detail || 'Failed to generate signal'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.card}>
      <div style={styles.title}>⚡ Generate Signal</div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Symbol</label>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          style={styles.input}
          placeholder="BTCUSDT"
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Timeframe</label>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          style={styles.select}
        >
          <option value="1m">1 Minute</option>
          <option value="5m">5 Minutes</option>
          <option value="15m">15 Minutes</option>
          <option value="1h">1 Hour</option>
          <option value="4h">4 Hours</option>
          <option value="1d">1 Day</option>
        </select>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {job && (
        <div style={styles.jobStatus}>
          <div style={styles.statusBadge}>
            Status: {job.status}
          </div>

          {job.status === 'SUCCESS' && job.result && (
            <div style={styles.jobResult}>
              ✅ Signal Generated: {job.result.action} (
              {(job.result.confidence * 100).toFixed(1)}%)
            </div>
          )}

          {job.status === 'FAILED' && (
            <div style={styles.jobError}>
              ❌ {job.error}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        style={styles.button}
        disabled={loading}
      >
        {loading ? '⏳ Generating...' : '🎯 Generate Signal'}
      </button>
    </div>
  )
}

const styles = {
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#333'
  },
  inputGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#555'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '14px'
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '14px',
    background: 'white'
  },
  button: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px'
  },
  error: {
    padding: '12px',
    background: '#fee',
    color: '#c33',
    borderRadius: '6px',
    marginBottom: '12px',
    fontSize: '14px'
  },
  jobStatus: {
    padding: '12px',
    background: '#f9f9f9',
    borderRadius: '6px',
    marginBottom: '12px'
  },
  statusBadge: {
    fontSize: '14px',
    marginBottom: '8px'
  },
  jobResult: {
    padding: '8px',
    background: '#efe',
    color: '#3c3',
    borderRadius: '4px',
    fontSize: '14px'
  },
  jobError: {
    padding: '8px',
    background: '#fee',
    color: '#c33',
    borderRadius: '4px',
    fontSize: '14px'
  }
}

export default SignalGenerator
