import type { IDefinitionSetting } from '@aragon/gov-ui-kit';
import {
    type ISafeAddressRowParams,
    type ISafeSettingsRowsParams,
    safeSettingsTranslationKey,
    safeSettingsUtils,
} from '@/modules/safe/utils/safeSettingsUtils';
import type { ISafeMultisigTransaction } from '@/shared/api/safeService';

export interface ISafeMultisigSettingsParseParams
    extends ISafeAddressRowParams,
        ISafeSettingsRowsParams {
    /**
     * Whether this body's say is over - it reported, or its stage elapsed. Live Safe state stops
     * describing the decision at that point, whether or not a transaction was recovered: a veto
     * body that never vetoed leaves no transaction at all, and its threshold at the time is
     * unrecoverable rather than merely unfound.
     */
    isDecided?: boolean;
    /**
     * The executed transaction that reported this body's verdict, when the scan recovered it. It
     * carries the configuration the decision actually ran under, which the live Safe no longer does.
     */
    settledTransaction?: ISafeMultisigTransaction;
}

class SafeMultisigSettingsUtils {
    /**
     * Settings are where a body's standing configuration belongs, so the Safe's own particulars
     * (address, threshold, nonce, version) are stated here rather than repeated on the breakdown
     * beside gov-ui-kit's own approval summary.
     *
     * Once the body has reported, these become the decision's configuration rather than the Safe's:
     * a native body's Settings tab reads the sub-proposal's snapshot, and this is the same promise
     * kept for a body whose configuration is only readable live. The current owner count is used
     * only as the visible denominator because the historical owner set is not recoverable.
     */
    parseSettings = (
        params: ISafeMultisigSettingsParseParams,
    ): IDefinitionSetting[] => [
        safeSettingsUtils.addressRow(params),
        ...this.configurationRows(params),
    ];

    /**
     * The rows whose subject changes with the body's standing: while the decision is open they
     * describe the live account, and once it is over they describe the decision or omit unavailable
     * configuration.
     */
    private configurationRows = (
        params: ISafeMultisigSettingsParseParams,
    ): IDefinitionSetting[] => {
        const { isDecided = false, settledTransaction, safeInfo, t } = params;

        if (settledTransaction != null) {
            return [
                {
                    term: t(`${safeSettingsTranslationKey}.threshold`),
                    definition: t(
                        `${safeSettingsTranslationKey}.thresholdOfOwners`,
                        {
                            threshold: settledTransaction.confirmationsRequired,
                            total: safeInfo.owners.length,
                        },
                    ),
                },
                {
                    term: t(`${safeSettingsTranslationKey}.nonce`),
                    definition: settledTransaction.nonce,
                },
            ];
        }

        if (isDecided) {
            return [];
        }

        return safeSettingsUtils.liveConfigurationRows(params);
    };
}

export const safeMultisigSettingsUtils = new SafeMultisigSettingsUtils();
