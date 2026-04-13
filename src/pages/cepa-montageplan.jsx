import { useState, useMemo, useRef } from "react";
import { supabase } from '../supabaseClient';
import makerjs from 'makerjs';


// ─── Konstanten (alle Maße in mm, Darstellung skaliert) ───────────────────────
const DEFAULTS = {
  modulBreite: 2400,    // mm – Gesamtbreite Modul
  modulHoehe: 1200,     // mm – Gesamthöhe Modul
  randAbstand: 165,     // mm – Abstand Zaunschiene / Außenkante
  rohrAbstand: 150,     // mm – Achsabstand Rohre (wählbar: 100/150/200)
  schlauchD: 18,        // mm – Rohrdurchmesser (visuell)
  aussparungBreite: 600,
  aussparungHoehe: 400,
  aussparungX: 900,     // Offset von links
  aussparungY: 300,     // Offset von oben
};

const ROHR_ABSTAENDE = [100, 150, 200];
const CANVAS_W = 860;  // px Darstellungsbreite

// ─── Mäander-Pfad-Generator ───────────────────────────────────────────────────
/**
 * Generiert Mäanderpfad-Segmente für eine Reihe.
 * Berücksichtigt die Aussparung: Schlaufen, die in den Aussparungsbereich fallen,
 * werden übersprungen.
 *
 * @param {object} p – Parameter
 * @returns {string[]} – SVG path strings
 */
function generateMaeander({
  modulBreite, modulHoehe,
  randAbstand, rohrAbstand,
  aussparungBreite, aussparungHoehe, aussparungX, aussparungY,
  scale,
}) {
  // Verfügbarer Bereich für Schlaufen (innerhalb Randabstand)
  const x0 = randAbstand;
  const x1 = modulBreite - randAbstand;
  const y0 = randAbstand;
  const y1 = modulHoehe - randAbstand;

  const loopRadius = rohrAbstand / 2;

  // Anzahl vertikaler Rohrstränge
  const availableWidth = x1 - x0;
  const numLoops = Math.floor(availableWidth / rohrAbstand);

  // Höhe der Vertikalstränge
  const vertH = y1 - y0;

  // Verbindungslinie oben/unten (Vorlauf/Rücklauf)
  let goingDown = true; // Vorlauf beginnt oben links, geht nach unten
  const segments = [];

  // Mäander als ein zusammenhängender Pfad:
  // Start oben links → runter → Halbkreis unten rechts → hoch → Halbkreis oben rechts → ...
  // Der Halbkreis verbindet das ENDE eines Strangs mit dem ANFANG des nächsten.
  // goingDown=true  → Strang endet bei y1 (unten) → Bogen wölbt nach UNTEN (sweep=1, large-arc=0)
  // goingDown=false → Strang endet bei y0 (oben)  → Bogen wölbt nach OBEN  (sweep=0, large-arc=0)

  for (let i = 0; i < numLoops; i++) {
    const xA = x0 + i * rohrAbstand;
    const xB = xA + rohrAbstand;
    if (xB > x1) break;

    // Aussparungscheck
    const inAussparungX = (xA >= aussparungX && xA <= aussparungX + aussparungBreite) ||
                          (xB >= aussparungX && xB <= aussparungX + aussparungBreite) ||
                          (xA <= aussparungX && xB >= aussparungX + aussparungBreite);
    const inAussparungY_partial = aussparungY < y1 && aussparungY + aussparungHoehe > y0;
    if (inAussparungX && inAussparungY_partial) continue;

    const yStart = goingDown ? y0 : y1;
    const yEnd   = goingDown ? y1 : y0;

    // Vertikaler Strang
    segments.push({
      type: "line",
      x1: xA, y1: yStart,
      x2: xA, y2: yEnd,
    });

    // Halbkreis: von (xA, yEnd) nach (xB, yEnd)
    // goingDown → Bogen wölbt nach unten → sweep=1
    // goingUp   → Bogen wölbt nach oben  → sweep=0
    segments.push({
      type: "arc",
      r: loopRadius,
      fromX: xA, fromY: yEnd,
      toX:   xB, toY:   yEnd,
      sweep: goingDown ? 1 : 0,
    });

    goingDown = !goingDown;
  }

  // Letzter Strang schließt den Mäander ab
  const lastX = x0 + Math.floor((x1 - x0) / rohrAbstand) * rohrAbstand;
  if (lastX <= x1) {
    const yStart = goingDown ? y0 : y1;
    const yEnd   = goingDown ? y1 : y0;
    segments.push({
      type: "line",
      x1: lastX, y1: yStart,
      x2: lastX, y2: yEnd,
    });
  }

  // Zu SVG-Path umwandeln (skaliert)
  const s = scale;
  const pathStrings = segments.map((seg) => {
    if (seg.type === "line") {
      return `M ${seg.x1 * s} ${seg.y1 * s} L ${seg.x2 * s} ${seg.y2 * s}`;
    }
    if (seg.type === "arc") {
      return `M ${seg.fromX * s} ${seg.fromY * s} A ${seg.r * s} ${seg.r * s} 0 0 ${seg.sweep} ${seg.toX * s} ${seg.toY * s}`;
    }
    return "";
  });

  return pathStrings;
}

