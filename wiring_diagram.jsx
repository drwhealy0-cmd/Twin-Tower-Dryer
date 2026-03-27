import { useState } from "react";

// ─── Shared styles ────────────────────────────────────────────────
const C = {
  bg:       "#0a0e1a",
  panel:    "#0f1629",
  border:   "#1e2d4a",
  muted:    "#3a4d6b",
  text:     "#c8d8f0",
  dim:      "#6b7fa0",
  red:      "#ff4444",
  yellow:   "#f5a623",
  green:    "#3be8a0",
  blue:     "#4da6ff",
  purple:   "#b57bff",
  pink:     "#ff6bb5",
  teal:     "#40d9d9",
  warn_bg:  "#2a0a0a",
  warn_brd: "#ff4444",
  note_bg:  "#0a1628",
  note_brd: "#4da6ff",
};

const font = "'Courier New', 'Lucida Console', monospace";

const s = {
  page: {
    backgroundColor: C.bg, color: C.text, minHeight: "100vh",
    padding: "14px", fontFamily: font, fontSize: "12px", lineHeight: 1.5,
  },
  header: {
    textAlign: "center", marginBottom: "16px",
  },
  h1: {
    fontSize: "15px", fontWeight: "bold", color: "#e8f0ff", letterSpacing: "0.05em",
    textTransform: "uppercase", marginBottom: "2px",
  },
  subtitle: { color: C.dim, fontSize: "11px" },
  tabs: { display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap" },
  tab: (active) => ({
    padding: "6px 12px", border: `1px solid ${active ? C.blue : C.border}`,
    borderRadius: "4px", cursor: "pointer", fontFamily: font, fontSize: "12px",
    backgroundColor: active ? "#0d2040" : C.panel,
    color: active ? C.blue : C.dim, transition: "all 0.15s",
  }),
  warning: {
    backgroundColor: C.warn_bg, border: `1px solid ${C.warn_brd}`,
    borderRadius: "4px", padding: "8px 12px", marginBottom: "12px",
    color: "#ff8888", fontSize: "11px",
  },
  note: {
    backgroundColor: C.note_bg, borderLeft: `3px solid ${C.blue}`,
    padding: "6px 10px", marginBottom: "10px", color: C.dim, fontSize: "11px",
    borderRadius: "0 4px 4px 0",
  },
  section: { marginBottom: "16px" },
  sectionTitle: {
    color: C.yellow, fontWeight: "bold", fontSize: "11px", letterSpacing: "0.1em",
    textTransform: "uppercase", borderBottom: `1px solid ${C.border}`,
    paddingBottom: "4px", marginBottom: "8px",
  },
  wireRow: {
    display: "flex", alignItems: "center", gap: "0", marginBottom: "5px",
    flexWrap: "wrap", rowGap: "4px",
  },
  box: (color) => ({
    backgroundColor: C.panel, border: `1px solid ${color || C.border}`,
    borderRadius: "3px", padding: "3px 8px", fontSize: "11px",
    color: C.text, whiteSpace: "nowrap", maxWidth: "220px",
  }),
  wireConnector: (color) => ({
    display: "flex", flexDirection: "column", alignItems: "center",
    minWidth: "64px", padding: "0 4px",
  }),
  wireLine: (color) => ({
    height: "1px", width: "100%", backgroundColor: color || C.muted,
    position: "relative",
  }),
  wireLabel: (color) => ({
    color: color || C.dim, fontSize: "9px", whiteSpace: "nowrap",
    marginBottom: "2px", letterSpacing: "0.05em",
  }),
  arrow: (color) => ({ color: color || C.muted, fontSize: "11px" }),
  table: { width: "100%", borderCollapse: "collapse", fontSize: "11px" },
  th: {
    backgroundColor: "#0a1a30", padding: "6px 10px", textAlign: "left",
    color: C.blue, fontWeight: "bold", borderBottom: `1px solid ${C.border}`,
    whiteSpace: "nowrap",
  },
  td: { padding: "5px 10px", borderBottom: `1px solid ${C.border}` },
  tr: (i) => ({ backgroundColor: i % 2 === 0 ? C.bg : C.panel }),
  badge: (color) => ({
    backgroundColor: color + "22", border: `1px solid ${color}`,
    borderRadius: "3px", padding: "1px 6px", color: color,
    fontSize: "10px", whiteSpace: "nowrap", display: "inline-block",
  }),
};

// ─── Wire Row component ───────────────────────────────────────────
function WireRow({ from, wire, wColor, to, toColor }) {
  return (
    <div style={s.wireRow}>
      <div style={s.box(wColor)}>{from}</div>
      <div style={s.wireConnector(wColor)}>
        <div style={s.wireLabel(wColor)}>{wire}</div>
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: wColor || C.muted }} />
          <div style={s.arrow(wColor)}>▶</div>
        </div>
      </div>
      <div style={s.box(toColor || wColor)}>{to}</div>
    </div>
  );
}

