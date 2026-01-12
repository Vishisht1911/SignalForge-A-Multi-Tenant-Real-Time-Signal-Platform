import React, { useState, useEffect } from 'react'
import api from '../services/api'

const SignalHistory = ({ token, refreshKey }) => {
  const [signals, setSignals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [symbol, setSymbol] = useState('')
  const [timeframe, setTimeframe] = useState('')

  const fetchHistory = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getSignalHistory(
        symbol || undefined,
        timeframe || undefined,
        page,
        20
      )
      setSignals(data.signals)
      setTotal(data.total)
    } catch (err) {
      setError(
        err?.response?.data?.detail || 'Failed to load history'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [page, refreshKey])

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

  const totalPages = Math.ceil(total / 20)

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>📜 Signal History</h2>

      <div style={styles.filters}>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Filter by symbol"
          style={styles.input}
        />

        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          style={styles.select}
        >
          <option value="">All Timeframes</option>
          <option value="1m">1m</option>
          <option value="5m">5m</option>
          <option value="15m">15m</option>
          <option value="1h">1h</option>
          <option value="4h">4h</option>
          <option value="1d">1d</option>
        </select>

        <button onClick={fetchHistory} style={styles.searchBtn}>
          🔍 Search
        </button>
      </div>

      {loading && <div style={styles.loading}>⏳ Loading...</div>}
      {error && <div style={styles.error}>{error}</div>}

      {signals.length > 0 && (
        <>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Symbol</th>
                  <th style={styles.th}>Timeframe</th>
                  <th style={styles.th}>Action</th>
                  <th style={styles.th}>Confidence</th>
                  <th style={styles.th}>Created At</th>
                </tr>
              </thead>
              <tbody>
                {signals.map((signal) => (
                  <tr key={signal.id} style={styles.tr}>
                    <td style={styles.td}>{signal.symbol}</td>
                    <td style={styles.td}>{signal.timeframe}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          background: getActionColor(signal.action)
                        }}
                      >
                        {signal.action}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {(signal.confidence * 100).toFixed(1)}%
                    </td>
                    <td style={styles.td}>
                      {new Date(signal.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={styles.pagination}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={styles.pageBtn}
            >
              ← Previous
            </button>

            <span style={styles.pageInfo}>
              Page {page} of {totalPages} ({total} total)
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={styles.pageBtn}
            >
              Next →
            </button>
          </div>
        </>
      )}

      {!loading && signals.length === 0 && (
        <div style={styles.empty}>No signals found</div>
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
  searchBtn: {
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
    padding: '40px',
    color: '#666'
  },
  error: {
    padding: '12px',
    background: '#fee',
    color: '#c33',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '16px'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #e0e0e0',
    fontWeight: '600',
    color: '#555',
    fontSize: '14px'
  },
  tr: {
    borderBottom: '1px solid #f0f0f0'
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#333'
  },
  badge: {
    padding: '4px 12px',
    color: 'white',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px',
    padding: '16px',
    background: '#f9f9f9',
    borderRadius: '8px'
  },
  pageBtn: {
    padding: '8px 16px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  pageInfo: {
    fontSize: '14px',
    color: '#666'
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
    fontSize: '16px'
  }
}

export default SignalHistory
