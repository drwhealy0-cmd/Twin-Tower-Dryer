# Bill of Materials — Twin Tower Desiccant Dryer

DIY Temperature Swing Adsorption (TSA) filament dryer using two desiccant towers, controlled by an ESP32.

---

## Controller

| Qty | Item | Notes |
|-----|------|-------|
| 1 | ESP32 dev board | Any standard 38-pin ESP32 devkit |

---

## Sensors

| Qty | Item | Notes |
|-----|------|-------|
| 2 | SHT31 humidity/temperature sensor module | I2C; one at address 0x44 (ADDR→GND), one at 0x45 (ADDR→3.3V) |
| 2 | MAX6675 thermocouple amplifier module | SPI; one per tower, separate CS pins |
| 2 | K-type thermocouple | Paired with MAX6675 modules |

---

## Heating

| Qty | Item | Notes |
|-----|------|-------|
| 2 | PTCYIDU B-35*21 PTC ceramic heater — 12V DC, 50W max | 200°C self-regulating; one per tower; draws ~4.2A max |
| 2 | Thermal fuse — 192°C | Safety cutoff in series with each heater |
| 2 | Solid State Relay (SSR) — 10A+, 3–32V DC control | Active HIGH from ESP32 GPIO; switches heater 12V circuit; relay module is fully used by valves/fans |

---

## Airflow

| Qty | Item | Notes |
|-----|------|-------|
| 2 | GDSTIME 3010 30mm DC blower fan — 24V | 1 per tower; runs during both drying and regen |
| 4 | Beduan 2-way normally-closed solenoid valve — 12V DC, 1/4" NPT | Supply and return path switching; 2 per flow path (one per tower side) |
| 2 | Beduan 2-way normally-closed solenoid valve — 12V DC, 1/4" NPT | Exhaust; one per tower, opens during regeneration |

---

## Switching & Control

| Qty | Item | Notes |
|-----|------|-------|
| 1 | 8-channel relay module | Active LOW; controls all fans and valves |

---

## Power

| Qty | Item | Notes |
|-----|------|-------|
| 1 | Mean Well LRS-150-24 — 24V, 6.5A PSU | Main supply; powers fans and feeds buck converters |
| 1 | Buck converter (24V → 12V, 6A+) | Heaters (up to 4.2A) + up to 4 valves; must be rated 6A or higher |
| 1 | Buck converter (24V → 5V, 3A) | ESP32 + relay module + sensors |

---

## Enclosure & Desiccant

| Qty | Item | Notes |
|-----|------|-------|
| 2 | Repurposed Litholyme medical container | Used as desiccant towers |
| — | Activated alumina desiccant | Fill both towers; regenerates at ~150–200°C |

> **Open issue:** Container plastic type is unidentified. Regen temps (~180°C) may exceed HDPE/PP limits — verify material before running a full regen cycle.

---

## Wiring & Hardware

| Qty | Item | Notes |
|-----|------|-------|
| — | 18 AWG wire (red/black) | For 12V heater and valve runs (~4–6A max) |
| — | 22 AWG hookup wire (various colors) | For 24V fan runs, 5V signal, and sensor wiring |
| — | Ferrules / ring terminals | For secure connections to relay and PSU terminals |
| 1 | Enclosure (plastic or metal) | Houses PSU, relay module, and ESP32 |

---

## Software / Libraries

Install via Arduino IDE → Sketch → Library Manager:

| Library | Purpose |
|---------|---------|
| Adafruit SHT31 Library | SHT31 humidity sensor driver |
| max6675 by Adafruit | MAX6675 thermocouple driver |
| WiFi | Built into ESP32 board package |
