# Changelog

## [0.1.4] - 2026-06-15

### Fixed
- **Cross-card synchronization:** When a popup card saves a new time, the dashboard card (and vice versa) now immediately shows the updated value. Root cause: `_confirmedDt` was held until HA matched the saved value exactly — but when a *different* card saved a *different* time, the mismatch meant `_confirmedDt` was never cleared and the card showed a stale value. Fix: clear `_confirmedDt` on any `hass` update, since the only purpose of `_confirmedDt` is to bridge the tiny window between our save call resolving and HA pushing the state change back.

## [0.1.3] - 2026-06-15

### Fixed
- **Popup mode — single confirmation:** "Uložit plán" button is now hidden in popup mode (`interaction_mode: popup`). Only "Uložit a zavřít" is shown, eliminating double confirmation.
- **Auto-save on X close:** Added `ha-dialog` `closed` event listener as additional trigger for `auto_confirm_on_close`. The card walks up the DOM tree to find the parent `ha-dialog` (Browser Mod uses this) and saves automatically when it closes, including via the X button.

## [0.1.2] - 2026-06-15

### Fixed
- **Timezone — all display and calculation now use HA server timezone** (`hass.config.time_zone`). Previously the card used device local timezone for formatting and date comparisons, causing wrong times on kiosk devices with a different OS timezone than the HA server. All functions (`formatDisplay`, `setTomorrowTime`, `setTodayTime`, `clampToFuture`) now receive the HA timezone explicitly. Fallback is `Intl.DateTimeFormat().resolvedOptions().timeZone`.

## [0.1.1] - 2026-06-15

### Fixed
- **Timezone bug on kiosk devices:** `input_datetime` state was parsed as a local time string without timezone info, causing incorrect initial time on devices with UTC clock (e.g. Chromium kiosk). Now uses `entity.attributes.timestamp` (Unix timestamp) which is always UTC-independent.
- **Generic entity names in README:** replaced real entity IDs with `input_datetime.my_action_schedule` / `switch.my_action_switch` placeholders.

## [0.1.0] - 2026-06-14

### Added
- Initial release — MVP implementation
- Support for `input_datetime` entity
- State machine: inactive / scheduled / active
- Touch-optimized scheduling buttons: -1h, -15min, +15min, +1h
- Optional ±1min buttons (`show_minute_buttons`)
- Tomorrow preset button
- Instant start / stop actions via configurable HA service calls
- Confirm mode (`confirm: true`) — writes to HA only after explicit confirmation
- Protection against scheduling in the past (`allow_past: false`)
- Clear schedule on stop (`clear_schedule_on_stop: true`, strategy: `set_to_past`)
- Dashboard and popup interaction modes
- Browser Mod popup fallback: "Uložit a zavřít" button
- Responsive layout: compact / normal / large
- MDI icon with state-based color (inactive: grey, scheduled: amber, active: red)
- HA theme CSS variable integration
- Single bundled JS output for easy installation
