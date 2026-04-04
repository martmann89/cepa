import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'

// Schützt eine Route – leitet nicht eingeloggte User zur Login-Seite
function PrivateRoute({ session, children }) {
  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = noch am Laden

  useEffect(() => {
    // Aktuelle Session beim Start laden
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Auf Login/Logout-Änderungen reagieren
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Solange Session noch geladen wird, nichts rendern
  if (session === undefined) return null

  return (
    <Routes>
      <Route
        path="/login"
        element={session ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <PrivateRoute session={session}>
            <Dashboard session={session} />
          </PrivateRoute>
        }
      />
      {/* Alle unbekannten Pfade → Startseite */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
