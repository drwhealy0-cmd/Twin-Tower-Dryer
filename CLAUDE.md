# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DIY twin-tower Temperature Swing Adsorption (TSA) dryer for 3D printer filament. Uses two repurposed Litholyme medical containers filled with activated alumina desiccant, controlled by an ESP32. One tower dries (closed-loop air circulation to dry boxes) while the other regenerates (heats alumina to ~180°C to drive off moisture, exhausts to room).

## Architecture

- **`twin_tower_dryer.ino`** — ESP32 Arduino sketch (skeleton/framework, not yet fully working). Structured in numbered sections:
  - Pin definitions, tunable settings, global state, sensor objects, setup, main loop, tower switching functions, regeneration management, safety shutoff, status printing, and a phased TODO list.
  - Key design pattern: relay module is **active LOW** (LOW = device ON), SSRs are **active HIGH** (HIGH = heater ON). This asymmetry is intentional and must be preserved.
  - `manageTowerRegen()` uses pass-by-reference (`bool &regenDone`) to update tower regen state.

- **`wiring_diagram.jsx`** — React component (designed for Claude.ai artifact rendering) with three tabbed views: 120V Power, Low Voltage signal wiring, and ESP32 Pin Map. Visual reference only — not part of the firmware build.

## Hardware

- **Controller:** ESP32 dev board
- **Sensors:** 2× SHT31 (I2C, addresses 0x44/0x45), 2× MAX6675 + K-type thermocouple (SPI, separate CS pins)
- **Heaters:** 12V PTC ceramic elements (200°C rated) — original design spec was 120V AC; current parts are 12V DC
- **Fans:** 24V 30mm DC blowers (GDSTIME 3010) — voltage mismatch with heaters requires attention
- **Switching:** 8-channel relay module (active LOW) for fans/valves, 2× 25A SSR for heaters
- **Power:** Needs a 24V PSU (for fans) with step-down to 12V (for heaters) and 5V (ESP32/sensors via DROK buck converter)

## Build Commands

This is an Arduino/ESP32 project. Compile and upload via:
- **Arduino IDE:** Open `twin_tower_dryer.ino`, select ESP32 board, compile/upload
- **Arduino CLI:** `arduino-cli compile --fqbn esp32:esp32:esp32 . && arduino-cli upload --fqbn esp32:esp32:esp32 -p /dev/cu.* .`

Required libraries (install via Library Manager):
- Adafruit SHT31 Library
- max6675 by Adafruit
- WiFi (built into ESP32 board package)

## Important Constraints

- The wiring diagram `.jsx` file is a visual artifact, not a buildable React app. Don't try to `npm install` or run it.
- The `.ino` code is a skeleton with TODO sections — changes should preserve the phased build approach (Phase 1: single tower prototype → Phase 4: WiFi monitoring).
- Voltage mismatch between 12V heaters and 24V fans is a known open issue — the power architecture needs a multi-rail PSU solution.
- Container plastic type is unidentified — regen temps (180°C) may exceed HDPE/PP limits. This is an unresolved safety concern.
