/**
 * Centralized timeout constants for BV and smoke E2E tests.
 * Keeps magic numbers out of helpers/specs and makes tuning easier.
 */

/** MetaMask notification popup may appear with a delay after a dApp action. */
export const MM_NOTIFICATION_TIMEOUT = 20_000;

/** Extended timeout for MetaMask notifications during transaction confirmation. */
export const MM_CONFIRM_NOTIFICATION_TIMEOUT = 45_000;

/** Governance transaction dialog (vote / execute) initial appearance. */
export const GOVERNANCE_DIALOG_TIMEOUT = 35_000;

/** Waiting for "View proposal" link/button after on-chain action completes. */
export const VIEW_PROPOSAL_TIMEOUT = 120_000;

/** MetaMask confirm-action button search within a notification popup. */
export const MM_CONFIRM_ACTION_TIMEOUT = 18_000;

/** Waiting for proposal creation elements (title, actions, asset dialog). */
export const PROPOSAL_FORM_ELEMENT_TIMEOUT = 25_000;

/** Waiting for a Publish proposal dialog to appear after form submission. */
export const PUBLISH_DIALOG_TIMEOUT = 30_000;

/** Waiting for "Execute" / "Executed" button after proposal approval. */
export const EXECUTION_TIMEOUT = 120_000;

/** Member-gate API response before interacting with proposals page. */
export const MEMBER_GATE_API_TIMEOUT = 25_000;

/** Proposals list API + skeleton → links (slow on staging). */
export const PROPOSALS_API_TIMEOUT = 60_000;

/** Optional MetaMask popup poll (e.g. network switch before connect). */
export const MM_OPTIONAL_NOTIFICATION_TIMEOUT = 5000;

/** Plugin picker dialog when creating a proposal. */
export const PLUGIN_SELECT_DIALOG_TIMEOUT = 10_000;

/** Typical form step / option visibility (wizard, explore). */
export const UI_STEP_TIMEOUT = 15_000;

/** Asset picker and similar heavier dialogs. */
export const UI_DIALOG_TIMEOUT = 20_000;

/** Short assertion after debounced field input. */
export const UI_FIELD_VALUE_TIMEOUT = 10_000;

/** Aragon profile intro dismiss after wallet connect. */
export const ARAGON_PROFILE_DISMISS_TIMEOUT = 20_000;

/** Explore DAO search debounced API response. */
export const EXPLORE_SEARCH_API_TIMEOUT = 30_000;

/** Explore DAO cards visible after search. */
export const EXPLORE_SEARCH_UI_TIMEOUT = 15_000;

/** Redirect to proposal detail after publish. */
export const PROPOSAL_CREATED_NAV_TIMEOUT = 60_000;

/** Accordion expand affordance on proposal detail. */
export const ACCORDION_VISIBILITY_TIMEOUT = 5000;

/** "Sign transaction" in publish proposal dialog. */
export const SIGN_TRANSACTION_TIMEOUT = 40_000;

/** Governance dialog sign / resend button click. */
export const GOVERNANCE_SIGN_CLICK_TIMEOUT = 90_000;
