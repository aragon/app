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
        const {
            safeInfo,
            safeName,
            safeHref,
            isDecided = false,
            settledTransaction,
            t,
        } = params;
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
            // Three cases, and the third is the one worth naming: a body whose say is over but
            // whose numbers were never recovered - a report beyond the scan's page bound, or a veto
            // that never fired - states nothing here rather than reprinting the live account, which
            // would be today's configuration wearing this decision's label.
            ...(settledTransaction != null
                ? [
                      {
                          // A Safe binds `confirmationsRequired` into each transaction, so the
                          // number this decision had to meet is recoverable. The owner set it was
                          // drawn from is not, so the row carries no denominator.
                          term: t(`${translationKey}.threshold`),
                          definition:
                              settledTransaction.confirmationsRequired.toString(),
                      },
                      {
                          // The slot this decision occupied, which is a fact about the decision.
                          term: t(`${translationKey}.nonce`),
                          definition: settledTransaction.nonce,
                      },
                  ]
                : isDecided
                  ? []
                  : [
                        {
                            term: t(`${translationKey}.threshold`),
                            definition: safeInfo.threshold.toString(),
                        },
                        {
                            // Live account state while the decision is open: it advances with every
                            // transaction the Safe executes, including ones with nothing to do with
                            // Aragon, so it is said as "current", never as this proposal's nonce.
                            term: t(`${translationKey}.currentNonce`),
                            definition: safeInfo.nonce,
                        },
                        {
                            // Safe serves only the current version and a contract can be upgraded
                            // after a decision executes, so this row can only ever mean "now".
                            term: t(`${translationKey}.version`),
                            definition:
                                safeInfo.version ??
                                t(`${translationKey}.unknownVersion`),
                        },
                    ]),
            {
                term: t(`${translationKey}.execution`),
                definition: t(`${translationKey}.executionValue`),
            },
        ];
    };
}

export const safeMultisigSettingsUtils = new SafeMultisigSettingsUtils();