function downloadSVG(svgRef) {
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgRef.current);
  const blob = new Blob([svgStr], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "CEPA-Montageplan.svg";
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────
export default function CEPAMontageplan({ session }) {
  const [params, setParams] = useState(DEFAULTS);
  const svgRef = useRef(null);

  const scale = CANVAS_W / params.modulBreite;
  const canvasH = params.modulHoehe * scale;

  const set = (key) => (e) =>
    setParams((p) => ({ ...p, [key]: Number(e.target.value) }));

  const maeander = useMemo(
    () => generateMaeander({ ...params, scale }),
    [params, scale]
  );

  // Abgeleitete Werte für Anzeige
  const verfuegbarBreite = params.modulBreite - 2 * params.randAbstand;
  const anzahlSchlaufen = Math.floor(verfuegbarBreite / params.rohrAbstand);

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <span style={styles.logo}>CEPA</span>
        <span style={styles.title}>Montagerichtlinien-Planer</span>
      </header>

      <div style={styles.layout}>
        {/* ── Steuerung ── */}
        <aside style={styles.aside}>
          <Section label="Modul">
            <Slider label="Breite (mm)" min={600} max={4000} step={50}
              value={params.modulBreite} onChange={set("modulBreite")} />
            <Slider label="Höhe (mm)" min={400} max={2000} step={50}
              value={params.modulHoehe} onChange={set("modulHoehe")} />
          </Section>

          <Section label="Rohr">
            <div style={styles.radioGroup}>
              {ROHR_ABSTAENDE.map((v) => (
                <label key={v} style={{
                  ...styles.radioLabel,
                  background: params.rohrAbstand === v ? "#b5e831" : "#1e1e1e",
                  color: params.rohrAbstand === v ? "#000" : "#aaa",
                }}>
                  <input type="radio" name="rohrAbstand" value={v}
                    checked={params.rohrAbstand === v}
                    onChange={set("rohrAbstand")}
                    style={{ display: "none" }} />
                  {v} mm
                </label>
              ))}
            </div>
            <Slider label="Randabstand (mm)" min={100} max={250} step={5}
              value={params.randAbstand} onChange={set("randAbstand")} />
          </Section>

          <Section label="Aussparung">
            <Slider label="Breite (mm)" min={100} max={params.modulBreite - 200} step={50}
              value={params.aussparungBreite} onChange={set("aussparungBreite")} />
            <Slider label="Höhe (mm)" min={100} max={params.modulHoehe - 200} step={50}
              value={params.aussparungHoehe} onChange={set("aussparungHoehe")} />
            <Slider label="Position X (mm)" min={0} max={params.modulBreite - params.aussparungBreite} step={50}
              value={params.aussparungX} onChange={set("aussparungX")} />
            <Slider label="Position Y (mm)" min={0} max={params.modulHoehe - params.aussparungHoehe} step={50}
              value={params.aussparungY} onChange={set("aussparungY")} />
          </Section>

          <div style={styles.infoBox}>
            <InfoRow label="Schlaufen" value={anzahlSchlaufen} />
            <InfoRow label="Verfügbar" value={`${verfuegbarBreite} mm`} />
            <InfoRow label="Rohrabstand" value={`${params.rohrAbstand} mm`} />
          </div>
          <button onClick={()=>downloadSVG(svgRef)}>SVG exportieren</button>
        </aside>

        {/* ── SVG Canvas ── */}
        <main style={styles.main}>
          <div style={styles.canvasWrap}>
            <svg
              width={CANVAS_W}
              height={canvasH}
              viewBox={`0 0 ${CANVAS_W} ${canvasH}`}
              style={styles.svg}
              ref={svgRef}
            >
              {/* Hintergrund Modul */}
              <rect x={0} y={0} width={CANVAS_W} height={canvasH}
                fill="#e8dcc8" stroke="#888" strokeWidth={1} />

              {/* Randabstand-Indikator */}
              <rect
                x={params.randAbstand * scale}
                y={params.randAbstand * scale}
                width={(params.modulBreite - 2 * params.randAbstand) * scale}
                height={(params.modulHoehe - 2 * params.randAbstand) * scale}
                fill="none" stroke="#aaa" strokeWidth={0.5} strokeDasharray="4 3"
              />

              {/* Mäander-Rohre */}
              {maeander.map((d, i) => (
                <path key={i} d={d}
                  stroke="#b5e831" strokeWidth={Math.max(2, params.schlauchD * scale * 0.5)}
                  fill="none" strokeLinecap="round" strokeLinejoin="round"
                />
              ))}

              {/* Aussparung (weiß) */}
              <rect
                x={params.aussparungX * scale}
                y={params.aussparungY * scale}
                width={params.aussparungBreite * scale}
                height={params.aussparungHoehe * scale}
                fill="white" stroke="#e07030" strokeWidth={1.5}
              />

              {/* Aussparung Label */}
              <text
                x={(params.aussparungX + params.aussparungBreite / 2) * scale}
                y={(params.aussparungY + params.aussparungHoehe / 2) * scale}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={10} fill="#e07030" fontFamily="monospace"
              >
                {params.aussparungBreite} × {params.aussparungHoehe}
              </text>

              {/* Maßkette Rohrabstand */}
              {Array.from({ length: Math.min(3, anzahlSchlaufen) }).map((_, i) => {
                const xA = (params.randAbstand + i * params.rohrAbstand) * scale;
                const xB = xA + params.rohrAbstand * scale;
                const y = 18;
                return (
                  <g key={i}>
                    <line x1={xA} y1={y - 4} x2={xB} y2={y - 4} stroke="#555" strokeWidth={0.7} markerEnd="url(#arr)" />
                    <text x={(xA + xB) / 2} y={y - 7} textAnchor="middle" fontSize={7} fill="#555" fontFamily="monospace">
                      {params.rohrAbstand}
                    </text>
                  </g>
                );
              })}

              <defs>
                <marker id="arr" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
                  <path d="M0,0 L4,2 L0,4 Z" fill="#555" />
                </marker>
              </defs>
            </svg>
          </div>
          <div style={styles.scaleLine}>
            Maßstab: 1 px = {(1 / scale).toFixed(1)} mm &nbsp;|&nbsp;
            Modul: {params.modulBreite} × {params.modulHoehe} mm
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Sub-Komponenten ──────────────────────────────────────────────────────────
function Section({ label, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionLabel}>{label}</div>
      {children}
    </div>
  );
}

function Slider({ label, min, max, step, value, onChange }) {
  return (
    <label style={styles.sliderWrap}>
      <div style={styles.sliderHeader}>
        <span style={styles.sliderLabel}>{label}</span>
        <span style={styles.sliderVal}>{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={onChange} style={styles.slider} />
    </label>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value}</span>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  root: {
    background: "#111",
    color: "#ddd",
    minHeight: "100vh",
    fontFamily: "'DM Mono', 'Courier New', monospace",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "baseline",
    gap: 12,
    padding: "14px 24px",
    borderBottom: "1px solid #2a2a2a",
  },
  logo: {
    fontSize: 22,
    fontWeight: 700,
    color: "#b5e831",
    letterSpacing: 3,
  },
  title: {
    fontSize: 12,
    color: "#666",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  layout: {
    display: "flex",
    flex: 1,
    gap: 0,
  },
  aside: {
    width: 240,
    borderRight: "1px solid #1e1e1e",
    padding: "16px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    overflowY: "auto",
  },
  main: {
    flex: 1,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
    overflowX: "auto",
  },
  canvasWrap: {
    border: "1px solid #2a2a2a",
    display: "inline-block",
    background: "#1a1a1a",
    padding: 4,
  },
  svg: {
    display: "block",
  },
  scaleLine: {
    fontSize: 10,
    color: "#444",
    fontFamily: "monospace",
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 9,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#b5e831",
    marginBottom: 8,
    borderBottom: "1px solid #1e1e1e",
    paddingBottom: 4,
  },
  sliderWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    marginBottom: 10,
    cursor: "pointer",
  },
  sliderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  sliderLabel: {
    fontSize: 10,
    color: "#888",
  },
  sliderVal: {
    fontSize: 11,
    color: "#ddd",
    fontVariantNumeric: "tabular-nums",
    minWidth: 36,
    textAlign: "right",
  },
  slider: {
    width: "100%",
    accentColor: "#b5e831",
  },
  radioGroup: {
    display: "flex",
    gap: 6,
    marginBottom: 12,
  },
  radioLabel: {
    padding: "4px 10px",
    fontSize: 11,
    borderRadius: 3,
    cursor: "pointer",
    border: "1px solid #2a2a2a",
    transition: "all 0.15s",
  },
  infoBox: {
    background: "#1a1a1a",
    border: "1px solid #222",
    borderRadius: 4,
    padding: "10px 12px",
    marginTop: 8,
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 11,
    marginBottom: 5,
  },
  infoLabel: { color: "#555" },
  infoValue: { color: "#b5e831", fontVariantNumeric: "tabular-nums" },
};
