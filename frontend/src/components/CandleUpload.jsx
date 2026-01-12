import React, { useState } from 'react'
import api from '../services/api'

const CandleUpload = ({ token }) => {
  const [jsonInput, setJsonInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const sampleData = JSON.stringify(
    {
      candles: [
        {
          symbol: 'BTCUSDT',
          timeframe: '1h',
          ts: new Date().toISOString(),
          open: 42000,
          high: 42500,
          low: 41800,
          close: 42200,
          volume: 1000
        }
      ]
    },
    null,
    2
  )

  const handleUpload = async () => {
    setError('')
    setResult(null)
    setLoading(true)

    try {
      const data = JSON.parse(jsonInput)
      const response = await api.uploadCandles(
        data.candles,
        `upload-${Date.now()}`
      )
      setResult(response)
      setJsonInput('')
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          'Upload failed'
      )
    } finally {
      setLoading(false)
    }
  }

  const loadSample = () => {
    setJsonInput(sampleData)
  }

  return (
    <div style={styles.card}>
      <div style={styles.title}>📊 Upload Candles</div>

      <div style={styles.actions}>
        <button
          type="button"
          onClick={loadSample}
          style={styles.sampleBtn}
        >
          📝 Load Sample Data
        </button>
      </div>

      <textarea
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder='Paste JSON here or click "Load Sample Data"'
        style={styles.textarea}
      />

      {error && <div style={styles.error}>{error}</div>}

      {result && (
        <div style={styles.success}>
          ✅ Uploaded: {result.inserted} candles, {result.duplicates} duplicates
        </div>
      )}

      <button
        type="button"
        onClick={handleUpload}
        style={styles.button}
        disabled={loading}
      >
        {loading ? '⏳ Uploading...' : '⬆️ Upload Candles'}
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
  actions: {
    marginBottom: '12px'
  },
  sampleBtn: {
    padding: '8px 16px',
    background: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  textarea: {
    width: '100%',
    minHeight: '200px',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'monospace',
    resize: 'vertical',
    marginBottom: '12px'
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
    cursor: 'pointer'
  },
  error: {
    padding: '12px',
    background: '#fee',
    color: '#c33',
    borderRadius: '6px',
    marginBottom: '12px',
    fontSize: '14px'
  },
  success: {
    padding: '12px',
    background: '#efe',
    color: '#3c3',
    borderRadius: '6px',
    marginBottom: '12px',
    fontSize: '14px'
  }
}

export default CandleUpload
