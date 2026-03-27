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
| 2 | PTC ceramic heater element — 12V | Rated 200°C; one per tower |
| 2 | Thermal fuse — 192°C | Safety cutoff in series with each heater |
| 2 | 25A Solid State Relay (SSR) | Active HIGH control from ESP32 GPIO; switches heater circuit |

---

## Airflow

| Qty | Item | Notes |
|-----|------|-------|
| 4 | GDSTIME 3010 30mm DC blower fan — 24V | 2 per tower (1 dry circulation, 1 regen exhaust) |
| 2 | 3-way solenoid valve — 12V | Supply and return switching between towers |
| 2 | Exhaust solenoid valve — 12V | One per tower; opens during regeneration |

---

## Switching & Control

| Qty | Item | Notes |
|-----|------|-------|
| 1 | 8-channel relay module | Active LOW; controls all fans and valves |

---

## Power

| Qty | Item | Notes |
|-----|------|-------|
| 1 | 24V DC PSU | For fans |
| 1 | Buck converter (24V → 12V) | For heaters and valves (e.g. DROK) |
| 1 | Buck converter (24V → 5V) | For ESP32 and sensors |

> **Open issue:** Power architecture needs a confirmed multi-rail solution. Voltage mismatch between 24V fans and 12V heaters is unresolved — verify buck converter specs before wiring.

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
| — | 14 AWG wire (black, white) | For 120V AC heater circuits |
| — | Low-voltage hookup wire (various colors) | For signal, 12V, and 24V runs |
| — | Wire nuts / ferrules | For mains-side connections |
| 1 | Grounded metal or fire-rated enclosure | Required for 120V components |

---

## Software / Libraries

Install via Arduino IDE → Sketch → Library Manager:

| Library | Purpose |
|---------|---------|
| Adafruit SHT31 Library | SHT31 humidity sensor driver |
| max6675 by Adafruit | MAX6675 thermocouple driver |
| WiFi | Built into ESP32 board package |
