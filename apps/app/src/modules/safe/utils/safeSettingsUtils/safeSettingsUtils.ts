import { addressUtils, type IDefinitionSetting } from '@aragon/gov-ui-kit';
import type { ISafeInfo } from '@/shared/api/safeService';
import type { TranslationFunction } from '@/shared/components/translationsProvider';

export const safeSettingsTranslationKey = 'app.safe.safeSettings';

export interface ISafeSettingsRowsParams {
    /**
     * Live Safe state: owners, threshold, version and nonce.
     */
    safeInfo: ISafeInfo;
    /**
     * Name the Safe is shown under - its ENS name, or the truncated address.
     */
    safeName: string;
    /**
     * Where the Safe's address resolves: the Safe web app from a governance body, the block
     * explorer from the account page. Absent when neither serves the network, in which case the
     * row states the Safe without linking anywhere.
     */
    safeHref?: string;
    t: TranslationFunction;
}

/**
 * One description of a Safe, stated the same way wherever it appears: the body's Settings tab in a
 * proposal and the Safe's own account page are the same subject read from the same endpoint, so
 * they share these rows rather than each wording the account their own way.
 *
 * The rows a surface owns stay with that surface - the chain the account page states, the decided
 * configuration a reported body recovers from its transaction.
 */
class SafeSettingsUtils {
    /**
     * The Safe's identity. `isOnchainEntity` hands the row to the kit's address output, which owns
     * the reveal and copies the checksummed address rather than the shown label.
     *
     * Safe serves only the current version and a contract can be upgraded after a decision
     * executes, so the version can only ever mean "now" - which is why it sits under the live
     * address as help text rather than claiming a row of its own.
     */
    addressRow = (params: ISafeSettingsRowsParams): IDefinitionSetting => {
        const { safeInfo, safeName, safeHref, t } = params;

        return {
            term: t(`${safeSettingsTranslationKey}.safe`),
            definition: safeName,
            link:
                safeHref == null
                    ? undefined
                    : {
                          href: safeHref,
                          isExternal: true,
                          isOnchainEntity: true,
                      },
            copyValue: safeInfo.address,
            description: t(`${safeSettingsTranslationKey}.versionHelp`, {
                version:
                    safeInfo.version ??
                    t(`${safeSettingsTranslationKey}.unknownVersion`),
            }),
        };
    };

    /**
     * What the Safe requires and where its sequence stands. The nonce advances with every
     * transaction the Safe executes, including ones with nothing to do with Aragon, so it is said
     * as "current" and never as one proposal's nonce.
     */
    liveConfigurationRows = (
        params: Pick<ISafeSettingsRowsParams, 'safeInfo' | 't'>,
    ): IDefinitionSetting[] => {
        const { safeInfo, t } = params;

        return [
            {
                term: t(`${safeSettingsTranslationKey}.threshold`),
                definition: safeInfo.threshold.toString(),
            },
            {
                term: t(`${safeSettingsTranslationKey}.currentNonce`),
                definition: safeInfo.nonce,
            },
        ];
    };

    /**
     * Owners and threshold alone are an incomplete authority picture: a guard can make an
     * otherwise-valid transaction unexecutable, and a module can move funds with no owner signature
     * at all. Both are already fetched and validated, so withholding them would be an active choice
     * to understate who can move this Safe. Disclosure only - managing either belongs to the Safe
     * app, and a Safe with neither gets no rows rather than two empty ones.
     */
    authorityRows = (
        params: Pick<ISafeSettingsRowsParams, 'safeInfo' | 't'>,
    ): IDefinitionSetting[] => {
        const { safeInfo, t } = params;
        const rows: IDefinitionSetting[] = [];

        if (safeInfo.guard != null) {
            rows.push({
                term: t(`${safeSettingsTranslationKey}.guard`),
                definition: addressUtils.truncateAddress(safeInfo.guard),
                copyValue: safeInfo.guard,
            });
        }

        if (safeInfo.modules.length > 0) {
            rows.push({
                term: t(`${safeSettingsTranslationKey}.modules`),
                definition: t(`${safeSettingsTranslationKey}.modulesValue`, {
                    count: safeInfo.modules.length,
                }),
            });
        }

        return rows;
    };
}

export const safeSettingsUtils = new SafeSettingsUtils();
