import type { ProposalVotingTab } from '@aragon/gov-ui-kit';
import { PluginInterfaceType } from '@/shared/api/daoService';
import type { IPlugin } from '@/shared/utils/pluginRegistryUtils';

/** The unified Safe identity used by Safe processes and external SPP Safe bodies. */
export const safeProcessPlugin: IPlugin = {
    id: PluginInterfaceType.SAFE,
    name: 'Safe',
};

/**
 * Poll cadence of the Safe reads while the Safe queue holds a live transaction. An idle body card
 * does not poll at all — it refreshes on window focus, and polling pauses on an unfocused tab.
 *
 * Two queries poll at this cadence, so every active viewer of a live queue costs
 * `2 * 3600 / (interval / 1000)` upstream calls per hour against one shared, rate-limited API key.
 * Nothing depends on the exact value; it trades how fast an owner sees a co-signer's signature
 * against quota spend.
 */
export const safeBodyPollInterval = 30_000;

/**
 * How far back into a Safe's executed transactions to look for a settled report.
 *
 * A page rather than an unbounded scan: the target report is almost always among the most recent
 * executions, and the read is metered. Deep enough to survive a busy treasury executing unrelated
 * transactions after the report, shallow enough to stay one request.
 */
export const settledHistoryPageSize = 40;

/**
 * How many history pages the settled-report scan will walk before giving up.
 *
 * This is the scan's only bound, so it is load-bearing rather than pathological: there is no date
 * floor to stop earlier, because a report can execute before its stage opened. At the page size
 * above it covers the most recent 400 executed transactions; past that the scan reports that it ran
 * out rather than that the report does not exist.
 */
export const settledHistoryMaxPages = 10;

/**
 * How much of the queue a pre-signing read asks for in one request.
 *
 * The queue endpoint cannot filter by nonce, so a transaction the read does not see is either
 * absent or merely past the page. This is set deep enough that a real queue fits in one request;
 * when it does not, the caller reads `next` and declines to treat absence as a fact.
 */
export const safeQueueReadLimit = 100;

/**
 * Plugin id generic external stage bodies resolve to. Supported-network SPP Safe bodies use the
 * unified Safe identity instead; unsupported networks stay on this fallback.
 */
export const externalPluginId = 'external';

/**
 * Tabs a Safe body hides. A Safe builds its Votes tab from live Safe confirmations rather than an
 * indexed sub-proposal, so unlike the generic external body it hides nothing. Registered as a slot
 * function so the shared process chrome never needs to know a Safe exists.
 */
export const safeBodyHiddenTabs: ProposalVotingTab[] = [];
