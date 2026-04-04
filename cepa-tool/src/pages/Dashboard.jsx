import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Dashboard({ session }) {
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
  }

  const initials = session.user.email?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <div style={styles.page}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap"
        rel="stylesheet"
      />

      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarTop}>
          <div style={styles.sidebarLogo}>
            <span style={styles.logoIcon}>◆</span>
            <span style={styles.logoText}>Meine App</span>
          </div>
          <nav style={styles.nav}>
            {[
              { icon: '⊞', label: 'Dashboard', active: true },
              { icon: '◎', label: 'Übersicht', active: false },
              { icon: '≡', label: 'Berichte', active: false },
              { icon: '⚙', label: 'Einstellungen', active: false },
            ].map(item => (
              <div
                key={item.label}
                style={{
                  ...styles.navItem,
                  ...(item.active ? styles.navItemActive : {}),
                }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </nav>
        </div>

        {/* User info + logout */}
        <div style={styles.sidebarBottom}>
          <div style={styles.userRow}>
            <div style={styles.avatar}>{initials}</div>
            <div style={styles.userInfo}>
              <p style={styles.userEmail}>{session.user.email}</p>
              <p style={styles.userRole}>Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={styles.logoutBtn}
          >
            {loggingOut ? '...' : '↪ Abmelden'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        <div style={styles.mainHeader}>
          <div>
            <h1 style={styles.pageTitle}>Dashboard</h1>
            <p style={styles.pageSubtitle}>Guten Tag – hier ist deine Übersicht.</p>
          </div>
          <div style={styles.dateBadge}>
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          {[
            { label: 'Aktive Nutzer', value: '–', delta: '' },
            { label: 'Anfragen heute', value: '–', delta: '' },
            { label: 'Umsatz (Monat)', value: '–', delta: '' },
            { label: 'Offene Aufgaben', value: '–', delta: '' },
          ].map(stat => (
            <div key={stat.label} style={styles.statCard}>
              <p style={styles.statLabel}>{stat.label}</p>
              <p style={styles.statValue}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Content placeholder */}
        <div style={styles.contentCard}>
          <h2 style={styles.contentTitle}>Bereit loszulegen?</h2>
          <p style={styles.contentText}>
            Dein Dashboard ist eingerichtet und einsatzbereit. Füge hier deine eigenen Komponenten, Tabellen oder Charts ein.
          </p>
          <div style={styles.pill}>✓ Supabase verbunden</div>
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
    backgroundColor: '#f4f5f7',
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#1a1a2e',
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
  logoIcon: {
    color: '#e8c97e',
    fontSize: '1.1rem',
  },
  logoText: {
    color: '#fff',
    fontWeight: 700,
    fontSize: '1rem',
    letterSpacing: '-0.2px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.65rem 0.75rem',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  navItemActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#ffffff',
  },
  navIcon: {
    fontSize: '1rem',
    width: '18px',
    textAlign: 'center',
  },
  sidebarBottom: {
    borderTop: '1px solid rgba(255,255,255,0.08)',
    paddingTop: '1rem',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#e8c97e',
    color: '#1a1a2e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.8rem',
    flexShrink: 0,
  },
  userInfo: {
    overflow: 'hidden',
  },
  userEmail: {
    margin: 0,
    fontSize: '0.75rem',
    color: '#fff',
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
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    textAlign: 'left',
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
    fontSize: '1.75rem',
    fontFamily: `'DM Serif Display', serif`,
    fontWeight: 400,
    color: '#1a1a2e',
    letterSpacing: '-0.3px',
  },
  pageSubtitle: {
    margin: 0,
    color: '#888',
    fontSize: '0.9rem',
  },
  dateBadge: {
    fontSize: '0.8rem',
    color: '#999',
    backgroundColor: '#fff',
    border: '1px solid #e8e8e8',
    borderRadius: '8px',
    padding: '0.5rem 0.875rem',
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
    border: '1px solid #eeeeee',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  statLabel: {
    margin: '0 0 0.5rem',
    fontSize: '0.75rem',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontWeight: 600,
  },
  statValue: {
    margin: 0,
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#1a1a2e',
    fontFamily: `'DM Serif Display', serif`,
  },
  contentCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '2rem',
    border: '1px solid #eeeeee',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  contentTitle: {
    margin: '0 0 0.5rem',
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#1a1a2e',
  },
  contentText: {
    margin: '0 0 1.25rem',
    color: '#777',
    fontSize: '0.9rem',
    lineHeight: 1.6,
  },
  pill: {
    display: 'inline-block',
    backgroundColor: '#f0faf4',
    color: '#2d7a4f',
    border: '1px solid #b6e8cc',
    borderRadius: '20px',
    padding: '0.3rem 0.9rem',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
}
