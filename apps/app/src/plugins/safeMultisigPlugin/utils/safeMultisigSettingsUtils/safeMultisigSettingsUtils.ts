import type { IDefinitionSetting } from '@aragon/gov-ui-kit';
import type { ISafeInfo } from '@/shared/api/safeService';
import type { TranslationFunction } from '@/shared/components/translationsProvider';

export interface ISafeMultisigSettingsParseParams {
    /**
     * Live Safe state: owners, threshold, version and nonce.
     */
    safeInfo: ISafeInfo;
    /**
     * Name the Safe is shown under - its ENS name, or the truncated address.
     */
    safeName: string;
    /**
     * Link to the Safe's own account page in the Safe web app. Absent when Safe does not serve the
     * network, in which case the row states the Safe without linking anywhere.
     */
    safeHref?: string;
    t: TranslationFunction;
}

class SafeMultisigSettingsUtils {
    /**
     * Settings are where a body's standing configuration belongs, so the Safe's own particulars
     * (address, threshold, nonce, version) are stated here rather than repeated on the breakdown
     * beside gov-ui-kit's own approval summary.
     */
    parseSettings = (
        params: ISafeMultisigSettingsParseParams,
    ): IDefinitionSetting[] => {
        const { safeInfo, safeName, safeHref, t } = params;
        const translationKey =
            'app.plugins.safeMultisig.safeMultisigGovernanceSettings';

        return [
            {
                term: t(`${translationKey}.strategy`),
                definition: t(`${translationKey}.strategyValue`),
            },
            {
                term: t(`${translationKey}.safe`),
                definition: safeName,
                link:
                    safeHref == null
                        ? undefined
                        : { href: safeHref, isExternal: true },
                copyValue: safeInfo.address,
            },
            {
                term: t(`${translationKey}.threshold`),
                definition: t(`${translationKey}.thresholdValue`, {
                    min: safeInfo.threshold,
                    max: safeInfo.owners.length,
                }),
            },
            {
                // Live account state, not this body's configuration: it advances with every
                // transaction the Safe executes, including ones with nothing to do with Aragon. Said
                // as "current" so it is never read as the nonce this proposal's transaction used.
                term: t(`${translationKey}.currentNonce`),
                definition: safeInfo.nonce,
            },
            {
                term: t(`${translationKey}.version`),
                definition:
                    safeInfo.version ?? t(`${translationKey}.unknownVersion`),
            },
            {
                term: t(`${translationKey}.execution`),
                definition: t(`${translationKey}.executionValue`),
            },
        ];
    };
}

export const safeMultisigSettingsUtils = new SafeMultisigSettingsUtils();