// ─── POWER VIEW ──────────────────────────────────────────────────
function PowerView() {
  return (
    <div>
      <div style={s.warning}>
        ⚠ HIGH VOLTAGE — 120V AC is lethal. Use 14 AWG wire minimum,
        properly rated wire nuts, and mount everything in a grounded metal or fire-rated enclosure.
        Double-check all connections before powering on. If unsure, have an electrician review it.
      </div>

      <div style={s.note}>
        The SSR (Solid State Relay) has TWO completely separate sides: a high-voltage LOAD side
        that switches your 120V heater, and a low-voltage CONTROL side that the ESP32 triggers
        with a small 3.3V signal. Never let the two sides touch.
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>Tower A — Heater Circuit</div>
        <WireRow from="Wall Outlet — Hot (L)" wire="14 AWG BLACK" wColor={C.red} to="Thermal Fuse A — 192°C" />
        <WireRow from="Thermal Fuse A" wire="14 AWG BLACK" wColor={C.red} to="SSR1 — Terminal A2 (Load In)" />
        <WireRow from="SSR1 — Terminal A1 (Load Out)" wire="14 AWG BLACK" wColor={C.red} to="PTC Heater A" />
        <WireRow from="PTC Heater A" wire="14 AWG WHITE" wColor="#cccccc" to="Wall Outlet — Neutral (N)" />
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>Tower B — Heater Circuit</div>
        <WireRow from="Wall Outlet — Hot (L)" wire="14 AWG BLACK" wColor={C.red} to="Thermal Fuse B — 192°C" />
        <WireRow from="Thermal Fuse B" wire="14 AWG BLACK" wColor={C.red} to="SSR2 — Terminal A2 (Load In)" />
        <WireRow from="SSR2 — Terminal A1 (Load Out)" wire="14 AWG BLACK" wColor={C.red} to="PTC Heater B" />
        <WireRow from="PTC Heater B" wire="14 AWG WHITE" wColor="#cccccc" to="Wall Outlet — Neutral (N)" />
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>SSR Control Side (Low Voltage)</div>
        <div style={s.note}>
          This is the safe side. The ESP32 GPIO pin sends ~3.3V to tell the SSR
          to close the 120V circuit. HIGH signal = heater on. GND must be shared
          between ESP32 and SSR control−.
        </div>
        <WireRow from="ESP32 GPIO 26" wire="SIGNAL" wColor={C.yellow} to="SSR1 — Control + (DC+)" />
        <WireRow from="ESP32 GND" wire="GND" wColor={C.muted} to="SSR1 — Control − (DC−)" />
        <WireRow from="ESP32 GPIO 27" wire="SIGNAL" wColor={C.yellow} to="SSR2 — Control + (DC+)" />
        <WireRow from="ESP32 GND" wire="GND" wColor={C.muted} to="SSR2 — Control − (DC−)" />
      </div>
    </div>
  );
}

