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
| 2 | PTCYIDU B-35×21 PTC ceramic heater — 12V DC, 50W | 200°C self-regulating; one per tower; draws ~4.2A max |
| 2 | Thermal fuse — 192°C | Safety cutoff wired in series with each heater |
| 2 | 25A Solid State Relay (SSR) | **Optional** — relay module can drive heaters directly within its 10A rating. Use SSRs only if silent/solid-state switching is preferred. Active HIGH control from ESP32 GPIO. |

---

## Airflow

| Qty | Item | Notes |
|-----|------|-------|
| 4 | GDSTIME 3010 30mm DC blower fan — 24V | 2 per tower: 1 dry circulation, 1 regen exhaust |
| 4 | Beduan 2-way normally-closed 12V DC solenoid valve, 1/4" NPT | Supply + return switching per tower; replaces original 3-way valve design |
| 2 | Beduan 2-way normally-closed 12V DC solenoid valve, 1/4" NPT | One per tower regen exhaust path |
| — | Silicone or PTFE air hose, 1/4"–3/8" ID | Airflow between towers and dry boxes; must tolerate ~180°C on regen side. **Note:** 4mm OD PTFE filament tube (already purchased) is too small — do not use for airflow. |

> **Note:** 3-way pilot-operated valves require minimum inlet pressure that fan airflow cannot provide. Two 2-way valves per path (supply + return) achieve equivalent switching. This change also means the `.ino` pin assignments need updating from 2 relay pins (3-way) to 4+ relay pins (2-way pairs), consuming all 8 relay channels.

---

## Switching & Control

| Qty | Item | Notes |
|-----|------|-------|
| 1 | AEDIKO 8-channel relay module, 5V coil, opto-isolated | Active LOW (jumper set to LOW trigger); controls fans and valves. 10A rating handles heaters directly if SSRs are skipped. |

---

## Power

| Qty | Item | Notes |
|-----|------|-------|
| 1 | Mean Well LRS-150-24 (24V, 6.5A) | Main PSU; recommended for clean regulation |
| 1 | Buck converter 24V→12V, rated 6A+ | For heaters (~4.2A) + valves; verify continuous current rating |
| 1 | Buck converter 24V→5V, rated 3A | For ESP32 + relay module + sensors |

---

## Protection & Wiring

| Qty | Item | Notes |
|-----|------|-------|
| 1 | Fuse holder + 10A blade fuse | On 12V rail, upstream of heaters and valves |
| — | Terminal blocks | Power distribution for 12V and 5V rails |
| — | 18–16 AWG hookup wire (red, black, and signal colors) | 12V heater/valve runs; signal wiring to relay module and ESP32 |
| — | Dupont connectors or JST-XH connectors + crimper | Sensor wiring to ESP32; relay module signal leads |
| — | Heat shrink tubing (assorted) | Insulation on solder joints and exposed terminals |
| — | M3 standoffs + screws | Mounting ESP32 and relay module in enclosure |
| 1 | Enclosure (plastic or metal, fire-rated preferred) | Houses ESP32, relay module, buck converters; all voltages in this build are low-voltage DC |

> **Removed:** Previous BOM incorrectly listed 14 AWG wire for "120V AC heater circuits." There is no mains AC in this build — heaters run on 12V DC.

---

## Enclosure & Desiccant

| Qty | Item | Notes |
|-----|------|-------|
| 2 | Repurposed Litholyme medical container | Used as desiccant towers |
| 2 lb | Activated alumina desiccant — Slice Engineering | ✅ Already purchased. May need more depending on tower volume — measure containers before filling. |

> **Open issue:** Container plastic type is unidentified. Regen temps (~180°C) may exceed HDPE/PP limits — verify material before running a full regen cycle.

---

## Not Suitable for This Project

| Item | Reason |
|------|--------|
| PTFE tube 4mm OD / 2.5mm ID (already purchased) | Designed for 3D printer filament routing — far too small for airflow. May be repurposed for wiring protection or small pneumatic signal lines. |
| PC4-M10 pneumatic fittings (already purchased) | Matched to 4mm tube; same issue. |

---

## Software / Libraries

Install via Arduino IDE → Sketch → Library Manager:

| Library | Purpose |
|---------|---------|
| Adafruit SHT31 Library | SHT31 humidity sensor driver |
| max6675 by Adafruit | MAX6675 thermocouple driver |
| WiFi | Built into ESP32 board package |
