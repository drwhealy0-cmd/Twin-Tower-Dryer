# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DIY twin-tower Temperature Swing Adsorption (TSA) dryer for 3D printer filament. Uses two repurposed Litholyme medical containers filled with activated alumina desiccant, controlled by an ESP32. One tower dries (closed-loop air circulation to dry boxes) while the other regenerates (heats alumina to ~180°C to drive off moisture, exhausts to room).

## Architecture

- **`twin_tower_dryer.ino`** — ESP32 Arduino sketch (skeleton/framework, not yet fully working). Structured in numbered sections:
  - Pin definitions, tunable settings, global state, sensor objects, setup, main loop, tower switching functions, regeneration management, safety shutoff, status printing, and a phased TODO list.
  - Key design pattern: relay module is **active LOW** (LOW = device ON), SSRs are **active HIGH** (HIGH = heater ON). This asymmetry is intentional and must be preserved.
  - `manageTowerRegen()` uses pass-by-reference (`bool &regenDone`) to update tower regen state.
  - **Pending code change:** valve design switched from 3-way to pairs of 2-way valves (see Hardware section). The sketch still uses 2 relay pins for 3-way valves — this needs to be updated to 4 relay pins for 4 x 2-way valves, consuming all 8 relay channels.

- **`wiring_diagram.jsx`** — React component (designed for Claude.ai artifact rendering) with three tabbed views: 120V Power, Low Voltage signal wiring, and ESP32 Pin Map. Visual reference only — not part of the firmware build.

- **`wiring_diagram.html`** — Standalone HTML version of the wiring diagram. Open directly in a browser or use VS Code Live Preview extension to render it without any build tools.

- **`bill_of_materials.md`** — Full parts list for the project.

## Hardware

- **Controller:** ESP32 dev board
- **Sensors:** 2× SHT31 (I2C, addresses 0x44/0x45), 2× MAX6675 + K-type thermocouple (SPI, separate CS pins)
  - DHT11 is NOT a suitable substitute — its humidity range starts at 20% RH (same as the switch threshold) and ±5% accuracy is too coarse.
- **Heaters:** 12V PTC ceramic elements (200°C rated) — original design spec was 120V AC; current parts are 12V DC
- **Fans:** 24V 30mm DC blowers (GDSTIME 3010) — voltage mismatch with heaters requires attention
- **Valves:** 4× Beduan 2-way normally-closed 12V DC solenoid air valve (1/4" NPT) + 2× same for exhaust. Replaces original 3-way valve design — pilot-operated 3-way valves require minimum inlet pressure that fan airflow cannot provide. Two 2-way valves per path (supply + return) achieve the same switching behavior.
- **Switching:** AEDIKO 8-channel relay module, 5V coil, OPTO-isolated, jumper-selectable high/low trigger — set jumper to LOW level to match code. 2× 25A SSR for heaters.
- **Power:** Needs a 24V PSU (for fans) with step-down to 12V (for heaters and valves) and 5V (ESP32/sensors). PSU sizing pending — heater wattage and exact fan specs not yet confirmed.

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
- Voltage mismatch between 12V heaters and 24V fans is a known open issue — the power architecture needs a multi-rail PSU solution.
- Container plastic type is unidentified — regen temps (180°C) may exceed HDPE/PP limits. This is an unresolved safety concern.
- The switch from 3-way to 2-way valves means the `.ino` pin assignments and switching logic need updating before the code matches the hardware.
