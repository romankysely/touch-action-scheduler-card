# Changelog

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
