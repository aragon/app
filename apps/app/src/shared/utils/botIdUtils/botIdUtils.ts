import { checkBotId } from 'botid/server';
import { headers } from 'next/headers';
import { monitoringUtils } from '../monitoringUtils';

/**
 * Entry point that ran the check, reported as the `source` tag of the rejection event.
 */
export type BotIdSource = 'pin' | 'backend' | 'rpc';

/**
 * What the rejected request carried, reported as the `stage` tag of the rejection event: `no-challenge` is a
 * client that never ran the BotID script (curl), `rejected` ran it and failed the check.
 */
export type BotIdStage = 'no-challenge' | 'rejected';

export interface IBotIdCheckOptions {
    /**
     * Verdict when BotID itself fails (classification call down, OIDC token missing): `reject` treats the
     * request as automated, `allow` lets it through. Paid writes fail closed; chain reads fail open, the WAF
     * rate limits still cap their volume.
     */
    onError: 'allow' | 'reject';
}

class BotIdUtils {
    /**
     * Message of the Sentry event logged on every rejection; the "BotID rejections" metric monitor counts it.
     */
    private readonly rejectionMessage = 'BotId: automated request rejected';

    /**
     * Check level, pinned to basic to match instrumentation-client.ts and to override the project-level
     * "Deep Analysis" toggle of the Vercel dashboard: deep analysis is billed per call and the relays run one
     * per request.
     */
    private readonly checkOptions = {
        advancedOptions: { checkLevel: 'basic' as const },
    };

    /**
     * Returns true when Vercel BotID classifies the request as automated, and logs a warning tagged with the
     * source and stage so rejections can be counted. Browsers that ran the client challenge (see
     * instrumentation-client.ts) pass, curl-style requests and headless tools fail. Always false in local
     * development, where BotID is bypassed. A failure of the check itself is logged as an error and resolved by
     * `onError`.
     */
    isBot = async (
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

        if (isBot) {
            monitoringUtils.logMessage(this.rejectionMessage, {
                level: 'warning',
                context: { source, stage: await this.getStage() },
            });
        }

        return isBot;
    };

    /**
     * Throws when the request is automated or the check fails, for server actions that spend paid services and
     * return no response of their own.
     */
    assertHuman = async (source: BotIdSource): Promise<void> => {
        if (await this.isBot(source, { onError: 'reject' })) {
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
