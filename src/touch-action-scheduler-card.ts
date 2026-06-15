import { LitElement, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';

import type { CardConfig, HomeAssistant, CardState } from './types.js';
import { computeState, parseDatetime } from './state-machine.js';
import {
  roundUpToInterval,
  addMinutes,
  isFuture,
  setTomorrowTime,
  setTodayTime,
  formatDisplay,
  formatRelative,
  clampToFuture,
} from './time-utils.js';
import { callInputDatetimeSet, callHaAction, clearSchedule } from './ha-actions.js';
import { cardStyles } from './styles.js';

class TouchActionSchedulerCard extends LitElement {
  static styles = cardStyles;

  @property({ attribute: false }) hass?: HomeAssistant;

  @state() private _config?: CardConfig;
  @state() private _localDt: Date = new Date();
  @state() private _isDirty = false;
  @state() private _saving = false;

  setConfig(config: CardConfig): void {
    if (!config.entity) throw new Error('touch-action-scheduler-card: missing required field "entity"');
    if (!config.status_entity) throw new Error('touch-action-scheduler-card: missing required field "status_entity"');
    if (!config.start_action) throw new Error('touch-action-scheduler-card: missing required field "start_action"');
    if (!config.stop_action) throw new Error('touch-action-scheduler-card: missing required field "stop_action"');

    this._config = config;
    this._initLocalDt();
  }

  private _initLocalDt(): void {
    if (!this._config) return;
    const interval = this._config.round_to_minutes ?? 15;
    const haValue = this._getHaDatetime();
    if (haValue && isFuture(haValue)) {
      this._localDt = haValue;
    } else {
      this._localDt = roundUpToInterval(new Date(), interval);
    }
    this._isDirty = false;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._initLocalDt();
    if (this._config?.interaction_mode === 'popup' && this._config.auto_confirm_on_close) {
      window.addEventListener('browser-mod-popup-closed', this._handlePopupClose);
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('browser-mod-popup-closed', this._handlePopupClose);
  }

  private _handlePopupClose = (): void => {
    if (this._isDirty && !this._saving) {
      this._confirm();
    }
  };

  private _getHaDatetime(): Date | null {
    if (!this.hass || !this._config) return null;
    const entity = this.hass.states[this._config.entity];
    if (!entity) return null;
    // Use Unix timestamp from attributes — timezone-independent, works on any device locale
    const ts = entity.attributes.timestamp;
    if (typeof ts === 'number') return new Date(ts * 1000);
    return parseDatetime(entity.state);
  }

  private _getCardState(): CardState {
    if (!this.hass || !this._config) return 'inactive';
    const statusEntity = this.hass.states[this._config.status_entity];
    const statusState = statusEntity?.state;
    const haDatetime = this._getHaDatetime();
    return computeState(statusState, haDatetime?.toISOString(), new Date());
  }

  private _shift(deltaMinutes: number): void {
    const allow_past = this._config?.allow_past ?? false;
    const interval = this._config?.round_to_minutes ?? 15;
    let next = addMinutes(this._localDt, deltaMinutes);
    if (!allow_past && !isFuture(next)) {
      next = clampToFuture(next, interval);
    }
    this._localDt = next;
    this._isDirty = true;
  }

  private _setTomorrow(): void {
    const preset = this._config?.tomorrow_preset;
    const timeStr = preset?.time ?? '06:00';
    this._localDt = setTomorrowTime(timeStr);
    this._isDirty = true;
  }

  private _setQuickTime(day: 'today' | 'tomorrow', timeStr: string): void {
    this._localDt = day === 'tomorrow' ? setTomorrowTime(timeStr) : setTodayTime(timeStr);
    this._isDirty = true;
  }

  private async _confirm(): Promise<void> {
    if (!this._config || !this.hass || this._saving) return;
    const allow_past = this._config.allow_past ?? false;
    if (!allow_past && !isFuture(this._localDt)) {
      this._localDt = clampToFuture(this._localDt, this._config.round_to_minutes ?? 15);
    }
    this._saving = true;
    try {
      await callInputDatetimeSet(this.hass, this._config.entity, this._localDt);
      this._isDirty = false;
    } finally {
      this._saving = false;
    }

    if (this._config.close_after_confirm && this._config.interaction_mode === 'popup') {
      this._tryClosePopup();
    }
  }

  private async _saveAndClose(): Promise<void> {
    await this._confirm();
    this._tryClosePopup();
  }

  private _tryClosePopup(): void {
    const w = window as unknown as Record<string, unknown>;
    const bm = w['browser_mod'] as { close_popup?: () => void } | undefined;
    if (bm?.close_popup) {
      bm.close_popup();
    }
  }

  private async _startNow(): Promise<void> {
    if (!this._config || !this.hass) return;
    await callHaAction(this.hass, this._config.start_action);
  }

  private async _stopNow(): Promise<void> {
    if (!this._config || !this.hass) return;
    await callHaAction(this.hass, this._config.stop_action);
    if (this._config.clear_schedule_on_stop !== false) {
      await clearSchedule(this.hass, this._config.entity);
    }
    this._isDirty = false;
    this._initLocalDt();
  }

  private _getStateLabel(cardState: CardState): string {
    switch (cardState) {
      case 'active': return 'Aktivní';
      case 'scheduled': return 'Naplánováno';
      default: return 'Neaktivní';
    }
  }

  private _applyStateColors(): Record<string, string> {
    const colors = this._config?.state_colors ?? {};
    const result: Record<string, string> = {};
    if (colors.inactive) result['--tasc-inactive-color'] = colors.inactive;
    if (colors.scheduled) result['--tasc-scheduled-color'] = colors.scheduled;
    if (colors.active) result['--tasc-active-color'] = colors.active;
    return result;
  }

  render() {
    if (!this._config) return html`<ha-card>Karta není nakonfigurována.</ha-card>`;

    const cardState = this._getCardState();
    const labels = this._config.labels ?? {};
    const confirm = this._config.confirm !== false;
    const showMinute = this._config.show_minute_buttons ?? false;
    const isPopup = this._config.interaction_mode === 'popup';
    const stepMinutes = this._config.step_minutes ?? 15;
    const now = new Date();
    const relativeStr = isFuture(this._localDt, now) ? formatRelative(this._localDt, now) : null;
    const haDatetime = this._getHaDatetime();
    const savedStr = haDatetime ? formatDisplay(haDatetime) : '—';

    const stateClasses = {
      [`state-${cardState}`]: true,
    };

    return html`
      <ha-card style=${styleMap(this._applyStateColors())}>
        <div class="card-header">
          <div class="card-icon ${classMap(stateClasses)}">
            <ha-icon icon=${this._config.icon ?? 'mdi:clock-outline'}></ha-icon>
          </div>
          <div class="card-name">${this._config.name ?? 'Plánovač'}</div>
          <span class="state-badge ${classMap(stateClasses)}">
            ${this._getStateLabel(cardState)}
          </span>
        </div>

        <div class="time-display ${this._isDirty ? 'dirty' : ''}">
          <div class="time-main">${formatDisplay(this._localDt)}</div>
          ${relativeStr ? html`<div class="time-relative">${relativeStr}</div>` : nothing}
          ${this._isDirty
            ? html`<div class="time-pending-label">
                neuloženo · uloženo: ${savedStr}
              </div>`
            : nothing}
        </div>

        <div class="btn-grid">
          <button class="btn-step" @click=${() => this._shift(-60)}>−1 h</button>
          <button class="btn-step" @click=${() => this._shift(-stepMinutes)}>−${stepMinutes} min</button>
          <button class="btn-step" @click=${() => this._shift(stepMinutes)}>+${stepMinutes} min</button>
          <button class="btn-step" @click=${() => this._shift(60)}>+1 h</button>
        </div>

        ${showMinute ? html`
          <div class="btn-grid-2">
            <button class="btn-step" @click=${() => this._shift(-1)}>−1 min</button>
            <button class="btn-step" @click=${() => this._shift(1)}>+1 min</button>
          </div>
        ` : nothing}

        ${this._config.tomorrow_preset ? html`
          <div class="btn-grid-wide">
            <button class="btn-tomorrow" @click=${this._setTomorrow}>
              ${this._config.tomorrow_preset.label ?? (labels.tomorrow ?? 'Zítra')}
            </button>
          </div>
        ` : nothing}

        ${this._config.quick_times?.map(qt => html`
          <div class="btn-grid-wide">
            <button class="btn-tomorrow" @click=${() => this._setQuickTime(qt.day, qt.time)}>
              ${qt.label}
            </button>
          </div>
        `)}

        ${confirm && this._isDirty ? html`
          <div class="btn-grid-wide">
            <button class="btn-confirm" @click=${this._confirm} ?disabled=${this._saving}>
              ${this._saving ? 'Ukládám…' : (labels.confirm ?? 'Uložit plán')}
            </button>
          </div>
        ` : nothing}

        ${!confirm && this._isDirty ? html`
          <!-- auto-save mode: potvrdit zároveň s každou změnou -->
        ` : nothing}

        <div class="divider"></div>

        <div class="instant-actions">
          <button class="btn-start" @click=${this._startNow}>
            ${this._config.start_action.label ?? (labels.start_now ?? 'Spustit teď')}
          </button>
          <button class="btn-stop" @click=${this._stopNow}>
            ${this._config.stop_action.label ?? (labels.stop_now ?? 'Ukončit teď')}
          </button>
        </div>

        ${isPopup ? html`
          <div class="btn-grid-wide" style="margin-top: 8px">
            <button class="btn-save-close" @click=${this._saveAndClose}>
              ${labels.save_and_close ?? 'Uložit a zavřít'}
            </button>
          </div>
        ` : nothing}
      </ha-card>
    `;
  }
}

customElements.define('touch-action-scheduler-card', TouchActionSchedulerCard);

const _w = window as unknown as Record<string, unknown>;
_w['customCards'] = _w['customCards'] || [];
(_w['customCards'] as Array<Record<string, unknown>>).push({
  type: 'touch-action-scheduler-card',
  name: 'Touch Action Scheduler Card',
  description: 'Touchscreen card for scheduling and instant control of HA actions.',
});
