export type CardState = 'inactive' | 'scheduled' | 'active';
export type Layout = 'compact' | 'normal' | 'large';
export type InteractionMode = 'dashboard' | 'popup';
export type ClearScheduleStrategy = 'set_to_past';
export type InitialValue = 'next_interval';

export interface HassEntity {
  state: string;
  attributes: Record<string, unknown> & { timestamp?: number };
  entity_id: string;
}

export interface HassConfig {
  time_zone: string;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  config: HassConfig;
  callService(domain: string, service: string, data?: Record<string, unknown>): Promise<void>;
}

export interface ActionConfig {
  label?: string;
  action: string;
  target?: {
    entity_id?: string;
  };
}

export interface TomorrowPreset {
  label?: string;
  time: string;
}

export interface QuickTime {
  label: string;
  day: 'today' | 'tomorrow';
  time: string;
}

export interface StateColors {
  inactive?: string;
  scheduled?: string;
  active?: string;
}

export interface Labels {
  start_now?: string;
  stop_now?: string;
  confirm?: string;
  save_and_close?: string;
  tomorrow?: string;
}

export interface CardConfig {
  type: string;
  entity: string;
  name?: string;
  icon?: string;
  status_entity: string;

  round_to_minutes?: number;
  step_minutes?: number;
  confirm?: boolean;
  show_minute_buttons?: boolean;
  interaction_mode?: InteractionMode;
  auto_confirm_on_close?: boolean;
  close_after_confirm?: boolean;
  allow_past?: boolean;
  initial_value?: InitialValue;
  layout?: Layout;

  clear_schedule_on_start?: boolean;
  clear_schedule_on_stop?: boolean;
  clear_schedule_strategy?: ClearScheduleStrategy;

  state_colors?: StateColors;
  labels?: Labels;

  tomorrow_preset?: TomorrowPreset;
  quick_times?: QuickTime[];

  start_action: ActionConfig;
  stop_action: ActionConfig;
}
