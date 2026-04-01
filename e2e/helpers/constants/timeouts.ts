/**
 * Centralized timeout constants for BV and smoke E2E tests.
 * Keeps magic numbers out of helpers/specs and makes tuning easier.
 */

/** MetaMask notification popup may appear with a delay after a dApp action. */
export const MM_NOTIFICATION_TIMEOUT = 15_000;

/** Extended timeout for MetaMask notifications during transaction confirmation. */
export const MM_CONFIRM_NOTIFICATION_TIMEOUT = 45_000;

/** Governance transaction dialog (vote / execute) initial appearance. */
export const GOVERNANCE_DIALOG_TIMEOUT = 35_000;

/** Waiting for "View proposal" link/button after on-chain action completes. */
export const VIEW_PROPOSAL_TIMEOUT = 120_000;

/** MetaMask confirm-action button search within a notification popup. */
export const MM_CONFIRM_ACTION_TIMEOUT = 12_000;

/** Waiting for proposal creation elements (title, actions, asset dialog). */
export const PROPOSAL_FORM_ELEMENT_TIMEOUT = 25_000;

/** Waiting for a Publish proposal dialog to appear after form submission. */
export const PUBLISH_DIALOG_TIMEOUT = 30_000;

/** Waiting for "Execute" / "Executed" button after proposal approval. */
export const EXECUTION_TIMEOUT = 120_000;

/** Member-gate API response before interacting with proposals page. */
export const MEMBER_GATE_API_TIMEOUT = 25_000;
