import { Auth } from '@supabase/auth-ui-react'
import { supabase } from '../supabaseClient'

const authTheme = {
  default: {
    colors: {
      brand: '#2c5f2e',
      brandAccent: '#1e4220',
      brandButtonText: '#ffffff',
      defaultButtonBackground: '#f4f4f2',
      defaultButtonBackgroundHover: '#eaeae7',
      defaultButtonBorder: '#d8d8d4',
      defaultButtonText: '#2c5f2e',
      dividerBackground: '#d8d8d4',
      inputBackground: '#ffffff',
      inputBorder: '#d0d0cb',
      inputBorderHover: '#2c5f2e',
      inputBorderFocus: '#2c5f2e',
      inputText: '#1a1a18',
      inputLabelText: '#4a4a46',
      inputPlaceholder: '#b0b0aa',
      messageText: '#4a4a46',
      messageTextDanger: '#b03030',
      anchorTextColor: '#2c5f2e',
      anchorTextHoverColor: '#1e4220',
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
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@700&display=swap"
        rel="stylesheet"
      />

      {/* Left panel */}
      <div style={styles.left}>
        <div style={styles.leftInner}>
          <div style={styles.logoMark}>◈</div>
          <h1 style={styles.brand}>Meine App</h1>
          <p style={styles.tagline}>
            Professionell. Zuverlässig.<br />
            Alles was dein Unternehmen braucht.
          </p>
          <div style={styles.divider} />
          <div style={styles.features}>
            {[
              'Sichere Authentifizierung',
              'Echtzeit-Datenbank',
              'Skalierbar von Anfang an',
            ].map(f => (
              <div key={f} style={styles.feature}>
                <div style={styles.featureDot} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p style={styles.leftFooter}>© 2025 Meine App GmbH</p>
      </div>

      {/* Right panel */}
      <div style={styles.right}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Anmelden</h2>
            <p style={styles.formSub}>Willkommen zurück. Bitte melde dich an.</p>
          </div>

          <Auth
            supabaseClient={supabase}
            appearance={{ theme: authTheme }}
            providers={[]}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'E-Mail-Adresse',
                  password_label: 'Passwort',
                  button_label: 'Anmelden',
                  link_text: 'Bereits ein Konto? Jetzt anmelden',
                  email_input_placeholder: 'name@firma.de',
                  password_input_placeholder: '••••••••',
                },
                sign_up: {
                  email_label: 'E-Mail-Adresse',
                  password_label: 'Passwort wählen',
                  button_label: 'Konto erstellen',
                  link_text: 'Noch kein Konto? Registrieren',
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
    width: '42%',
    backgroundColor: '#2c5f2e',
    backgroundImage: `
      radial-gradient(ellipse at 0% 0%, #3a7a3c 0%, transparent 60%),
      radial-gradient(ellipse at 100% 100%, #1a3d1c 0%, transparent 60%)
    `,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '3.5rem',
    color: '#ffffff',
  },
  leftInner: {
    marginTop: '2rem',
  },
  logoMark: {
    fontSize: '1.8rem',
    marginBottom: '1.25rem',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: '-1px',
  },
  brand: {
    margin: '0 0 1rem',
    fontSize: '2.2rem',
    fontFamily: `'Fraunces', serif`,
    fontWeight: 700,
    letterSpacing: '-0.5px',
    lineHeight: 1.1,
  },
  tagline: {
    fontSize: '0.95rem',
    lineHeight: 1.75,
    color: 'rgba(255,255,255,0.65)',
    margin: '0 0 2rem',
    maxWidth: '280px',
  },
  divider: {
    width: '40px',
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    margin: '0 0 2rem',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.75)',
  },
  featureDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.5)',
    flexShrink: 0,
  },
  leftFooter: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.3)',
    margin: 0,
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f7f5',
    padding: '2rem',
  },
  formCard: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '2.5rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
    border: '1px solid #ebebeb',
  },
  formHeader: {
    marginBottom: '1.75rem',
  },
  formTitle: {
    margin: '0 0 0.35rem',
    fontSize: '1.5rem',
    fontFamily: `'Fraunces', serif`,
    fontWeight: 700,
    color: '#1a1a18',
    letterSpacing: '-0.3px',
  },
  formSub: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#888884',
    lineHeight: 1.5,
  },
}
