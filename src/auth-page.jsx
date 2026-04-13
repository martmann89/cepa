import { useState } from "react";
import { supabase } from "./supabaseClient"

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteKey, setInviteKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const isRegister = mode === "register";

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!inviteKey.trim()) {
          throw new Error("Bitte Einladungscode eingeben");
        }
        
        const { data: keyData, error: keyErr } = await supabase
           .from('invite_keys')
           .select('*')
           .eq('key', inviteKey.trim())
           .eq('used', false)
           .single();
           
         if (keyErr || !keyData) throw new Error('Ungültiger Einladungscode');

        // 2. Registrieren
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) throw error;
        // 3. Key als benutzt markieren
        const { data : updateData, error : updateError } = await supabase
           .from('invite_keys')
           .update({ used: true})
           .eq('id', keyData.id);
           console.log(updateError)
        if (updateError) throw new Error('Patch fehlgeschlagen!');

        setMessage({ type: "ok", text: "Konto erstellt! Bitte E-Mail bestätigen." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        setMessage({ type: "ok", text: "Erfolgreich eingeloggt." });
      }
    } catch (err) {
      console.log(err)
      setMessage({ type: "err", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", fontFamily: "sans-serif" }}>
      <h2 style={{ marginBottom: 4 }}>
        {isRegister ? "Registrieren" : "Anmelden"}
      </h2>
      <p style={{ color: "#666", fontSize: 14, marginTop: 0, marginBottom: 24 }}>
        {isRegister
          ? "Erstelle ein neues Konto mit Einladungscode."
          : "Melde dich mit deinem Konto an."}
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label>
          <span style={labelStyle}>E-Mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@beispiel.de"
            required
            style={inputStyle}
          />
        </label>

        <label>
          <span style={labelStyle}>Passwort</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={inputStyle}
          />
        </label>

        {isRegister && (
          <label>
            <span style={labelStyle}>Einladungscode</span>
            <input
              type="text"
              value={inviteKey}
              onChange={(e) => setInviteKey(e.target.value.toUpperCase())}
              placeholder="z.B. ALPHA-2024"
              required
              style={{ ...inputStyle, letterSpacing: 1 }}
            />
            <span style={{ fontSize: 12, color: "#888" }}>
              Ohne gültigen Code ist keine Registrierung möglich.
            </span>
          </label>
        )}

        {message && (
          <div style={{
            padding: "8px 12px",
            borderRadius: 4,
            fontSize: 13,
            background: message.type === "err" ? "#fee" : "#efe",
            color: message.type === "err" ? "#c00" : "#070",
          }}>
            {message.text}
          </div>
        )}

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Laden..." : isRegister ? "Konto erstellen" : "Anmelden"}
        </button>
      </form>

      <p style={{ fontSize: 13, color: "#666", marginTop: 16 }}>
        {isRegister ? "Bereits ein Konto? " : "Noch kein Konto? "}
        <button
          onClick={() => { setMode(isRegister ? "login" : "register"); setMessage(null); }}
          style={linkStyle}
        >
          {isRegister ? "Anmelden" : "Registrieren"}
        </button>
      </p>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 4,
};

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  fontSize: 14,
  border: "1px solid #ccc",
  borderRadius: 4,
  boxSizing: "border-box",
};

const buttonStyle = {
  marginTop: 4,
  padding: "10px 0",
  fontSize: 14,
  fontWeight: 600,
  border: "none",
  borderRadius: 4,
  background: "#111",
  color: "#fff",
  cursor: "pointer",
};

const linkStyle = {
  background: "none",
  border: "none",
  color: "#06c",
  cursor: "pointer",
  fontSize: 13,
  padding: 0,
  textDecoration: "underline",
};
