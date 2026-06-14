# MaizAI — Sensor Node Firmware

ESP32 firmware for the MaizAI environmental sensor node. Reads soil moisture, ambient temperature, and relative humidity. Publishes to the cloud via MQTT (when internet is available) and advertises locally via mDNS for direct Wi-Fi communication with the mobile app when the farmer is on the plot.

## Hardware required

- ESP32 DevKit V1 (or compatible)
- Capacitive soil moisture sensor v1.2 or v2.0
- DHT22 (AM2302) temperature and humidity sensor
- Breadboard, jumper wires
- 3.7V lithium-ion battery with TP4056 charger module
- Optional: small 5V solar panel

## Build and flash

<!-- To be populated from the firmware specification. -->

1. Install [PlatformIO IDE](https://platformio.org/install) or the PlatformIO CLI.
2. Clone this repository and open the `firmware/` folder as a PlatformIO project.
3. Connect the ESP32 via USB.
4. Run `pio run --target upload` to build and flash.
5. Run `pio device monitor` to view serial output at 115200 baud.
