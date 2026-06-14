# Changelog

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
