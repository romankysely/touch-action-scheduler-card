import { css } from 'lit';

export const cardStyles = css`
  :host {
    --tasc-inactive-color: var(--tasc-color-inactive, #607d8b);
    --tasc-scheduled-color: var(--tasc-color-scheduled, #ffc107);
    --tasc-active-color: var(--tasc-color-active, #f44336);
    --tasc-btn-radius: 8px;
    --tasc-btn-min-height: 48px;
    --tasc-gap: 8px;
    display: block;
  }

  ha-card {
    padding: 16px;
    box-sizing: border-box;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .card-icon {
    width: 40px;
    height: 40px;
    --mdc-icon-size: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.1);
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
    font-size: 1rem;
    font-weight: 500;
    color: var(--primary-text-color);
    flex: 1;
  }

  .state-badge {
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .state-badge.state-inactive {
    background: color-mix(in srgb, var(--tasc-inactive-color) 20%, transparent);
    color: var(--tasc-inactive-color);
  }

  .state-badge.state-scheduled {
    background: color-mix(in srgb, var(--tasc-scheduled-color) 20%, transparent);
    color: var(--tasc-scheduled-color);
  }

  .state-badge.state-active {
    background: color-mix(in srgb, var(--tasc-active-color) 20%, transparent);
    color: var(--tasc-active-color);
  }

  .time-display {
    text-align: center;
    margin: 12px 0;
    padding: 12px 16px;
    border-radius: 10px;
    background: var(--secondary-background-color, rgba(0,0,0,0.05));
    border: 2px solid transparent;
    transition: border-color 0.2s;
    cursor: default;
  }

  .time-display.dirty {
    border-color: var(--tasc-scheduled-color);
  }

  .time-main {
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--primary-text-color);
    line-height: 1.2;
  }

  .time-relative {
    font-size: 0.85rem;
    color: var(--secondary-text-color);
    margin-top: 2px;
  }

  .time-pending-label {
    font-size: 0.7rem;
    color: var(--tasc-scheduled-color);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 4px;
  }

  .btn-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--tasc-gap);
    margin: var(--tasc-gap) 0;
  }

  .btn-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--tasc-gap);
    margin: var(--tasc-gap) 0;
  }

  .btn-grid-wide {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--tasc-gap);
    margin: var(--tasc-gap) 0;
  }

  button {
    min-height: var(--tasc-btn-min-height);
    border: none;
    border-radius: var(--tasc-btn-radius);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    padding: 8px 4px;
    transition: background 0.15s, transform 0.1s, opacity 0.15s;
    font-family: inherit;
  }

  button:active {
    transform: scale(0.96);
  }

  button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }

  .btn-step {
    background: var(--secondary-background-color, rgba(0,0,0,0.07));
    color: var(--primary-text-color);
  }

  .btn-step:hover:not(:disabled) {
    background: var(--secondary-background-color, rgba(0,0,0,0.12));
  }

  .btn-tomorrow {
    background: var(--secondary-background-color, rgba(0,0,0,0.07));
    color: var(--primary-text-color);
    font-size: 0.85rem;
  }

  .btn-confirm {
    background: var(--tasc-scheduled-color);
    color: #000;
    font-size: 1rem;
    font-weight: 700;
    animation: pulse-confirm 1.5s infinite;
  }

  @keyframes pulse-confirm {
    0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--tasc-scheduled-color) 60%, transparent); }
    50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--tasc-scheduled-color) 0%, transparent); }
  }

  .divider {
    height: 1px;
    background: var(--divider-color, rgba(0,0,0,0.1));
    margin: 12px 0;
  }

  .instant-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--tasc-gap);
    margin-top: var(--tasc-gap);
  }

  .btn-start {
    background: color-mix(in srgb, var(--success-color, #4caf50) 15%, transparent);
    color: var(--success-color, #4caf50);
    border: 1px solid var(--success-color, #4caf50);
    font-weight: 600;
  }

  .btn-start:hover:not(:disabled) {
    background: color-mix(in srgb, var(--success-color, #4caf50) 25%, transparent);
  }

  .btn-stop {
    background: color-mix(in srgb, var(--tasc-active-color) 15%, transparent);
    color: var(--tasc-active-color);
    border: 1px solid var(--tasc-active-color);
    font-weight: 600;
  }

  .btn-stop:hover:not(:disabled) {
    background: color-mix(in srgb, var(--tasc-active-color) 25%, transparent);
  }

  .btn-save-close {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    font-weight: 600;
    width: 100%;
  }

  /* Layout: compact */
  :host([layout="compact"]) ha-card {
    padding: 10px;
  }

  :host([layout="compact"]) .time-main {
    font-size: 1.4rem;
  }

  :host([layout="compact"]) button {
    min-height: 40px;
    font-size: 0.8rem;
  }

  /* Layout: large */
  :host([layout="large"]) .time-main {
    font-size: 2.4rem;
  }

  :host([layout="large"]) button {
    min-height: 56px;
    font-size: 1rem;
  }

  :host([layout="large"]) ha-card {
    padding: 20px;
  }
`;
