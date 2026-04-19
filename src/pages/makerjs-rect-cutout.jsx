import { useState, useEffect, useRef } from "react";
import { buildModel, getTotalLength } from "../assets/modelFunctions";
import { supabase } from "../supabaseClient";
import makerjs from 'makerjs';

const DEFAULTS = {
  rectW: 3500,
  rectH: 2500,
  cutW: 1000,
  cutH: 700,
  cutX: 2000,   // Offset von links
  cutY: 1200,   // Offset von unten (maker.js Koordinaten: Y wächst nach oben),
  nof_refinements: 0,
  spacing_hor: 200,
  spacing_ver: 200,
  offset_x: 50,
  offset_y: 50,
  pipesLength: 0
};

export default function Makerjs( {session }) {
  const [p, setP] = useState(DEFAULTS);
  const svgRef = useRef(null);
  const [svgContent, setSvgContent] = useState("");
  const [dxfContent, setDxfContent] = useState("");
  const [error, setError] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false)
  const [activeNav, setActiveNav] = useState('Dashboard')
  
  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
  }
 
  const set = (key) => (e) => setP((prev) => ({ ...prev, [key]: Number(e.target.value) }));

  // Validierung: Ausschnitt muss innerhalb des Rechtecks liegen
  const isValid =
    p.cutX > 0 &&
    p.cutY > 0 &&
    p.cutX + p.cutW < p.rectW &&
    p.cutY + p.cutH < p.rectH &&
    p.cutW > 0 &&
    p.cutH > 0;

  useEffect(() => {
    if (!isValid) return;
    try {
      const { svgModel,dxfModel } = buildModel(p);
      p["pipesLength"] = Math.round((getTotalLength(dxfModel)/1000 + Number.EPSILON) * 100) / 100;
      const svg = makerjs.exporter.toSVG(svgModel, {
        layerOptions : {
          Wand : {
            stroke: '#00ff88',
            strokeWidth: '2',
            fill: '#f2c873',
          },
          Ausschnitt: {
            stroke: '#ff0000',
            strokeWidth: '2',
            fill: '#ffffff',
          },
          Gridlines: {
            stroke: '#000000',
            strokeWidth: '0.5',
            cssStyle: "stroke-dasharray: 1 5; stroke-linecap: round"
            
          }
          

        },
        svgAttrs: { id: "makerjs-svg",
          width: '100%',
          height: '100%',
          style: 'max-width: 100%; max-height: 100%;' },
        
        // Viewbox wird automatisch gesetzt
      });
      setSvgContent(svg);
      const dxfString = makerjs.exporter.toDXF(dxfModel, {
        layerOptions: {
          Wand: {color: 3},
          Ausschnitt: {color: 1}
        }
      });
      setDxfContent(dxfString);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, [p, isValid]);

  function downloadSVG() {
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rect-cutout.svg";
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadDXF () {
    const blob = new Blob([dxfContent], { type: "application/dxf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rect-cutout.dxf";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <span style={s.brand}>maker<span style={s.brandAccent}>.js</span></span>
        <span style={s.subtitle}>Parametric Rect / Cutout</span>
      </div>

      <div style={s.body}>
        {/* Sidebar */}
        <aside style={s.sidebar}>
          <Group label="Außenrechteck">
            <Slider label="Breite" unit="mm" min={3000} max={5000} step={5}
              value={p.rectW} onChange={set("rectW")} />
            <Slider label="Höhe" unit="mm" min={2000} max={3000} step={5}
              value={p.rectH} onChange={set("rectH")} />
          </Group>

          <Group label="Ausschnitt">
            <Slider label="Breite" unit="mm" min={300} max={p.rectW - 1000} step={5}
              value={p.cutW} onChange={set("cutW")} />
            <Slider label="Höhe" unit="mm" min={300} max={p.rectH - 1000} step={5}
              value={p.cutH} onChange={set("cutH")} />
            <Slider label="Offset X" unit="mm" min={1} max={p.rectW - p.cutW - 1} step={1}
              value={p.cutX} onChange={set("cutX")} />
            <Slider label="Offset Y" unit="mm" min={1} max={p.rectH - p.cutH - 1} step={1}
              value={p.cutY} onChange={set("cutY")} />
          </Group>
          <Group label="Verlegung">
            <Slider label="Abstand horizontal" unit="mm" min={50} max={300} step={10}
              value={p.spacing_hor} onChange={set("spacing_hor")} />
            <Slider label="Abstand vertikal" unit="mm" min={50} max={300} step={10}
              value={p.spacing_ver} onChange={set("spacing_ver")} />
          </Group>
          <Group label="Gitter">
            <Slider label="Anzahl Verfeinerungen" unit="mm" min={0} max={4} step={1}
              value={p.nof_refinements} onChange={set("nof_refinements")} />
          </Group>

          {!isValid && (
            <div style={s.warn}>⚠ Ausschnitt liegt außerhalb des Rechtecks</div>
          )}

          {/* Info */}
          <div style={s.infoBox}>
            <InfoRow label="Randabstand x" value={`${p.offset_x} mm`} />
            <InfoRow label="Randabstand y" value={`${p.offset_y} mm`} />
            <InfoRow label="Rohrlänge" value={`${p.pipesLength} m`} />

            
          </div>

          <button
            style={{ ...s.btn, opacity: svgContent ? 1 : 0.4 }}
            onClick={downloadSVG}
            disabled={!svgContent}
          >
            ↓ SVG exportieren
          </button>
          <button
            style={{ ...s.btn, opacity: svgContent ? 1 : 0.4 }}
            onClick={downloadDXF}
            disabled={!dxfContent}
          >
            ↓ DXF exportieren
          </button>
          <button onClick={handleLogout} disabled={loggingOut} style={s.logoutBtn}>
            {loggingOut ? '...' : '↪ Abmelden'}
          </button>
        </aside>

        {/* Canvas */}
        <main style={s.canvas}>
          <div style={s.canvasInner}>
          
          {error && <div style={s.error}>Fehler: {error}</div>}
          {!error && svgContent && (
            <div
              ref={svgRef}
              style={s.svgWrap}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Sub-Komponenten ────────────────────────────────────────────────────────────
function Group({ label, children }) {
  return (
    <div style={s.group}>
      <div style={s.groupLabel}>{label}</div>
      {children}
    </div>
  );
}

function Slider({ label, unit, min, max, step, value, onChange }) {
  return (
    <label style={s.sliderWrap}>
      <div style={s.sliderRow}>
        <span style={s.sliderLabel}>{label}</span>
        <span style={s.sliderVal}>{value} <span style={s.sliderUnit}>{unit}</span></span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={onChange} style={s.range} />
    </label>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={s.infoRow}>
      <span style={s.infoLabel}>{label}</span>
      <span style={s.infoVal}>{value}</span>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = {
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
  root: {
    background: "#0d0d0d",
    minHeight: "100vh",
    color: "#ccc",
    fontFamily: "'DM Mono', 'Fira Mono', monospace",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "baseline",
    gap: 10,
    padding: "12px 20px",
    borderBottom: "1px solid #1a1a1a",
    background: "#0a0a0a",
  },
  brand: {
    fontSize: 20,
    fontWeight: 700,
    color: "#eee",
    letterSpacing: -0.5,
  },
  brandAccent: { color: "#00ff88" },
  subtitle: {
    fontSize: 10,
    color: "#444",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  body: {
    display: "flex",
    flex: 1,
  },
  sidebar: {
    width: 230,
    borderRight: "1px solid #1a1a1a",
    padding: "16px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 0,
    overflowY: "auto",
  },
  canvas: {
    flex: 1,
    display: "flex",
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    background: "#111",
    //padding: 32,
  },
  canvasInner: {
  width: '100%',
  height: '100%',
  paddingTop: 30, paddingBottom: 100, paddingLeft: 30, paddingRight: 30,
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  },
  svgWrap: {
    width: "100%",
    height: "100%",
    background: "#ffffff",
    border: "1px solid #222",
    padding: 20,
    "& svg": { display: "block" },
  },
  loading: { color: "#444", fontSize: 13 },
  error:   { color: "#ff4444", fontSize: 12 },
  group: { marginBottom: 20 },
  groupLabel: {
    fontSize: 9,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#00ff88",
    borderBottom: "1px solid #1a1a1a",
    paddingBottom: 5,
    marginBottom: 10,
  },
  sliderWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    marginBottom: 11,
    cursor: "pointer",
  },
  sliderRow: {
    display: "flex",
    justifyContent: "space-between",
  },
  sliderLabel: { fontSize: 10, color: "#666" },
  sliderVal: { fontSize: 11, color: "#ddd", fontVariantNumeric: "tabular-nums" },
  sliderUnit: { fontSize: 9, color: "#444" },
  range: { width: "100%", accentColor: "#00ff88" },
  warn: {
    fontSize: 10,
    color: "#ffaa00",
    background: "#1a1400",
    border: "1px solid #332800",
    borderRadius: 3,
    padding: "6px 8px",
    marginBottom: 12,
  },
  infoBox: {
    background: "#141414",
    border: "1px solid #1e1e1e",
    borderRadius: 4,
    padding: "10px 12px",
    marginBottom: 14,
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 10,
    marginBottom: 5,
  },
  infoLabel: { color: "#444" },
  infoVal: { color: "#00ff88", fontVariantNumeric: "tabular-nums" },
  btn: {
    background: "#00ff88",
    color: "#000",
    border: "none",
    borderRadius: 3,
    padding: "8px 0",
    width: "100%",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
