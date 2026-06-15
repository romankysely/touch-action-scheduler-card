import type { HomeAssistant, ActionConfig } from './types.js';
import { formatDatetimeForHA, addMinutes } from './time-utils.js';

export async function callInputDatetimeSet(
  hass: HomeAssistant,
  entityId: string,
  dt: Date,
): Promise<void> {
  const { date, time } = formatDatetimeForHA(dt);
  await hass.callService('input_datetime', 'set_datetime', {
    entity_id: entityId,
    date,
    time,
  });
}

export async function callHaAction(
  hass: HomeAssistant,
  actionConfig: ActionConfig,
): Promise<void> {
  const [domain, service] = actionConfig.action.split('.');
  await hass.callService(domain, service, {
    ...(actionConfig.target ? actionConfig.target : {}),
  });
}

export async function clearSchedule(
  hass: HomeAssistant,
  entityId: string,
): Promise<void> {
  // Use a fixed far-past date so state machine can distinguish "cleared" from "just elapsed"
  await callInputDatetimeSet(hass, entityId, new Date('2000-01-01T00:00:00'));
}
