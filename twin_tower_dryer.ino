// ================================================================
//  TWIN TOWER DESICCANT DRYER — ESP32 Sketch
//  -----------------------------------------------
//  This is a CODE STRUCTURE / SKELETON — not a fully working sketch yet.
//  It shows you the shape of the program and what each piece does.
//  Fill in the sections marked with TODO as you build and test.
//
//  Required libraries (install via Arduino IDE → Sketch → Library Manager):
//    - Adafruit SHT31 Library
//    - max6675 by Adafruit
//    - WiFi (built into ESP32 board package)
// ================================================================

#include <Wire.h>                // Enables I2C communication (for SHT31 sensors)
#include <SPI.h>                 // Enables SPI communication (for MAX6675 thermocouples)
#include <Adafruit_SHT31.h>      // Driver for the SHT31 humidity sensors
#include <max6675.h>             // Driver for the MAX6675 thermocouple modules


// ================================================================
//  SECTION 1 — PIN DEFINITIONS
//  -----------------------------------------------
//  Giving names to pin numbers makes the code readable.
//  Instead of writing "digitalWrite(26, HIGH)" everywhere,
//  you write "digitalWrite(SSR_A, HIGH)" which actually tells
//  you what it does.
// ================================================================

// Heaters — controlled via SSR (Solid State Relay)
// HIGH = heater ON, LOW = heater OFF
#define SSR_A         26    // Tower A heater
#define SSR_B         27    // Tower B heater

// Relay module pins — ACTIVE LOW
// This means: LOW signal = relay triggers = 12V device turns ON
// HIGH signal = relay inactive = device OFF
// This feels backwards at first but it's how most relay modules are wired
#define RELAY_VALVE_SUPPLY   14   // 3-way valve on the supply (inlet) side
#define RELAY_VALVE_RETURN   12   // 3-way valve on the return side
#define RELAY_EXHAUST_A      13   // Exhaust vent valve for Tower A
#define RELAY_EXHAUST_B      15   // Exhaust vent valve for Tower B
#define RELAY_FAN_DRY_A      32   // Circulation fan — Tower A drying
#define RELAY_FAN_REGEN_A    33   // Exhaust fan — Tower A regenerating
#define RELAY_FAN_DRY_B      25   // Circulation fan — Tower B drying
#define RELAY_FAN_REGEN_B    23   // Exhaust fan — Tower B regenerating

// SPI pins for MAX6675 thermocouple modules
// SCK and MISO are shared between both sensors
// Each sensor gets its own CS (Chip Select) pin
#define THERMO_SCK     18
#define THERMO_MISO    19
#define THERMO_CS_A     5    // Selects Tower A thermocouple
#define THERMO_CS_B    17    // Selects Tower B thermocouple


// ================================================================
//  SECTION 2 — SETTINGS
//  -----------------------------------------------
//  These are the values you'll tune over time based on real-world
//  testing. Keeping them here at the top (instead of buried in
//  the code) means you only have to change them in one place.
// ================================================================

#define HUMIDITY_SWITCH_RH     20.0   // %RH — when active tower output exceeds this,
                                       // switch to the other tower
#define REGEN_TARGET_TEMP     180.0   // °C — heat the tower to this during regeneration
                                       // Activated alumina releases moisture ~150-200°C
#define REGEN_COOLDOWN_TEMP    50.0   // °C — tower must cool to this before switching
                                       // back online (hot alumina would immediately re-adsorb)
#define REGEN_TIMEOUT_MS    3600000   // 1 hour max regen time — safety shutoff
                                       // if something goes wrong and it won't cool down
#define SENSOR_READ_INTERVAL   5000   // Read sensors every 5 seconds (milliseconds)


// ================================================================
//  SECTION 3 — GLOBAL STATE
//  -----------------------------------------------
//  "State" is the current condition of the system.
//  The ESP32 needs to know which tower is drying right now
//  so it knows what to do when sensors trigger a switch.
//
//  An "enum" (enumeration) is just a named list of possible states.
//  It's cleaner than using numbers like 0 and 1.
// ================================================================

enum SystemState {
  TOWER_A_DRYING,   // Tower A is the active dryer; Tower B is regenerating or on standby
  TOWER_B_DRYING    // Tower B is the active dryer; Tower A is regenerating or on standby
};

