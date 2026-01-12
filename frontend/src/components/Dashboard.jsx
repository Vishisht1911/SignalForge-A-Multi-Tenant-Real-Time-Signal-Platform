import React, { useState } from 'react'
import CandleUpload from './CandleUpload'
import SignalGenerator from './SignalGenerator'
import LatestSignal from './LatestSignal'
import SignalHistory from './SignalHistory'

const Dashboard = ({ token, onLogout }) => {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSignalGenerated = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo}>🚀 Signal Platform</h1>
          <button onClick={onLogout} style={styles.logoutBtn}>
            🚪 Logout
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.grid}>
          <div style={styles.section}>
            <CandleUpload token={token} />
          </div>

          <div style={styles.section}>
            <SignalGenerator token={token} onSignalGenerated={handleSignalGenerated} />
          </div>
        </div>

        <div style={styles.section}>
          <LatestSignal token={token} refreshKey={refreshKey} />
        </div>

        <div style={styles.section}>
          <SignalHistory token={token} refreshKey={refreshKey} />
        </div>
      </main>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f7fa'
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '20px 0',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold'
  },
  logoutBtn: {
    padding: '10px 20px',
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: '2px solid white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  },
  section: {
    marginBottom: '20px'
  }
}

export default Dashboard