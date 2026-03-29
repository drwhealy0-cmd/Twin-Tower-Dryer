# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DIY twin-tower Temperature Swing Adsorption (TSA) dryer for 3D printer filament. Uses two repurposed Litholyme medical containers filled with activated alumina desiccant, controlled by an ESP32. One tower dries (closed-loop air circulation to dry boxes) while the other regenerates (heats alumina to ~180°C to drive off moisture, exhausts to room).

## Architecture

- **`twin_tower_dryer.ino`** — ESP32 Arduino sketch (skeleton/framework, not yet fully working). Structured in numbered sections:
  - Pin definitions, tunable settings, global state, sensor objects, setup, main loop, tower switching functions, regeneration management, safety shutoff, status printing, and a phased TODO list.
  - Key design pattern: relay module is **active LOW** (LOW = device ON), SSR heater pins are **active HIGH** (HIGH = heater ON). This asymmetry is intentional and must be preserved. All 8 relay channels are consumed by valves and fans, so heaters require separate SSR outputs on pins 26/27.
  - `manageTowerRegen()` takes two pass-by-reference bools: `bool &regenDone` (regen cycle complete) and `bool &heatingDone` (target temp reached, heater locked off). The `heatingDone` flag prevents the heater from re-firing during cooldown.
  - 8 relay channels: VALVE_SUPPLY_A/B, VALVE_RETURN_A/B, EXHAUST_A/B, FAN_A, FAN_B. One fan per tower runs during both drying and regen.

- **`wiring_diagram.jsx`** — React component (designed for Claude.ai artifact rendering) with three tabbed views: 120V Power, Low Voltage signal wiring, and ESP32 Pin Map. Visual reference only — not part of the firmware build.

- **`wiring_diagram.html`** — Standalone HTML version of the wiring diagram. Open directly in a browser or use VS Code Live Preview extension to render it without any build tools.

- **`bill_of_materials.md`** — Full parts list for the project.

## Hardware

- **Controller:** ESP32 dev board
- **Sensors:** 2× SHT31 (I2C, addresses 0x44/0x45), 2× MAX6675 + K-type thermocouple (SPI, separate CS pins)
  - DHT11 is NOT a suitable substitute — its humidity range starts at 20% RH (same as the switch threshold) and ±5% accuracy is too coarse.
- **Heaters:** PTCYIDU B-35*21, 12V DC, 50W max (±20%), 200°C self-regulating PTC ceramic. Draws ~4.2A at 12V max. Only one heater runs at a time.
- **Fans:** 2× GDSTIME 3010 24V 30mm DC blower (1 per tower); same fan runs for both drying circulation and regen exhaust — valve states determine airflow path
- **Valves:** 4× Beduan 2-way normally-closed 12V DC solenoid air valve (1/4" NPT) + 2× same for exhaust. Replaces original 3-way valve design — pilot-operated 3-way valves require minimum inlet pressure that fan airflow cannot provide. Two 2-way valves per path (supply + return) achieve the same switching behavior.
- **Switching:** AEDIKO 8-channel relay module, 5V coil, OPTO-isolated, jumper-selectable high/low trigger — set jumper to LOW level to match code. All 8 relay channels are used by valves and fans; heaters are switched via separate SSRs on pins 26/27.
- **Power:** Mean Well LRS-150-24 (24V, 6.5A) recommended as main PSU. Buck converters: 24V→12V at 6A+ (heaters + valves), 24V→5V at 3A (ESP32 + relay module + sensors).

### Power Budget

| Rail | Loads | Est. Draw |
|------|-------|-----------|
| 12V  | 1× heater (50W, one at a time) + up to 6 valves | ~6A max |
| 24V  | 2× fans (~2W each) | ~0.25A |
| 5V   | ESP32 + sensors + relay coils | ~1A |

## Build Commands

This is an Arduino/ESP32 project. Compile and upload via:
- **Arduino IDE:** Open `twin_tower_dryer.ino`, select ESP32 board, compile/upload
- **Arduino CLI:** `arduino-cli compile --fqbn esp32:esp32:esp32 . && arduino-cli upload --fqbn esp32:esp32:esp32 -p /dev/cu.* .`

Required libraries (install via Library Manager):
- Adafruit SHT31 Library
- max6675 by Adafruit
- WiFi (built into ESP32 board package)

## Important Constraints

- The wiring diagram `.jsx` file is a visual artifact, not a buildable React app. Don't try to `npm install` or run it. Use `wiring_diagram.html` to render it instead.
- The `.ino` code is a skeleton with TODO sections — changes should preserve the phased build approach (Phase 1: single tower prototype → Phase 4: WiFi monitoring).
- Multi-rail power is required: 24V PSU → buck converters for 12V and 5V rails.
- Container plastic type is unidentified — regen temps (180°C) may exceed HDPE/PP limits. This is an unresolved safety concern.
