import { checkBotId } from 'botid/server';
import { headers } from 'next/headers';
import { monitoringUtils } from '../monitoringUtils';

/**
 * Entry point that ran the check, reported as the `source` attribute of the detection counter.
 */
export type BotIdSource = 'pin' | 'backend' | 'rpc';

/**
 * What the automated request carried, reported as the `stage` attribute of the detection counter: `no-challenge`
 * has no BotID header, so it did not come from our page (curl, scripts, a tab on a bundle older than BotID);
 * `rejected` has the header and failed the check. The header can be copied, so `rejected` is not proof of a
 * browser.
 */
export type BotIdStage = 'no-challenge' | 'rejected';

export interface IBotIdCheckOptions {
    /**
     * Verdict when BotID itself fails (classification call down, OIDC token missing): `reject` treats the
     * request as automated, `allow` lets it through. Paid writes fail closed; chain reads fail open, the WAF
     * rate limits still cap their volume.
     */
    onError: 'allow' | 'reject';
    /**
     * Verdict for a request that carries the challenge of our page and still fails the check (stage `rejected`).
     * BotID fails real browsers this way, after a back/forward restore or for good, so chain reads `allow` it and
     * only refuse clients that never ran the page; paid writes keep the default `reject`.
     */
    onFailedChallenge?: 'allow' | 'reject';
}

class BotIdUtils {
    /**
     * Sentry counter incremented for every request BotID classifies as automated, with the `source`, `stage` and
     * `action` (`blocked` or `allowed`) attributes; the "BotID rejections" metric monitor reads the blocked ones.
     * A counter keeps them out of the error quota and the issue alerts.
     */
    private readonly detectionMetric = 'botid.detection';

    /**
     * Check level, pinned to basic to match instrumentation-client.ts and to override the project-level
     * "Deep Analysis" toggle of the Vercel dashboard: deep analysis is billed per call and the relays run one
     * per request.
     */
    private readonly checkOptions = {
        advancedOptions: { checkLevel: 'basic' as const },
    };

    /**
     * Returns true when the request must be refused: Vercel BotID classifies it as automated and the options do
     * not let its stage through. Every automated verdict is counted by source, stage and action. Browsers that ran
     * the client challenge (see instrumentation-client.ts) pass, curl-style requests and headless tools fail.
     * Always false in local development, where BotID is bypassed. A failure of the check itself is logged as an
     * error and resolved by `onError`.
     */
    shouldReject = async (
        source: BotIdSource,
        options: IBotIdCheckOptions,
    ): Promise<boolean> => {
        let isBot: boolean;

        try {
            ({ isBot } = await checkBotId(this.checkOptions));
        } catch (error: unknown) {
            monitoringUtils.logError(error, {
                context: { module: 'botIdUtils', source },
            });

            return options.onError === 'reject';
        }

        if (!isBot) {
            return false;
        }

        const stage = await this.getStage();
        const isAllowed =
            stage === 'rejected' && options.onFailedChallenge === 'allow';

        monitoringUtils.incrementCounter(this.detectionMetric, {
            source,
            stage,
            action: isAllowed ? 'allowed' : 'blocked',
        });

        return !isAllowed;
    };

    /**
     * Throws when the request is automated or the check fails, for server actions that spend paid services and
     * return no response of their own.
     */
    assertHuman = async (source: BotIdSource): Promise<void> => {
        if (await this.shouldReject(source, { onError: 'reject' })) {
            throw new Error(
                `BotIdUtils: automated request rejected (${source}).`,
            );
        }
    };

    private getStage = async (): Promise<BotIdStage> => {
        const requestHeaders = await headers();

        return requestHeaders.get('x-is-human') == null
            ? 'no-challenge'
            : 'rejected';
    };
}

export const botIdUtils = new BotIdUtils();
