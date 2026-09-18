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
    /**
     * Whether the scan ran out of pages rather than out of history. "Not recovered yet" and "there
     * is nothing to recover" are different claims about a decided body, and only the first should
     * read as incomplete.
     */
    isScanExhausted?: boolean;
}

class SafeMultisigSettingsUtils {
    /**
     * Settings are where a body's standing configuration belongs, so the Safe's own particulars
     * (address, threshold, nonce, version) are stated here rather than repeated on the breakdown
     * beside gov-ui-kit's own approval summary.
     *
     * Once the body has reported, these become the decision's configuration rather than the Safe's:
     * a native body's Settings tab reads the sub-proposal's snapshot, and this is the same promise
     * kept for a body whose configuration is only readable live. Anything the transaction does not
     * carry - the owner set, the contract version - is omitted rather than backfilled from today's
     * Safe, which is a different subject wearing the same label.
     */
    parseSettings = (
        params: ISafeMultisigSettingsParseParams,
    ): IDefinitionSetting[] => [
        safeSettingsUtils.addressRow(params),
        ...this.configurationRows(params),
    ];

    /**
     * The rows whose subject changes with the body's standing: while the decision is open they
     * describe the live account, and once it is over they describe the decision - or say why they
     * cannot. Four named cases, so they read as returns rather than nested conditions.
     */
    private configurationRows = (
        params: ISafeMultisigSettingsParseParams,
    ): IDefinitionSetting[] => {
        const {
            isDecided = false,
            isScanExhausted = false,
            settledTransaction,
            t,
        } = params;

        // The transaction carries the configuration the decision actually ran under. A Safe binds
        // `confirmationsRequired` into each one, so the number this decision had to meet is
        // recoverable; the owner set it was drawn from is not, so the row carries no denominator.
        if (settledTransaction != null) {
            return [
                {
                    term: t(`${safeSettingsTranslationKey}.threshold`),
                    definition:
                        settledTransaction.confirmationsRequired.toString(),
                },
                {
                    // The slot this decision occupied, which is a fact about the decision.
                    term: t(`${safeSettingsTranslationKey}.nonce`),
                    definition: settledTransaction.nonce,
                },
            ];
        }

        // The number exists, past where this read looked. Silence would read as the permanent case
        // below, and the live threshold would be today's configuration wearing this decision's label.
        if (isScanExhausted) {
            return [
                {
                    term: t(`${safeSettingsTranslationKey}.threshold`),
                    definition: t(`${safeSettingsTranslationKey}.notRecovered`),
                },
            ];
        }

        // Nothing to recover: a veto body that never vetoed leaves no transaction at all.
        if (isDecided) {
            return [];
        }

        return safeSettingsUtils.liveConfigurationRows(params);
    };
}

export const safeMultisigSettingsUtils = new SafeMultisigSettingsUtils();
