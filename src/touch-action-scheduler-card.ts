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
  @state() private _confirmedDt?: Date; // holds saved value until HA confirms
  @state() private _isDirty = false;
  @state() private _saving = false;

  @state() private _clearingSchedule = false;

  updated(changedProps: Map<string, unknown>): void {
    if (!changedProps.has('hass')) return;
    if (this._confirmedDt) {
      const haValue = this._getHaDatetime();
      if (haValue && Math.abs(haValue.getTime() - this._confirmedDt.getTime()) < 60000) {
        this._confirmedDt = undefined;
      }
    }
    if (this._clearingSchedule) {
      const haValue = this._getHaDatetime();
      if (haValue && !isFuture(haValue, new Date())) {
        this._clearingSchedule = false;
        this._initLocalDt();
      }
    }
  }

  setConfig(config: CardConfig): void {
    if (!config.entity) throw new Error('touch-action-scheduler-card: missing required field "entity"');
    if (!config.status_entity) throw new Error('touch-action-scheduler-card: missing required field "status_entity"');
    if (!config.start_action) throw new Error('touch-action-scheduler-card: missing required field "start_action"');
    if (!config.stop_action) throw new Error('touch-action-scheduler-card: missing required field "stop_action"');

    this._config = config;
    this._initLocalDt();
  }

  private get _timeZone(): string {
    return this.hass?.config?.time_zone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  private _initLocalDt(): void {
    if (!this._config) return;
    const interval = this._config.round_to_minutes ?? 15;
    const now = new Date();
    const haValue = this._getHaDatetime();
    if (haValue && isFuture(haValue, now)) {
      this._localDt = haValue;
    } else {
      this._localDt = roundUpToInterval(now, interval, this._timeZone);
    }
    this._isDirty = false;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._initLocalDt();
    if (this._config?.interaction_mode === 'popup' && this._config.auto_confirm_on_close) {
      window.addEventListener('browser-mod-popup-closed', this._handlePopupClose);
      // Also catch ha-dialog close (X button) — delayed to let DOM settle
      setTimeout(() => this._attachDialogListener(), 200);
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('browser-mod-popup-closed', this._handlePopupClose);
    this._detachDialogListener();
  }

  private _dialogEl: Element | null = null;

  private _getBmDialog(): Element | null {
    return document.querySelector('home-assistant')
      ?.shadowRoot?.querySelector('browser-mod-popup')
      ?.shadowRoot?.querySelector('ha-dialog') ?? null;
  }

  private _attachDialogListener(): void {
    this._dialogEl = this._getBmDialog();
    this._dialogEl?.addEventListener('closed', this._handlePopupClose);
  }

  private _detachDialogListener(): void {
    this._dialogEl?.removeEventListener('closed', this._handlePopupClose);
    this._dialogEl = null;
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
    const now = new Date();
    const haDatetime = this._getHaDatetime();
    // For state: use localDt when editing, confirmedDt briefly after save, otherwise raw HA value
    // Never use roundUpToInterval — that would show "scheduled" even when nothing is planned
    const effectiveDt = this._isDirty ? this._localDt : (this._confirmedDt ?? haDatetime);
    return computeState(statusState, effectiveDt?.toISOString(), now);
  }

  private _shift(deltaMinutes: number): void {
    const allow_past = this._config?.allow_past ?? false;
    const interval = this._config?.round_to_minutes ?? 15;
    const now = new Date();
    const tz = this._timeZone;
    // Start from current display value (HA or local)
    const base = this._isDirty
      ? this._localDt
      : (this._getHaDatetime() ?? roundUpToInterval(now, interval, tz));
    let next = addMinutes(base, deltaMinutes);
    if (!allow_past && !isFuture(next, now)) {
      next = clampToFuture(next, interval, tz);
    }
    this._localDt = next;
    this._isDirty = true;
  }

  private _setTomorrow(): void {
    const preset = this._config?.tomorrow_preset;
    const timeStr = preset?.time ?? '06:00';
    this._localDt = setTomorrowTime(timeStr, this._timeZone);
    this._isDirty = true;
  }

  private _setQuickTime(day: 'today' | 'tomorrow', timeStr: string): void {
    this._localDt = day === 'tomorrow'
      ? setTomorrowTime(timeStr, this._timeZone)
      : setTodayTime(timeStr, this._timeZone);
    this._isDirty = true;
  }

  private async _confirm(): Promise<void> {
    if (!this._config || !this.hass || this._saving) return;
    const allow_past = this._config.allow_past ?? false;
    const now = new Date();
    if (!allow_past && !isFuture(this._localDt, now)) {
      this._localDt = clampToFuture(this._localDt, this._config.round_to_minutes ?? 15, this._timeZone);
    }
    this._saving = true;
    const savedDt = this._localDt;
    try {
      await callInputDatetimeSet(this.hass, this._config.entity, savedDt);
      this._confirmedDt = savedDt; // show this until HA confirms the new value
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
    // Browser Mod 2.x: home-assistant → browser-mod-popup → ha-dialog → close button
    const dialog = this._getBmDialog();
    if (dialog) {
      const closeBtn = dialog.shadowRoot?.querySelector<HTMLElement>('ha-icon-button[data-dialog="close"]');
      if (closeBtn) { closeBtn.click(); return; }
      // Fallback: dispatch closed event
      dialog.dispatchEvent(new Event('closed'));
      return;
    }
    // Fallback: Browser Mod 1.x API
    const w = window as unknown as Record<string, unknown>;
    const bm = w['browser_mod'] as { close_popup?: () => void } | undefined;
    bm?.close_popup?.();
  }

  private async _startNow(): Promise<void> {
    if (!this._config || !this.hass) return;
    await callHaAction(this.hass, this._config.start_action);
  }

  private async _stopNow(): Promise<void> {
    if (!this._config || !this.hass) return;
    await callHaAction(this.hass, this._config.stop_action);
    if (this._config.clear_schedule_on_stop !== false) {
      this._clearingSchedule = true;
      await clearSchedule(this.hass, this._config.entity);
    }
    this._isDirty = false;
    this._confirmedDt = undefined;
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
    const showMinute = this._config.show_minute_buttons ?? false;
    const isPopup = this._config.interaction_mode === 'popup';
    const stepMinutes = this._config.step_minutes ?? 15;
    const now = new Date();
    const tz = this._timeZone;
    const interval = this._config.round_to_minutes ?? 15;
    const haDatetime = this._getHaDatetime();
    const displayDt = this._isDirty
      ? this._localDt
      : this._confirmedDt
        ?? (haDatetime && isFuture(haDatetime, now) ? haDatetime : roundUpToInterval(now, interval, tz));
    const relativeStr = isFuture(displayDt, now) ? formatRelative(displayDt, now) : null;
    const savedStr = haDatetime ? formatDisplay(haDatetime, tz) : '—';
    const stateClasses = { [`state-${cardState}`]: true };

    // Split time and date for separate display
    const timeParts = new Intl.DateTimeFormat('cs-CZ', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(displayDt);
    const dateParts = (() => {
      const nowKey = new Intl.DateTimeFormat('cs-CZ', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
      const dtKey  = new Intl.DateTimeFormat('cs-CZ', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(displayDt);
      const tmrKey = new Intl.DateTimeFormat('cs-CZ', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(now.getTime() + 86400000));
      if (dtKey === nowKey) return 'Dnes';
      if (dtKey === tmrKey) return 'Zítra';
      return new Intl.DateTimeFormat('cs-CZ', { timeZone: tz, day: 'numeric', month: 'numeric' }).format(displayDt);
    })();

    const presets = [
      ...(this._config.tomorrow_preset
        ? [html`<button class="btn-preset" @click=${this._setTomorrow}>${this._config.tomorrow_preset.label ?? (labels.tomorrow ?? 'Zítra')}</button>`]
        : []),
      ...(this._config.quick_times?.map(qt => html`
        <button class="btn-preset" @click=${() => this._setQuickTime(qt.day, qt.time)}>${qt.label}</button>
      `) ?? []),
    ];

    return html`
      <ha-card style=${styleMap(this._applyStateColors())}>
        <div class="card-header">
          <div class="card-icon ${classMap(stateClasses)}">
            <ha-icon icon=${this._config.icon ?? 'mdi:ev-plug-type2'}></ha-icon>
          </div>
          <div class="card-name">${this._config.name ?? 'Plánovač'}</div>
          <span class="state-badge ${classMap(stateClasses)}">
            ${this._getStateLabel(cardState)}
          </span>
        </div>

        <div class="time-display ${this._isDirty ? 'dirty' : ''}">
          <div class="time-label ${this._isDirty ? 'dirty' : ''}">
            ${this._isDirty ? 'Neuloženo' : 'Začátek nabíjení'}
          </div>
          <div class="time-main">${timeParts}</div>
          <div class="time-date">${dateParts}</div>
          ${relativeStr ? html`<div class="time-relative">${relativeStr}</div>` : nothing}
          ${this._isDirty
            ? html`<div class="time-pending-label">uloženo: ${savedStr}</div>`
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

        ${presets.length > 0 ? html`
          <div class="${presets.length === 1 ? 'btn-presets-1' : 'btn-presets'}">
            ${presets}
          </div>
        ` : nothing}

        ${this._isDirty ? html`
          <button class="btn-confirm" @click=${isPopup ? this._saveAndClose : this._confirm} ?disabled=${this._saving}>
            ${this._saving ? 'Ukládám…' : (isPopup ? (labels.save_and_close ?? 'Uložit plán a zavřít') : (labels.confirm ?? 'Uložit plán'))}
          </button>
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
      </ha-card>
    `;
  }
}

customElements.define('touch-action-scheduler-card', TouchActionSchedulerCard);

const CARD_VERSION = '0.1.4';
console.info(`%c touch-action-scheduler-card %c v${CARD_VERSION} `, 'background:#607d8b;color:#fff;font-weight:700', 'background:#ffc107;color:#000;font-weight:700');

const _w = window as unknown as Record<string, unknown>;
_w['customCards'] = _w['customCards'] || [];
(_w['customCards'] as Array<Record<string, unknown>>).push({
  type: 'touch-action-scheduler-card',
  name: 'Touch Action Scheduler Card',
  description: 'Touchscreen card for scheduling and instant control of HA actions.',
  version: CARD_VERSION,
});
