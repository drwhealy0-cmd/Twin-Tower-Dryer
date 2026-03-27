# Bill of Materials — Twin Tower Desiccant Dryer

DIY Temperature Swing Adsorption (TSA) filament dryer using two desiccant towers, controlled by an ESP32.

Status legend: ✅ Purchased | ⚠️ Purchased but see note | ❌ Still needed

---

## Controller

| Qty | Item | Status | Notes |
|-----|------|--------|-------|
| 1 | ESP32 dev board | ✅ | Any standard 38-pin ESP32 devkit |

---

## Sensors

| Qty | Item | Status | Notes |
|-----|------|--------|-------|
| 2 | SHT31 humidity/temperature sensor module | ✅ | Teyleten Robot SHT31-D × 3 ordered (1 spare). I2C; one at address 0x44 (ADDR→GND), one at 0x45 (ADDR→3.3V) |
| 2 | MAX6675 thermocouple amplifier module | ✅ | Weewooday × 4 sets ordered (2 spare). SPI; one per tower, separate CS pins |
| 2 | K-type thermocouple | ✅ | Included in Weewooday MAX6675 sets above |

> **Warning:** DHT11 sensors (purchased Feb 2026) are NOT suitable for this project — humidity range starts at 20% RH (same as the switch threshold) and ±5% accuracy is too coarse. Use the SHT31s instead.

---

## Heating

| Qty | Item | Status | Notes |
|-----|------|--------|-------|
| 2 | PTCYIDU B-35×21 PTC ceramic heater — 12V DC, 50W | ✅ | Purchased Feb 2026. 200°C self-regulating; one per tower; draws ~4.2A max |
| 2 | Thermal fuse — 192°C | ✅ | MECCANIXITY RY192 × 6 ordered (4 spare). Safety cutoff wired in series with each heater |
| 2 | 25A Solid State Relay (SSR) | ❌ (optional) | Relay module can drive heaters directly within its 10A rating. Only needed for silent/solid-state switching. Active HIGH control from ESP32 GPIO; note 3.3V is marginal for 3V-min input — buffer with a transistor if used. |

---

## Airflow

| Qty | Item | Status | Notes |
|-----|------|--------|-------|
| 4 | GDSTIME 3010 30mm DC blower fan — 24V | ❌ | 2 per tower: 1 dry circulation, 1 regen exhaust |
| 6 | Beduan 2-way normally-closed 12V DC solenoid valve, 1/4" NPT | ✅ | Ordered March 26. 4 for supply/return switching + 2 for regen exhaust |
| — | Silicone or PTFE air hose, 1/4"–3/8" ID | ❌ | Airflow between towers and dry boxes; must tolerate ~180°C on regen side |

> **Note:** 3-way pilot-operated valves (seen in browsing history) require minimum inlet pressure that fan airflow cannot provide — do not purchase. The Beduan 2-way valves already ordered are correct. Two 2-way valves per path (supply + return) achieve equivalent switching.

---

## Switching & Control

| Qty | Item | Status | Notes |
|-----|------|--------|-------|
| 1 | AEDIKO 8-channel relay module, 5V coil, opto-isolated | ✅ | Ordered March 26. Active LOW — set jumper to LOW trigger. 10A rating handles heaters directly. |

---

## Power

| Qty | Item | Status | Notes |
|-----|------|--------|-------|
| 1 | Mean Well LRS-150-24 (24V, 6.5A) | ❌ | Main PSU |
| 1 | Buck converter 24V→12V, rated 6A+ | ❌ | For heaters (~4.2A) + valves; verify continuous current rating |
| 1 | Buck converter 24V→5V, rated 3A | ❌ | For ESP32 + relay module + sensors |

---

## Protection & Wiring

| Qty | Item | Status | Notes |
|-----|------|--------|-------|
| 1 | Fuse holder + 10A blade fuse | ❌ | On 12V rail, upstream of heaters and valves |
| — | Terminal blocks | ❌ | Power distribution for 12V and 5V rails |
| — | 18–16 AWG hookup wire (red, black, signal colors) | ❌ | 12V heater/valve runs; signal wiring to relay module and ESP32 |
| — | JST-XH connectors + crimper | ✅ | Sensor wiring to ESP32; relay module signal leads |
| — | Heat shrink tubing (assorted) | ✅ | Insulation on solder joints and exposed terminals |
| — | M3 standoffs + screws | ❌ | Mounting ESP32 and relay module in enclosure |
| 1 | Enclosure | ✅ (print) | 3D print in ASA or PETG — do NOT use PLA (softens ~60°C, relay/buck converters run warm). Include ventilation near buck converters. All voltages are low-voltage DC so printed enclosure is safe. |

---

## Desiccant & Dry Boxes

| Qty | Item | Status | Notes |
|-----|------|--------|-------|
| 2 | Repurposed Litholyme medical container | ✅ | Desiccant towers |
| ~5 lb | Activated alumina desiccant | ✅ | Slice Engineering 2 lb (Feb 12) + Dry & Dry 3 lb (March 5) = 5 lb total. Verify this fills both towers before proceeding. |
| 6 | Skroam 4L airtight containers | ✅ | Dry boxes for filament storage |
| 12 | Mini digital hygrometer/thermometer | ✅ | For monitoring humidity inside dry boxes |

> **Open issue:** Litholyme container plastic type is unidentified. Regen temps (~180°C) may exceed HDPE/PP limits — verify material before running a full regen cycle.

---

## Not Suitable for This Project

| Item | Status | Reason |
|------|--------|--------|
| PTFE tube 4mm OD / 2.5mm ID | Purchased — do not use for airflow | Designed for 3D printer filament routing — far too small for airflow. May be repurposed for wiring protection. |
| PC4-M10 pneumatic fittings | Purchased — do not use for airflow | Matched to 4mm tube; same issue. |
| DHT11 sensors | Purchased — do not use | Humidity range starts at 20% RH (same as switch threshold); ±5% accuracy too coarse. Use SHT31s instead. |
| U.S. Solid / AIRIX 3-way pilot-operated valves | Browsing history — do not purchase | Pilot-operated; require minimum inlet pressure that fan airflow cannot provide. |

---

## Software / Libraries

Install via Arduino IDE → Sketch → Library Manager:

| Library | Purpose |
|---------|---------|
| Adafruit SHT31 Library | SHT31 humidity sensor driver |
| max6675 by Adafruit | MAX6675 thermocouple driver |
| WiFi | Built into ESP32 board package |