// ─── SIGNAL VIEW ─────────────────────────────────────────────────
function SignalView() {
  return (
    <div>
      <div style={s.section}>
        <div style={s.sectionTitle}>12V Power Distribution</div>
        <div style={s.note}>
          The 12V PSU powers all fans, valves, and the relay module.
          Crucially, the 12V PSU GND and the ESP32 GND must be tied together —
          this is called a "common ground" and without it, signals between devices
          won't have a reference point and the system won't work.
        </div>
        <WireRow from="12V PSU +" wire="12V RED" wColor={C.red} to="Relay Module VCC + all COM terminals" />
        <WireRow from="12V PSU −" wire="GND BLACK" wColor={C.muted} to="Relay Module GND" />
        <WireRow from="12V PSU −" wire="COMMON GND" wColor={C.muted} to="ESP32 GND  ← tie these together!" toColor={C.yellow} />
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>8-Channel Relay Module → Fans & Valves</div>
        <div style={s.note}>
          Relay IN pins are ACTIVE LOW — send a LOW signal (0V) to trigger the relay ON.
          This is the opposite of what you might expect. The relay VCC connects to ESP32 5V (VIN pin),
          not 3.3V. Each relay switches 12V to the connected fan or valve.
        </div>
        {[
          [C.teal,   "GPIO 14", "Relay IN1", "3-Way Supply Valve (LOW = Tower A active)"],
          [C.teal,   "GPIO 12", "Relay IN2", "3-Way Return Valve (LOW = Tower A active)"],
          [C.teal,   "GPIO 13", "Relay IN3", "Exhaust Valve A (LOW = open)"],
          [C.teal,   "GPIO 15", "Relay IN4", "Exhaust Valve B (LOW = open)"],
          [C.blue,   "GPIO 32", "Relay IN5", "Fan A — Dry circulation"],
          [C.blue,   "GPIO 33", "Relay IN6", "Fan A — Regen exhaust"],
          [C.blue,   "GPIO 25", "Relay IN7", "Fan B — Dry circulation"],
          [C.blue,   "GPIO 23", "Relay IN8", "Fan B — Regen exhaust"],
        ].map(([color, gpio, relay, label]) => (
          <WireRow key={gpio}
            from={`ESP32 ${gpio}`} wire="SIGNAL" wColor={color}
            to={`${relay} → ${label}`} />
        ))}
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>SHT31 Humidity Sensors — I2C Bus</div>
        <div style={s.note}>
          I2C is a protocol that lets multiple devices share just two wires (SDA = data, SCL = clock).
          Each device has a unique address so the ESP32 knows who it's talking to.
          Sensor #1: ADDR pin to GND = address 0x44. Sensor #2: ADDR pin to 3.3V = address 0x45.
          Place #1 on the dry box return air inlet, #2 on the active tower outlet.
        </div>
        <WireRow from="ESP32 3.3V" wire="POWER" wColor={C.purple} to="SHT31 #1 VCC + SHT31 #2 VCC" />
        <WireRow from="ESP32 GND"  wire="GND"   wColor={C.muted}  to="SHT31 #1 GND + SHT31 #2 GND" />
        <WireRow from="ESP32 GPIO 21" wire="I2C SDA" wColor={C.green} to="SHT31 #1 SDA + SHT31 #2 SDA" />
        <WireRow from="ESP32 GPIO 22" wire="I2C SCL" wColor={C.green} to="SHT31 #1 SCL + SHT31 #2 SCL" />
        <WireRow from="GND"    wire="ADDR" wColor={C.muted}  to="SHT31 #1 ADDR pin → address 0x44" />
        <WireRow from="3.3V"   wire="ADDR" wColor={C.purple} to="SHT31 #2 ADDR pin → address 0x45" />
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>MAX6675 Thermocouple Modules — SPI Bus</div>
        <div style={s.note}>
          SPI uses three shared wires (SCK = clock, MISO = data back to ESP32) plus one
          individual CS (Chip Select) wire per device. The ESP32 pulls a CS pin LOW to say
          "I'm talking to YOU now" — that's how it reads one sensor at a time.
        </div>
        <WireRow from="ESP32 3.3V"    wire="POWER"   wColor={C.purple} to="MAX6675 #1 VCC + #2 VCC" />
        <WireRow from="ESP32 GND"     wire="GND"     wColor={C.muted}  to="MAX6675 #1 GND + #2 GND" />
        <WireRow from="ESP32 GPIO 18" wire="SPI SCK" wColor={C.blue}   to="MAX6675 #1 SCK + #2 SCK" />
        <WireRow from="ESP32 GPIO 19" wire="SPI MISO (SO)" wColor={C.blue} to="MAX6675 #1 SO + #2 SO" />
        <WireRow from="ESP32 GPIO 5"  wire="CS1"     wColor={C.pink}   to="MAX6675 #1 CS — Tower A" />
        <WireRow from="ESP32 GPIO 17" wire="CS2"     wColor={C.pink}   to="MAX6675 #2 CS — Tower B" />
      </div>
    </div>
  );
}

