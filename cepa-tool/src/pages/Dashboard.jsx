import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Dashboard({ session }) {
  const [loggingOut, setLoggingOut] = useState(false)
  const [activeNav, setActiveNav] = useState('Dashboard')

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
  }

  const initials = session.user.email?.slice(0, 2).toUpperCase() ?? '??'

  const navItems = [
    { icon: '⊞', label: 'Dashboard' },
    { icon: '◎', label: 'Übersicht' },
    { icon: '≡', label: 'Berichte' },
    { icon: '⚙', label: 'Einstellungen' },
  ]

  return (
    <div style={styles.page}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@700&display=swap"
        rel="stylesheet"
      />

      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarTop}>
          <div style={styles.sidebarLogo}>
            <span style={styles.logoMark}>◈</span>
            <span style={styles.logoText}>Meine App</span>
          </div>

          <nav style={styles.nav}>
            {navItems.map(item => (
              <div
                key={item.label}
                onClick={() => setActiveNav(item.label)}
                style={{
                  ...styles.navItem,
                  ...(activeNav === item.label ? styles.navItemActive : {}),
                }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </nav>
        </div>

        <div style={styles.sidebarBottom}>
          <div style={styles.userRow}>
            <div style={styles.avatar}>{initials}</div>
            <div style={styles.userInfo}>
              <p style={styles.userEmail}>{session.user.email}</p>
              <p style={styles.userRole}>Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} disabled={loggingOut} style={styles.logoutBtn}>
            {loggingOut ? '...' : '↪ Abmelden'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        <div style={styles.mainHeader}>
          <div>
            <h1 style={styles.pageTitle}>Dashboard</h1>
            <p style={styles.pageSubtitle}>
              {new Date().toLocaleDateString('de-DE', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
          <div style={styles.statusBadge}>
            <div style={styles.statusDot} />
            Alle Systeme aktiv
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          {[
            { label: 'Aktive Nutzer', value: '–' },
            { label: 'Anfragen heute', value: '–' },
            { label: 'Umsatz (Monat)', value: '–' },
            { label: 'Offene Aufgaben', value: '–' },
          ].map(stat => (
            <div key={stat.label} style={styles.statCard}>
              <p style={styles.statLabel}>{stat.label}</p>
              <p style={styles.statValue}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={styles.contentCard}>
          <div style={styles.contentAccent} />
          <div style={styles.contentBody}>
            <h2 style={styles.contentTitle}>Bereit loszulegen?</h2>
            <p style={styles.contentText}>
              Dein Dashboard ist eingerichtet und einsatzbereit. Füge hier deine eigenen Komponenten, Tabellen oder Charts ein.
            </p>
            <div style={styles.pill}>✓ Supabase verbunden</div>
          </div>
        </div>
      </main>
    </div>
  )
}

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: `'DM Sans', sans-serif`,
    backgroundColor: '#f2f2f0',
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#2c5f2e',
    backgroundImage: `radial-gradient(ellipse at 0% 0%, #3a7a3c 0%, transparent 70%)`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '1.5rem 1rem',
    flexShrink: 0,
  },
  sidebarTop: {},
  sidebarLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginBottom: '2.5rem',
    paddingLeft: '0.5rem',
  },
  logoMark: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '1.1rem',
  },
  logoText: {
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '1rem',
    fontFamily: `'Fraunces', serif`,
    letterSpacing: '-0.2px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.65rem 0.75rem',
    borderRadius: '6px',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  navItemActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: '#ffffff',
  },
  navIcon: {
    fontSize: '1rem',
    width: '18px',
    textAlign: 'center',
  },
  sidebarBottom: {
    borderTop: '1px solid rgba(255,255,255,0.1)',
    paddingTop: '1rem',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.75rem',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,0.2)',
  },
  userInfo: { overflow: 'hidden' },
  userEmail: {
    margin: 0,
    fontSize: '0.75rem',
    color: '#ffffff',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    margin: 0,
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.4)',
  },
  logoutBtn: {
    width: '100%',
    padding: '0.6rem',
    backgroundColor: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '6px',
    color: 'rgba(255,255,255,0.55)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: `'DM Sans', sans-serif`,
  },
  main: {
    flex: 1,
    padding: '2.5rem',
    overflowY: 'auto',
  },
  mainHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
  },
  pageTitle: {
    margin: '0 0 0.25rem',
    fontSize: '1.8rem',
    fontFamily: `'Fraunces', serif`,
    fontWeight: 700,
    color: '#1a1a18',
    letterSpacing: '-0.3px',
  },
  pageSubtitle: {
    margin: 0,
    color: '#909088',
    fontSize: '0.875rem',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: '#2c5f2e',
    backgroundColor: '#e4f0e4',
    border: '1px solid #bcdcbc',
    borderRadius: '20px',
    padding: '0.45rem 0.875rem',
    fontWeight: 500,
  },
  statusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#2c5f2e',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '1.25rem 1.5rem',
    border: '1px solid #e8e8e4',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  statLabel: {
    margin: '0 0 0.5rem',
    fontSize: '0.75rem',
    color: '#909088',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontWeight: 600,
  },
  statValue: {
    margin: 0,
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#1a1a18',
    fontFamily: `'Fraunces', serif`,
  },
  contentCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e8e8e4',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    display: 'flex',
    overflow: 'hidden',
  },
  contentAccent: {
    width: '4px',
    backgroundColor: '#2c5f2e',
    flexShrink: 0,
  },
  contentBody: {
    padding: '2rem',
  },
  contentTitle: {
    margin: '0 0 0.5rem',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#1a1a18',
    fontFamily: `'Fraunces', serif`,
  },
  contentText: {
    margin: '0 0 1.25rem',
    color: '#70706a',
    fontSize: '0.9rem',
    lineHeight: 1.65,
  },
  pill: {
    display: 'inline-block',
    backgroundColor: '#e4f0e4',
    color: '#2c5f2e',
    border: '1px solid #bcdcbc',
    borderRadius: '20px',
    padding: '0.3rem 0.9rem',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
}