SystemState currentState = TOWER_A_DRYING;   // Start with Tower A
bool regenComplete_A = false;                 // Has Tower A finished its last regen cycle?
bool regenComplete_B = false;                 // Has Tower B finished its last regen cycle?
unsigned long regenStartTime = 0;             // When did the current regen cycle begin?
unsigned long lastSensorRead  = 0;            // Tracks the last time we read sensors


// ================================================================
//  SECTION 4 — SENSOR OBJECTS
//  -----------------------------------------------
//  These lines create "objects" — think of them as representing
//  the physical sensors. You call functions on them to get readings.
//  The numbers (0x44, 0x45) are the I2C addresses that differentiate
//  the two SHT31 sensors on the same bus.
// ================================================================

Adafruit_SHT31 sht31_return = Adafruit_SHT31();   // Sensor on dry box RETURN air (0x44)
Adafruit_SHT31 sht31_output = Adafruit_SHT31();   // Sensor on active tower OUTPUT (0x45)

MAX6675 thermo_a(THERMO_SCK, THERMO_CS_A, THERMO_MISO);   // Tower A thermocouple
MAX6675 thermo_b(THERMO_SCK, THERMO_CS_B, THERMO_MISO);   // Tower B thermocouple


// ================================================================
//  SECTION 5 — SETUP
//  -----------------------------------------------
//  Runs ONCE when the ESP32 powers on or resets.
//  Use this to initialize everything into a known safe state
//  before the main loop starts running.
// ================================================================

void setup() {
  // Start the serial monitor so you can see debug messages
  // on your computer (Tools → Serial Monitor in Arduino IDE)
  Serial.begin(115200);
  Serial.println("== Twin Tower Desiccant Dryer Booting ==");

  // Tell the ESP32 that these pins are OUTPUT pins
  // (sending signals OUT, not reading signals IN)
  pinMode(SSR_A, OUTPUT);
  pinMode(SSR_B, OUTPUT);
  pinMode(RELAY_VALVE_SUPPLY,  OUTPUT);
  pinMode(RELAY_VALVE_RETURN,  OUTPUT);
  pinMode(RELAY_EXHAUST_A,     OUTPUT);
  pinMode(RELAY_EXHAUST_B,     OUTPUT);
  pinMode(RELAY_FAN_DRY_A,     OUTPUT);
  pinMode(RELAY_FAN_REGEN_A,   OUTPUT);
  pinMode(RELAY_FAN_DRY_B,     OUTPUT);
  pinMode(RELAY_FAN_REGEN_B,   OUTPUT);

  // SAFETY FIRST: Put everything into a known OFF state
  // This prevents random pin states on boot from briefly
  // firing a heater or opening the wrong valve
  allOff();

  // Initialize the humidity sensors
  // If a sensor fails to start, print an error but keep going
  if (!sht31_return.begin(0x44)) {
    Serial.println("ERROR: SHT31 #1 (return air) not found — check wiring!");
  }
  if (!sht31_output.begin(0x45)) {
    Serial.println("ERROR: SHT31 #2 (tower output) not found — check wiring!");
  }

  // Short delay to let everything stabilize before starting
  delay(2000);

  // Begin normal operation with Tower A drying
  Serial.println("Starting: Tower A drying, Tower B standby");
  activateTowerA_Drying();
}


// ================================================================
//  SECTION 6 — MAIN LOOP
//  -----------------------------------------------
//  This runs OVER AND OVER FOREVER after setup() finishes.
//  Think of it as the heartbeat of the system.
//  Every 5 seconds it reads sensors, checks conditions,
//  and decides if anything needs to change.
// ================================================================

