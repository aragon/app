import type { IDefinitionSetting } from '@aragon/gov-ui-kit';
import type {
    ISafeInfo,
    ISafeMultisigTransaction,
} from '@/shared/api/safeService';
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
    t: TranslationFunction;
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
    ): IDefinitionSetting[] => {
        const { safeInfo, safeName, safeHref, t } = params;
        const translationKey =
            'app.plugins.safeMultisig.safeMultisigGovernanceSettings';

        return [
            {
                term: t(`${translationKey}.safe`),
                definition: safeName,
                // `isOnchainEntity` hands the row to the kit's address output, which owns the
                // reveal and copies the checksummed address rather than the shown label.
                link:
                    safeHref == null
                        ? undefined
                        : {
                              href: safeHref,
                              isExternal: true,
                              isOnchainEntity: true,
                          },
                copyValue: safeInfo.address,
                // Safe serves only the current version and a contract can be upgraded after a
                // decision executes, so this can only ever mean "now" - which is why it sits under
                // the live address rather than in a row of its own beside decided configuration.
                description: t(`${translationKey}.versionHelp`, {
                    version:
                        safeInfo.version ??
                        t(`${translationKey}.unknownVersion`),
                }),
            },
            ...this.configurationRows(params),
        ];
    };

    /**
     * The rows whose subject changes with the body's standing: while the decision is open they
     * describe the live account, and once it is over they describe the decision - or say why they
     * cannot. Four named cases, so they read as returns rather than nested conditions.
     */
    private configurationRows = (
        params: ISafeMultisigSettingsParseParams,
    ): IDefinitionSetting[] => {
        const {
            safeInfo,
            isDecided = false,
            isScanExhausted = false,
            settledTransaction,
            t,
        } = params;
        const translationKey =
            'app.plugins.safeMultisig.safeMultisigGovernanceSettings';

        // The transaction carries the configuration the decision actually ran under. A Safe binds
        // `confirmationsRequired` into each one, so the number this decision had to meet is
        // recoverable; the owner set it was drawn from is not, so the row carries no denominator.
        if (settledTransaction != null) {
            return [
                {
                    term: t(`${translationKey}.threshold`),
                    definition:
                        settledTransaction.confirmationsRequired.toString(),
                },
                {
                    // The slot this decision occupied, which is a fact about the decision.
                    term: t(`${translationKey}.nonce`),
                    definition: settledTransaction.nonce,
                },
            ];
        }

        // The number exists, past where this read looked. Silence would read as the permanent case
        // below, and the live threshold would be today's configuration wearing this decision's label.
        if (isScanExhausted) {
            return [
                {
                    term: t(`${translationKey}.threshold`),
                    definition: t(`${translationKey}.notRecovered`),
                },
            ];
        }

        // Nothing to recover: a veto body that never vetoed leaves no transaction at all.
        if (isDecided) {
            return [];
        }

        return [
            {
                term: t(`${translationKey}.threshold`),
                definition: safeInfo.threshold.toString(),
            },
            {
                // Live account state while the decision is open: it advances with every transaction
                // the Safe executes, including ones with nothing to do with Aragon, so it is said
                // as "current", never as this proposal's nonce.
                term: t(`${translationKey}.currentNonce`),
                definition: safeInfo.nonce,
            },
        ];
    };
}

export const safeMultisigSettingsUtils = new SafeMultisigSettingsUtils();
