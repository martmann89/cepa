import { Auth } from '@supabase/auth-ui-react'
import { supabase } from '../supabaseClient'

const authTheme = {
  default: {
    colors: {
      brand: '#1a1a2e',
      brandAccent: '#16213e',
      brandButtonText: '#ffffff',
      defaultButtonBackground: '#f8f8f8',
      defaultButtonBackgroundHover: '#efefef',
      defaultButtonBorder: '#e0e0e0',
      defaultButtonText: '#1a1a2e',
      dividerBackground: '#e8e8e8',
      inputBackground: '#ffffff',
      inputBorder: '#d4d4d4',
      inputBorderHover: '#1a1a2e',
      inputBorderFocus: '#1a1a2e',
      inputText: '#1a1a2e',
      inputLabelText: '#555555',
      inputPlaceholder: '#aaaaaa',
      messageText: '#555555',
      messageTextDanger: '#c0392b',
      anchorTextColor: '#1a1a2e',
      anchorTextHoverColor: '#16213e',
    },
    space: {
      spaceSmall: '4px',
      spaceMedium: '8px',
      spaceLarge: '16px',
      labelBottomMargin: '6px',
      anchorBottomMargin: '4px',
      emailInputSpacing: '4px',
      socialAuthSpacing: '6px',
      buttonPadding: '12px 18px',
      inputPadding: '11px 14px',
    },
    fontSizes: {
      baseBodySize: '14px',
      baseInputSize: '14px',
      baseLabelSize: '13px',
      baseButtonSize: '14px',
    },
    fonts: {
      bodyFontFamily: `'DM Sans', sans-serif`,
      buttonFontFamily: `'DM Sans', sans-serif`,
      inputFontFamily: `'DM Sans', sans-serif`,
      labelFontFamily: `'DM Sans', sans-serif`,
    },
    fontWeights: {
      bodyFontWeight: '400',
      buttonFontWeight: '600',
    },
    borderWidths: {
      buttonBorderWidth: '1px',
      inputBorderWidth: '1px',
    },
    radii: {
      borderRadiusButton: '6px',
      buttonBorderRadius: '6px',
      inputBorderRadius: '6px',
    },
  },
}

export default function LoginPage() {
  return (
    <div style={styles.page}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap"
        rel="stylesheet"
      />

      {/* Left panel – branding */}
      <div style={styles.left}>
        <div style={styles.leftInner}>
          <div style={styles.logo}>◆</div>
          <h1 style={styles.brand}>Meine App</h1>
          <p style={styles.tagline}>
            Professionell. Sicher. Schnell.<br />
            Alles was du brauchst, an einem Ort.
          </p>
          <div style={styles.features}>
            {['Echtzeit-Datenbank', 'Sichere Authentifizierung', 'Skalierbar von Tag 1'].map(f => (
              <div key={f} style={styles.feature}>
                <span style={styles.featureCheck}>✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p style={styles.leftFooter}>© 2025 Meine App. Alle Rechte vorbehalten.</p>
      </div>

      {/* Right panel – auth form */}
      <div style={styles.right}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Willkommen zurück</h2>
            <p style={styles.formSub}>Melde dich an oder erstelle ein neues Konto.</p>
          </div>

          <Auth
            supabaseClient={supabase}
            appearance={{ theme: authTheme }}
            providers={['google']}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'E-Mail-Adresse',
                  password_label: 'Passwort',
                  button_label: 'Anmelden',
                  link_text: 'Noch kein Konto? Jetzt registrieren',
                  email_input_placeholder: 'name@firma.de',
                  password_input_placeholder: '••••••••',
                },
                sign_up: {
                  email_label: 'E-Mail-Adresse',
                  password_label: 'Passwort wählen',
                  button_label: 'Konto erstellen',
                  link_text: 'Bereits registriert? Anmelden',
                  email_input_placeholder: 'name@firma.de',
                  password_input_placeholder: 'Mindestens 8 Zeichen',
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: `'DM Sans', sans-serif`,
  },
  left: {
    width: '45%',
    background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '3rem',
    color: '#fff',
  },
  leftInner: {
    marginTop: '3rem',
  },
  logo: {
    fontSize: '2rem',
    marginBottom: '1rem',
    color: '#e8c97e',
  },
  brand: {
    margin: '0 0 1rem',
    fontSize: '2.4rem',
    fontFamily: `'DM Serif Display', serif`,
    fontWeight: 400,
    letterSpacing: '-0.5px',
    lineHeight: 1.1,
  },
  tagline: {
    fontSize: '1rem',
    lineHeight: 1.7,
    opacity: 0.7,
    margin: '0 0 2.5rem',
    maxWidth: '300px',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.9rem',
    opacity: 0.85,
  },
  featureCheck: {
    color: '#e8c97e',
    fontWeight: 700,
    fontSize: '1rem',
  },
  leftFooter: {
    fontSize: '0.75rem',
    opacity: 0.4,
    margin: 0,
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
    padding: '2rem',
  },
  formCard: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '2.5rem',
    boxShadow: '0 4px 32px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
    border: '1px solid #eeeeee',
  },
  formHeader: {
    marginBottom: '1.75rem',
  },
  formTitle: {
    margin: '0 0 0.4rem',
    fontSize: '1.5rem',
    fontFamily: `'DM Serif Display', serif`,
    fontWeight: 400,
    color: '#1a1a2e',
    letterSpacing: '-0.3px',
  },
  formSub: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#888',
    lineHeight: 1.5,
  },
}