void loop() {
  unsigned long now = millis();   // millis() = milliseconds since boot

  // Only run sensor checks at the defined interval
  // This avoids hammering the sensors with constant reads
  if (now - lastSensorRead >= SENSOR_READ_INTERVAL) {
    lastSensorRead = now;

    // ── Read all sensors ─────────────────────────────────────────
    float returnRH  = sht31_return.readHumidity();     // Incoming air from dry boxes
    float outputRH  = sht31_output.readHumidity();     // Air coming out of active tower
    float tempA     = thermo_a.readCelsius();           // Tower A internal temp
    float tempB     = thermo_b.readCelsius();           // Tower B internal temp

    // Print status so you can monitor from your computer
    printStatus(returnRH, outputRH, tempA, tempB);

    // ── Decision logic ───────────────────────────────────────────
    // If the active tower's output humidity is too high, it's saturated
    // and we need to switch to the other tower

    if (currentState == TOWER_A_DRYING) {

      // Check if Tower A needs to be swapped out
      if (outputRH > HUMIDITY_SWITCH_RH) {
        Serial.println("Tower A saturated — switching to Tower B");
        switchToTowerB();
      }

      // Meanwhile, manage Tower B's regeneration (if it's currently heating)
      manageTowerRegen(SSR_B, tempB, regenComplete_B);

    } else {  // TOWER_B_DRYING

      // Check if Tower B needs to be swapped out
      if (outputRH > HUMIDITY_SWITCH_RH) {
        Serial.println("Tower B saturated — switching to Tower A");
        switchToTowerA();
      }

      // Meanwhile, manage Tower A's regeneration
      manageTowerRegen(SSR_A, tempA, regenComplete_A);
    }

    // Safety: Check regen timeout — if a tower has been heating
    // for longer than REGEN_TIMEOUT_MS, something is wrong
    if (now - regenStartTime > REGEN_TIMEOUT_MS) {
      Serial.println("WARNING: Regen timeout! Shutting down heaters.");
      digitalWrite(SSR_A, LOW);
      digitalWrite(SSR_B, LOW);
    }
  }
}


// ================================================================
//  SECTION 7 — SWITCHING FUNCTIONS
//  -----------------------------------------------
//  These functions flip the system from one tower to the other.
//  ORDER MATTERS here — always shut down the outgoing tower
//  before redirecting airflow, to avoid pressure spikes or
//  mixing humid regen air into the dry box supply.
// ================================================================

void activateTowerA_Drying() {
  // Tower A drying: valves in default position (relays OFF = Tower A path)
  // Relay module is active LOW so HIGH = relay OFF = default/Tower-A position
  digitalWrite(RELAY_VALVE_SUPPLY, HIGH);   // Supply valve → Tower A path
  digitalWrite(RELAY_VALVE_RETURN, HIGH);   // Return valve → Tower A path
  digitalWrite(RELAY_EXHAUST_A, HIGH);      // Exhaust valve A closed
  digitalWrite(RELAY_FAN_DRY_A, LOW);       // Tower A dry fan ON
  digitalWrite(RELAY_FAN_REGEN_A, HIGH);    // Tower A regen fan OFF

  // Start regenerating Tower B
  digitalWrite(RELAY_FAN_DRY_B, HIGH);      // Tower B dry fan OFF
  digitalWrite(RELAY_EXHAUST_B, LOW);       // Tower B exhaust valve OPEN
  digitalWrite(RELAY_FAN_REGEN_B, LOW);     // Tower B regen fan ON
  regenStartTime = millis();
  regenComplete_B = false;

  currentState = TOWER_A_DRYING;
}

void switchToTowerB() {
  // Step 1: Shut down Tower A dry fan and close airflow
  digitalWrite(RELAY_FAN_DRY_A, HIGH);

  // Step 2: Flip valves to Tower B path
  digitalWrite(RELAY_VALVE_SUPPLY, LOW);    // Relays ON = Tower B path
  digitalWrite(RELAY_VALVE_RETURN, LOW);

  // Step 3: Start Tower B dry fan
  digitalWrite(RELAY_FAN_DRY_B, LOW);

  // Step 4: Close Tower B exhaust (it was regenerating), stop regen fan
  digitalWrite(RELAY_EXHAUST_B, HIGH);
  digitalWrite(RELAY_FAN_REGEN_B, HIGH);
  digitalWrite(SSR_B, LOW);                 // Make sure heater is off

  // Step 5: Start regenerating Tower A
  digitalWrite(RELAY_EXHAUST_A, LOW);       // Open Tower A exhaust
  digitalWrite(RELAY_FAN_REGEN_A, LOW);     // Start Tower A regen fan
  regenStartTime = millis();
  regenComplete_A = false;

  currentState = TOWER_B_DRYING;
}

void switchToTowerA() {
  // Mirror of switchToTowerB() — same logic, opposite tower
  digitalWrite(RELAY_FAN_DRY_B, HIGH);
  digitalWrite(RELAY_VALVE_SUPPLY, HIGH);
  digitalWrite(RELAY_VALVE_RETURN, HIGH);
  digitalWrite(RELAY_FAN_DRY_A, LOW);
  digitalWrite(RELAY_EXHAUST_A, HIGH);
  digitalWrite(RELAY_FAN_REGEN_A, HIGH);
  digitalWrite(SSR_A, LOW);
  digitalWrite(RELAY_EXHAUST_B, LOW);
  digitalWrite(RELAY_FAN_REGEN_B, LOW);
  regenStartTime = millis();
  regenComplete_B = false;
  currentState = TOWER_A_DRYING;
}