// ─── PIN MAP VIEW ─────────────────────────────────────────────────
function PinView() {
  const pins = [
    [C.red,    "GPIO 26", "OUTPUT",   "SSR1",           "Heater Tower A — HIGH = ON"],
    [C.red,    "GPIO 27", "OUTPUT",   "SSR2",           "Heater Tower B — HIGH = ON"],
    [C.teal,   "GPIO 14", "OUTPUT",   "Relay IN1",      "3-Way Supply Valve"],
    [C.teal,   "GPIO 12", "OUTPUT",   "Relay IN2",      "3-Way Return Valve"],
    [C.teal,   "GPIO 13", "OUTPUT",   "Relay IN3",      "Exhaust Valve A"],
    [C.teal,   "GPIO 15", "OUTPUT",   "Relay IN4",      "Exhaust Valve B"],
    [C.blue,   "GPIO 32", "OUTPUT",   "Relay IN5",      "Fan A — Dry"],
    [C.blue,   "GPIO 33", "OUTPUT",   "Relay IN6",      "Fan A — Regen"],
    [C.blue,   "GPIO 25", "OUTPUT",   "Relay IN7",      "Fan B — Dry"],
    [C.blue,   "GPIO 23", "OUTPUT",   "Relay IN8",      "Fan B — Regen"],
    [C.green,  "GPIO 21", "I2C SDA",  "SHT31 ×2",       "Humidity sensors (shared bus)"],
    [C.green,  "GPIO 22", "I2C SCL",  "SHT31 ×2",       "Humidity sensors (shared bus)"],
    [C.blue,   "GPIO 18", "SPI SCK",  "MAX6675 ×2",     "Thermocouple clock (shared)"],
    [C.blue,   "GPIO 19", "SPI MISO", "MAX6675 ×2",     "Thermocouple data (shared)"],
    [C.pink,   "GPIO 5",  "SPI CS",   "MAX6675 #1",     "Tower A thermocouple select"],
    [C.pink,   "GPIO 17", "SPI CS",   "MAX6675 #2",     "Tower B thermocouple select"],
    [C.purple, "3.3V",    "POWER",    "SHT31, MAX6675", "Sensor power supply"],
    [C.yellow, "5V (VIN)","POWER",    "Relay module",   "Relay coil power"],
    [C.muted,  "GND",     "COMMON",   "All devices",    "Shared ground — tie everything here"],
  ];

  return (
    <div>
      <div style={s.note}>
        Relay pins are ACTIVE LOW (send LOW to turn on). SSR pins are ACTIVE HIGH (send HIGH to turn on).
        Never connect 5V or 12V to a GPIO pin — max input is 3.3V or you'll fry the ESP32.
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={s.table}>
          <thead>
            <tr>
              {["Pin", "Direction", "Connected To", "Notes"].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pins.map(([color, pin, dir, device, note], i) => (
              <tr key={pin + i} style={s.tr(i)}>
                <td style={s.td}><span style={s.badge(color)}>{pin}</span></td>
                <td style={{ ...s.td, color: C.dim }}>{dir}</td>
                <td style={s.td}>{device}</td>
                <td style={{ ...s.td, color: C.dim }}>{note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────
export default function WiringDiagram() {
  const [tab, setTab] = useState("power");
  const tabs = [
    ["power",  "⚡  120V Power"],
    ["signal", "📡  Low Voltage"],
    ["pins",   "📋  Pin Map"],
  ];

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.h1}>Twin Tower Desiccant Dryer</div>
        <div style={s.subtitle}>Wiring Reference — ESP32 + SSR + Relay Module</div>
      </div>
      <div style={s.tabs}>
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={s.tab(tab === id)}>
            {label}
          </button>
        ))}
      </div>
      {tab === "power"  && <PowerView />}
      {tab === "signal" && <SignalView />}
      {tab === "pins"   && <PinView />}
    </div>
  );
}
