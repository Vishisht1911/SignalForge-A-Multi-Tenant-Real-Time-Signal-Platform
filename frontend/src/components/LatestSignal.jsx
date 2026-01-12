import React, { useState, useEffect } from 'react'
import api from '../services/api'

const LatestSignal = ({ token, refreshKey }) => {
  const [signal, setSignal] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [timeframe, setTimeframe] = useState('1h')

  const fetchLatest = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getLatestSignal(symbol, timeframe)
      setSignal(data)
    } catch (err) {
      setError(
        err?.response?.data?.detail || 'No signal found'
      )
      setSignal(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (refreshKey > 0) {
      fetchLatest()
    }
  }, [refreshKey])

  const getActionColor = (action) => {
    switch (action) {
      case 'BUY':
        return '#10b981'
      case 'SELL':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  return (
    <div style={styles.card}>
      <div style={styles.title}>📌 Latest Signal</div>

      <div style={styles.filters}>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Symbol"
          style={styles.input}
        />

        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          style={styles.select}
        >
          <option value="1m">1m</option>
          <option value="5m">5m</option>
          <option value="15m">15m</option>
          <option value="1h">1h</option>
          <option value="4h">4h</option>
          <option value="1d">1d</option>
        </select>

        <button
          type="button"
          onClick={fetchLatest}
          style={styles.fetchBtn}
        >
          🔄 Fetch
        </button>
      </div>

      {loading && (
        <div style={styles.loading}>⏳ Loading...</div>
      )}

      {error && (
        <div style={styles.error}>{error}</div>
      )}

      {signal && (
        <div style={styles.signalCard}>
          <div
            style={{
              ...styles.actionBadge,
              background: getActionColor(signal.action)
            }}
          >
            {signal.action}
          </div>

          <div style={styles.confidence}>
            Confidence: {(signal.confidence * 100).toFixed(1)}%
          </div>

          <div style={styles.features}>
            <strong>Features:</strong>
            <pre style={styles.json}>
              {JSON.stringify(signal.features, null, 2)}
            </pre>
          </div>

          {signal.veto_reasons && (
            <div style={styles.veto}>
              <strong>Veto Reasons:</strong>
              <ul>
                {signal.veto_reasons.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={styles.timestamp}>
            {new Date(signal.created_at).toLocaleString()}
          </div>
        </div>
      )}
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
  filters: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px'
  },
  input: {
    flex: 1,
    padding: '10px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '14px'
  },
  select: {
    padding: '10px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '14px',
    background: 'white'
  },
  fetchBtn: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    color: '#666'
  },
  error: {
    padding: '12px',
    background: '#fee',
    color: '#c33',
    borderRadius: '6px',
    fontSize: '14px'
  },
  signalCard: {
    padding: '16px',
    background: '#f9f9f9',
    borderRadius: '8px'
  },
  actionBadge: {
    display: 'inline-block',
    padding: '8px 16px',
    color: 'white',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '18px',
    marginBottom: '12px'
  },
  confidence: {
    fontSize: '16px',
    marginBottom: '12px'
  },
  features: {
    marginTop: '12px'
  },
  json: {
    background: '#fff',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '12px',
    overflow: 'auto',
    maxHeight: '200px'
  },
  veto: {
    marginTop: '12px',
    padding: '12px',
    background: '#fff3cd',
    borderRadius: '6px',
    fontSize: '14px'
  },
  timestamp: {
    marginTop: '12px',
    fontSize: '13px',
    color: '#666',
    textAlign: 'right'
  }
}

export default LatestSignal