// ================================================================
//  SECTION 8 — REGENERATION MANAGEMENT
//  -----------------------------------------------
//  This function runs every loop cycle for whichever tower
//  is currently regenerating. It controls the heater:
//    - If below target temp: heater ON
//    - If at or above target temp: heater OFF, let it cool
//    - Once cool enough: mark regen as complete
// ================================================================

void manageTowerRegen(int ssrPin, float currentTemp, bool &regenDone) {
  if (regenDone) return;   // Nothing to do if this tower already finished

  if (currentTemp < REGEN_TARGET_TEMP) {
    digitalWrite(ssrPin, HIGH);   // Heater ON — still climbing to target
  } else {
    digitalWrite(ssrPin, LOW);    // Hit target temp — heater OFF
    Serial.println("Regen target reached, heater off, cooling down...");

    // Tower needs to cool before it can go back online
    // (Hot alumina re-adsorbs moisture almost immediately)
    if (currentTemp < REGEN_COOLDOWN_TEMP) {
      regenDone = true;
      Serial.println("Tower cooled — regen complete, ready to swap back in.");
    }
  }
}


// ================================================================
//  SECTION 9 — SAFETY: ALL OFF
//  -----------------------------------------------
//  Shuts everything down cleanly.
//  Called on boot and can be called any time something goes wrong.
//  The relay module is active LOW, so HIGH = relay off = device off.
//  SSRs are active HIGH, so LOW = heater off.
// ================================================================

void allOff() {
  digitalWrite(SSR_A, LOW);
  digitalWrite(SSR_B, LOW);
  digitalWrite(RELAY_VALVE_SUPPLY,  HIGH);
  digitalWrite(RELAY_VALVE_RETURN,  HIGH);
  digitalWrite(RELAY_EXHAUST_A,     HIGH);
  digitalWrite(RELAY_EXHAUST_B,     HIGH);
  digitalWrite(RELAY_FAN_DRY_A,     HIGH);
  digitalWrite(RELAY_FAN_REGEN_A,   HIGH);
  digitalWrite(RELAY_FAN_DRY_B,     HIGH);
  digitalWrite(RELAY_FAN_REGEN_B,   HIGH);
}


// ================================================================
//  SECTION 10 — STATUS PRINTING
//  -----------------------------------------------
//  Formats sensor data into a readable line in the Serial Monitor.
//  This is your window into what the system is doing while it runs.
//  You'll use this constantly during testing and calibration.
// ================================================================

void printStatus(float rh_return, float rh_out, float tA, float tB) {
  Serial.print("STATE: ");
  Serial.print(currentState == TOWER_A_DRYING ? "A-DRYING" : "B-DRYING");
  Serial.print(" | Return RH: ");   Serial.print(rh_return, 1); Serial.print("%");
  Serial.print(" | Output RH: ");   Serial.print(rh_out, 1);    Serial.print("%");
  Serial.print(" | Temp A: ");      Serial.print(tA, 1);        Serial.print("C");
  Serial.print(" | Temp B: ");      Serial.print(tB, 1);        Serial.println("C");
}


// ================================================================
//  TODO LIST — what to build next
// ================================================================
//
//  PHASE 1 (prototype, one tower):
//    [ ] Wire up one SSR, one PTC heater, one thermocouple
//    [ ] Test that manageTowerRegen() heats and cuts off correctly
//    [ ] Verify the container can handle the heat (check for warping)
//
//  PHASE 2 (add humidity sensing):
//    [ ] Wire both SHT31 sensors
//    [ ] Confirm you're reading correct values from each address
//    [ ] Tune HUMIDITY_SWITCH_RH for your filament type
//
//  PHASE 3 (full switching):
//    [ ] Add relay module, fans, and valves
//    [ ] Test switchToTowerB() and switchToTowerA() manually
//        by forcing the switch in code (comment out the RH check)
//    [ ] Let it run a full auto cycle
//
//  PHASE 4 (WiFi monitoring):
//    [ ] Add a simple web server on the ESP32 to show a status page
//    [ ] Log sensor data over time to catch patterns
//
// ================================================================
