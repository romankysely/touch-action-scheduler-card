import { css } from 'lit';

export const cardStyles = css`
  :host {
    --tasc-inactive-color: var(--tasc-color-inactive, #607d8b);
    --tasc-scheduled-color: var(--tasc-color-scheduled, #ffc107);
    --tasc-active-color: var(--tasc-color-active, #f44336);
    --tasc-btn-radius: 12px;
    --tasc-btn-min-height: 52px;
    --tasc-gap: 8px;
    display: block;
  }

  ha-card {
    padding: 20px 20px 24px;
    box-sizing: border-box;
    max-width: 420px;
    margin: 0 auto;
    background: #0d1117;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 20px;
  }

  .card-icon {
    width: 52px;
    height: 52px;
    --mdc-icon-size: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    flex-shrink: 0;
    transition: color 0.3s, background 0.3s;
  }

  .card-icon.state-inactive {
    color: var(--tasc-inactive-color);
    background: color-mix(in srgb, var(--tasc-inactive-color) 15%, transparent);
  }

  .card-icon.state-scheduled {
    color: var(--tasc-scheduled-color);
    background: color-mix(in srgb, var(--tasc-scheduled-color) 15%, transparent);
  }

  .card-icon.state-active {
    color: var(--tasc-active-color);
    background: color-mix(in srgb, var(--tasc-active-color) 15%, transparent);
  }

  .card-name {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--primary-text-color);
    flex: 1;
  }

  .state-badge {
    font-size: 0.65rem;
    padding: 4px 12px;
    border-radius: 20px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .state-badge.state-inactive {
    background: color-mix(in srgb, var(--tasc-inactive-color) 18%, transparent);
    color: var(--tasc-inactive-color);
  }

  .state-badge.state-scheduled {
    background: color-mix(in srgb, var(--tasc-scheduled-color) 18%, transparent);
    color: var(--tasc-scheduled-color);
  }

  .state-badge.state-active {
    background: color-mix(in srgb, var(--tasc-active-color) 18%, transparent);
    color: var(--tasc-active-color);
  }

  /* ── Time display ── */
  .time-display {
    text-align: center;
    margin: 0 0 12px;
    padding: 20px 16px 16px;
    border-radius: 16px;
    background: var(--secondary-background-color, rgba(255,255,255,0.05));
    border: 1.5px solid transparent;
    transition: border-color 0.2s;
  }

  .time-display.dirty {
    border-color: color-mix(in srgb, var(--tasc-scheduled-color) 60%, transparent);
  }

  .time-display:not(.dirty) {
    border-color: color-mix(in srgb, var(--info-color, #00bcd4) 30%, transparent);
  }

  .time-label {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 4px;
    color: var(--info-color, #00bcd4);
  }

  .time-label.dirty {
    color: var(--tasc-scheduled-color);
  }

  .time-main {
    font-size: 3rem;
    font-weight: 700;
    color: var(--primary-text-color);
    line-height: 1.05;
    letter-spacing: -1px;
  }

  .time-date {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--primary-text-color);
    margin-top: 2px;
    opacity: 0.8;
  }

  .time-relative {
    font-size: 0.85rem;
    color: var(--secondary-text-color);
    margin-top: 3px;
  }

  .time-pending-label {
    font-size: 0.65rem;
    color: var(--tasc-scheduled-color);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-top: 6px;
  }

  /* ── Step buttons ── */
  .btn-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 8px;
  }

  .btn-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-bottom: 8px;
  }

  /* Presets: 2 columns, centered */
  .btn-presets {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-bottom: 10px;
  }

  .btn-presets-1 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
    margin-bottom: 10px;
  }

  button {
    min-height: var(--tasc-btn-min-height);
    border: none;
    border-radius: var(--tasc-btn-radius);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    padding: 10px 6px;
    transition: background 0.15s, transform 0.1s, opacity 0.15s;
    font-family: inherit;
    width: 100%;
    text-align: center;
  }

  button:active {
    transform: scale(0.95);
  }

  button:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    transform: none;
  }

  .btn-step {
    background: var(--secondary-background-color, rgba(255,255,255,0.06));
    color: var(--primary-text-color);
    border: 1px solid var(--divider-color, rgba(255,255,255,0.08));
    font-size: 0.88rem;
  }

  .btn-step:hover:not(:disabled) {
    background: rgba(255,255,255,0.1);
  }

  .btn-preset {
    background: var(--secondary-background-color, rgba(255,255,255,0.06));
    color: var(--secondary-text-color);
    border: 1px solid var(--divider-color, rgba(255,255,255,0.08));
    font-size: 0.95rem;
    min-height: 48px;
  }

  .btn-preset:hover:not(:disabled) {
    background: rgba(255,255,255,0.1);
    color: var(--primary-text-color);
  }

  .btn-confirm {
    background: var(--tasc-scheduled-color);
    color: #000;
    font-size: 1rem;
    font-weight: 700;
    min-height: 54px;
    border-radius: 14px;
    margin-bottom: 12px;
    animation: pulse-confirm 1.8s infinite;
  }

  @keyframes pulse-confirm {
    0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--tasc-scheduled-color) 50%, transparent); }
    50%       { box-shadow: 0 0 0 7px color-mix(in srgb, var(--tasc-scheduled-color) 0%, transparent); }
  }

  /* ── Divider ── */
  .divider {
    height: 1px;
    background: var(--divider-color, rgba(255,255,255,0.08));
    margin: 12px 0;
  }

  /* ── Instant actions ── */
  .instant-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .btn-start {
    background: var(--success-color, #00c853);
    color: #000;
    font-weight: 700;
    border-radius: 14px;
    min-height: 54px;
    font-size: 0.95rem;
  }

  .btn-start:hover:not(:disabled) {
    opacity: 0.9;
  }

  .btn-stop {
    background: var(--tasc-active-color);
    color: #000;
    font-weight: 700;
    border-radius: 14px;
    min-height: 54px;
    font-size: 0.95rem;
  }

  .btn-stop:hover:not(:disabled) {
    opacity: 0.9;
  }

  /* ── Layout: compact ── */
  :host([layout="compact"]) ha-card {
    padding: 14px 14px 18px;
  }

  :host([layout="compact"]) .time-main {
    font-size: 2.4rem;
  }

  :host([layout="compact"]) button {
    min-height: 44px;
    font-size: 0.82rem;
  }

  :host([layout="compact"]) .btn-start,
  :host([layout="compact"]) .btn-stop,
  :host([layout="compact"]) .btn-confirm {
    min-height: 48px;
  }

  /* ── Layout: large ── */
  :host([layout="large"]) .time-main {
    font-size: 3.6rem;
  }

  :host([layout="large"]) button {
    min-height: 60px;
    font-size: 1rem;
  }

  :host([layout="large"]) ha-card {
    padding: 24px 24px 28px;
  }
`;
