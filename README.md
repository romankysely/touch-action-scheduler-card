# Touch Action Scheduler Card

A Lovelace custom card for Home Assistant that lets you schedule and instantly control actions from a touchscreen, kiosk, or mobile device — without a keyboard.

Designed for use cases like EV charging, water heating, energy accumulation, or any time-delayed HA action.

![State: inactive](https://img.shields.io/badge/state-inactive-607d8b) ![State: scheduled](https://img.shields.io/badge/state-scheduled-ffc107) ![State: active](https://img.shields.io/badge/state-active-f44336)

---

## Features

- **Three states:** inactive → scheduled → active
- **Touch-optimized buttons:** −1 h, −15 min, +15 min, +1 h (optional ±1 min)
- **Confirm before write** — changes are local until you tap "Save plan"
- **Instant start / stop** via configurable HA service calls
- **Tomorrow preset** — one tap to schedule for tomorrow morning
- **Quick time presets** — configurable shortcuts (e.g. "Tonight 22:00")
- **Popup mode** — works with [Browser Mod](https://github.com/thomasloven/hass-browser_mod) popups
- **HA theme integration** — respects your dashboard colors and CSS variables
- **Three layouts:** compact / normal / large
- Single bundled JS file, no backend required

---

## Installation

### Manual

1. Download `touch-action-scheduler-card.js` from the [latest release](https://github.com/romankysely/touch-action-scheduler-card/releases/latest)
2. Copy it to `/config/www/custom/touch-action-scheduler-card.js` on your HA instance
3. Add it as a Lovelace resource:

   **Via UI:** Settings → Dashboards → Resources → Add resource
   ```
   URL:  /local/custom/touch-action-scheduler-card.js
   Type: JavaScript module
   ```

   **Via YAML** (`configuration.yaml` or `ui-lovelace.yaml`):
   ```yaml
   resources:
     - url: /local/custom/touch-action-scheduler-card.js
       type: module
   ```

4. Reload your browser (hard refresh: `Ctrl+Shift+R`)

### HACS

> HACS support coming in a future release.

---

## Basic Configuration

```yaml
type: custom:touch-action-scheduler-card
name: EV Charging
icon: mdi:battery-charging
entity: input_datetime.my_action_schedule
status_entity: switch.my_action_switch
start_action:
  label: Start now
  action: switch.turn_on
  target:
    entity_id: switch.my_action_switch
stop_action:
  label: Stop now
  action: switch.turn_off
  target:
    entity_id: switch.my_action_switch
```

---

## Full Configuration

```yaml
type: custom:touch-action-scheduler-card
entity: input_datetime.my_action_schedule
name: My Action
icon: mdi:clock-outline
status_entity: switch.my_action_switch

# Time behavior
round_to_minutes: 15       # Round initial time to nearest interval (default: 15)
step_minutes: 15           # Step size for +/- buttons (default: 15)
allow_past: false          # Prevent scheduling in the past (default: false)
initial_value: next_interval  # Start at next rounded interval (default: next_interval)

# Interaction
confirm: true              # Write to HA only after confirmation (default: true)
show_minute_buttons: false # Show ±1 min buttons (default: false)
layout: normal             # compact | normal | large (default: normal)
interaction_mode: dashboard  # dashboard | popup (default: dashboard)
auto_confirm_on_close: false # Auto-save when popup closes (default: false)
close_after_confirm: false   # Close popup after confirming (default: false)

# Schedule management
clear_schedule_on_start: false  # Clear planned time on instant start (default: false)
clear_schedule_on_stop: true    # Clear planned time on instant stop (default: true)
clear_schedule_strategy: set_to_past  # Strategy for clearing (default: set_to_past)

# State colors (optional — defaults match HA material palette)
state_colors:
  inactive: '#607d8b'
  scheduled: '#ffc107'
  active: '#f44336'

# Button labels (optional)
labels:
  start_now: Start now
  stop_now: Stop now
  confirm: Save plan
  save_and_close: Save & close
  tomorrow: Tomorrow

# Tomorrow preset button
tomorrow_preset:
  label: Tomorrow morning
  time: "06:00"

# Quick time presets (optional)
quick_times:
  - label: Tonight
    day: today
    time: "22:00"
  - label: Tomorrow morning
    day: tomorrow
    time: "06:00"

# Actions
start_action:
  label: Start now
  action: switch.turn_on
  target:
    entity_id: switch.my_action_switch

stop_action:
  label: Stop now
  action: switch.turn_off
  target:
    entity_id: switch.my_action_switch
```

---

## State Machine

The card evaluates state in this priority order:

```
1. active    — status_entity is "on"
2. scheduled — input_datetime is in the future
3. inactive  — neither of the above
```

The card does **not** trigger the scheduled action itself — that is handled by a Home Assistant automation reacting to `input_datetime`.

### State colors

| State     | Default color | Description                        |
|-----------|---------------|------------------------------------|
| inactive  | Grey-blue     | No action running, nothing planned |
| scheduled | Amber         | Future time is saved in HA         |
| active    | Red           | Action is currently running        |

---

## Popup Mode (Browser Mod)

When used inside a [Browser Mod](https://github.com/thomasloven/hass-browser_mod) popup, set:

```yaml
interaction_mode: popup
auto_confirm_on_close: true
close_after_confirm: true
```

In popup mode:
- The "Uložit plán" button is replaced by **"Uložit plán a zavřít"** — saves and closes in one tap
- The button appears only after a change is made
- Closing with the **X button** auto-saves as well (`auto_confirm_on_close: true`)

The card works fully without Browser Mod — popup mode is optional.

### Example: popup triggered by hold on a mushroom card

Useful when you want a compact card (e.g. a SOC slider) that opens the full scheduler on hold:

```yaml
type: custom:mushroom-number-card
entity: input_number.my_charging_soc
name: "Nabít do:"
display_mode: slider
layout: horizontal
fill_container: true
icon: mdi:battery-charging
hold_action:
  action: fire-dom-event
  browser_mod:
    service: browser_mod.popup
    data:
      title: Plánovač nabíjení
      content:
        type: vertical-stack
        cards:
          - type: custom:mushroom-number-card
            entity: input_number.my_charging_soc
            name: "Nabít do:"
            display_mode: slider
            fill_container: true
          - type: custom:touch-action-scheduler-card
            name: Nabíjení
            icon: mdi:battery-charging
            entity: input_datetime.my_action_schedule
            status_entity: switch.my_action_switch
            interaction_mode: popup
            confirm: true
            auto_confirm_on_close: true
            close_after_confirm: true
            round_to_minutes: 15
            step_minutes: 15
            allow_past: false
            clear_schedule_on_stop: true
            tomorrow_preset:
              label: Zítra 14:00
              time: "14:00"
            quick_times:
              - label: Dnes 14:00
                day: today
                time: "14:00"
            start_action:
              label: Spustit teď
              action: switch.turn_on
              target:
                entity_id: switch.my_action_switch
            stop_action:
              label: Ukončit
              action: switch.turn_off
              target:
                entity_id: switch.my_action_switch
tap_action:
  action: none
```

---

## CSS Customization

Override colors via CSS custom properties:

```yaml
card_mod:
  style: |
    touch-action-scheduler-card {
      --tasc-color-inactive: #455a64;
      --tasc-color-scheduled: #f9a825;
      --tasc-color-active: #c62828;
    }
```

---

## Requirements

- Home Assistant 2024.1 or newer
- An `input_datetime` entity (with `has_time: true`)
- A `switch` or similar entity as `status_entity`

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

---

## License

MIT
