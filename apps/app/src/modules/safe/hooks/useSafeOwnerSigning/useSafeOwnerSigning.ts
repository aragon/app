'use client';

import { addressUtils } from '@aragon/gov-ui-kit';
import type { EthSafeTransaction } from '@safe-global/protocol-kit';
import { useCallback, useRef } from 'react';
import type { Hex } from 'viem';
import { getBytecode } from 'wagmi/actions';
import { wagmiConfig } from '@/modules/application/constants/wagmi';
import type { Network } from '@/shared/api/daoService';
import {
    type ISafeMultisigTransaction,
    SafeServiceError,
} from '@/shared/api/safeService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    type SafeProtocolKit,
    SafeProtocolKitError,
    safeProtocolKitUtils,
} from '../../utils/safeProtocolKitUtils';
import { safeTransactionEnvelopeUtils } from '../../utils/safeTransactionEnvelopeUtils';
import { safeTransactionLookupUtils } from '../../utils/safeTransactionLookupUtils';
import { safeTransactionUtils } from '../../utils/safeTransactionUtils';

export interface IUseSafeOwnerSigningParams {
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Address of the Safe the owner signs for.
     */
    safeAddress: string;
}

/**
 * Signature whose submission to the Safe transaction service returned no definitive answer.
 */
export interface IUncertainSafeSignature {
    /**
     * Owner that signed the transaction.
     */
    owner: string;
    /**
     * Hash of the signed transaction.
     */
    safeTxHash: string;
    /**
     * Signature submitted to the service.
     */
    signature: string;
}

export interface ISafeOwnerAuthority {
    /**
     * Current owners of the Safe, read from the chain.
     */
    owners: string[];
    /**
     * Current threshold of the Safe, read from the chain.
     */
    threshold: number;
    /**
     * Nonce the Safe executes next, read from the chain.
     */
    currentNonce: number;
}

export interface IReadOwnerAuthorityParams {
    /**
     * Protocol kit signing as the owner.
     */
    protocolKit: SafeProtocolKit;
    /**
     * Owner to check.
     */
    owner: string;
}

export interface IAssertCanSignParams {
    /**
     * Owner about to sign.
     */
    owner: string;
    /**
     * Version of the Safe, as reported by the Safe transaction service.
     */
    safeVersion: string | null;
}

export interface IBuildSafeTransactionParams {
    /**
     * Protocol kit hashing the transaction for the Safe.
     */
    protocolKit: SafeProtocolKit;
    /**
     * Reviewed transaction to rebuild.
     */
    transaction: ISafeMultisigTransaction;
    /**
     * Hash the owner reviewed.
     */
    expectedSafeTxHash: string;
}

export interface ISignAndSubmitParams {
    /**
     * Protocol kit signing as the owner.
     */
    protocolKit: SafeProtocolKit;
    /**
     * Owner signing the transaction.
     */
    owner: string;
    /**
     * Transaction to sign, as built by `buildSafeTransaction`.
     */
    safeTransaction: EthSafeTransaction;
    /**
     * Hash of the transaction, under which an uncertain submission is reconciled.
     */
    safeTxHash: string;
    /**
     * Sends the signature to the Safe transaction service: a confirmation or a proposal.
     */
    submit: (signature: string) => Promise<unknown>;
}

export enum SafeSignatureSubmission {
    /**
     * The service holds the signature.
     */
    ACCEPTED = 'ACCEPTED',
    /**
     * The service gave no definitive answer and does not show the signature yet: the caller offers to re-check.
     */
    UNCERTAIN = 'UNCERTAIN',
}

const translationKey = 'app.safe.safeOwnerSigning';

const isSameHash = (a: string, b: string): boolean =>
    a.toLowerCase() === b.toLowerCase();

/**
 * The steps every dialog takes to have a Safe owner sign a transaction and hand the signature to the Safe transaction
 * service, each run against fresh state right before the wallet is asked for anything: the owner's authority, the
 * exact payload reviewed, the account that actually signed, and a submission that may or may not have landed.
 *
 * It holds no dialog state beyond the uncertain submission: callers keep their own state machine and translate the
 * returned outcome into it. Every error it throws carries a translated message.
 */
export const useSafeOwnerSigning = (params: IUseSafeOwnerSigningParams) => {
    const { network, safeAddress } = params;

    const { t } = useTranslations();
    const chainId = networkDefinitions[network].id;

    // A ref rather than state: nothing renders it, and error handlers read it synchronously before a re-render.
    const uncertainSignatureRef = useRef<IUncertainSafeSignature>(undefined);

    /**
     * Protocol kit signing as the owner through the connected wallet.
     */
    const getProtocolKit = useCallback(
        async (owner: string): Promise<SafeProtocolKit> => {
            try {
                return await safeProtocolKitUtils.initForOwner({
                    owner,
                    chainId,
                    safeAddress,
                });
            } catch (reason: unknown) {
                if (reason instanceof SafeProtocolKitError) {
                    throw new Error(t(`${translationKey}.${reason.reason}`), {
                        cause: reason,
                    });
                }

                throw reason;
            }
        },
        [chainId, safeAddress, t],
    );

    /**
     * Reads the owners, threshold and nonce from the chain, and refuses a wallet that is no longer an owner or a
     * threshold its owners cannot reach.
     */
    const readOwnerAuthority = useCallback(
        async (
            authorityParams: IReadOwnerAuthorityParams,
        ): Promise<ISafeOwnerAuthority> => {
            const { protocolKit, owner } = authorityParams;

            const [owners, threshold, currentNonce] = await Promise.all([
                protocolKit.getOwners(),
                protocolKit.getThreshold(),
                protocolKit.getNonce(),
            ]);

            if (
                !owners.some((safeOwner) =>
                    addressUtils.isAddressEqual(safeOwner, owner),
                )
            ) {
                throw new Error(t(`${translationKey}.notOwner`));
            }

            if (
                !safeTransactionUtils.hasValidThreshold({ threshold, owners })
            ) {
                throw new Error(t(`${translationKey}.invalidThreshold`));
            }

            return { owners, threshold, currentNonce };
        },
        [t],
    );

    /**
     * Refuses a contract wallet on a Safe older than v1.3.0, which cannot verify its signature.
     */
    const assertCanSign = useCallback(
        async (signParams: IAssertCanSignParams) => {
            const { owner, safeVersion } = signParams;

            if (safeTransactionUtils.supportsEip1271Signatures(safeVersion)) {
                return;
            }

            const ownerBytecode = await getBytecode(wagmiConfig, {
                address: owner as Hex,
                chainId,
            });

            if (ownerBytecode != null) {
                throw new Error(
                    t(`${translationKey}.unsupportedContractOwner`),
                );
            }
        },
        [chainId, t],
    );

    /**
     * Rebuilds the protocol-kit transaction from the reviewed fields and checks it hashes to the reviewed transaction:
     * signing or executing fields that hash to anything else would authorise something that was never reviewed.
     */
    const buildSafeTransaction = useCallback(
        async (
            buildParams: IBuildSafeTransactionParams,
        ): Promise<EthSafeTransaction> => {
            const { protocolKit, transaction, expectedSafeTxHash } =
                buildParams;

            const { EthSafeTransaction: SafeTransaction } = await import(
                '@safe-global/protocol-kit'
            );
            const envelope =
                safeTransactionEnvelopeUtils.getEnvelope(transaction);
            const safeTransaction = new SafeTransaction({
                ...envelope,
                nonce: Number(envelope.nonce),
            });
            const computedHash =
                await protocolKit.getTransactionHash(safeTransaction);

            if (
                !isSameHash(computedHash, expectedSafeTxHash) ||
                !isSameHash(transaction.safeTxHash, expectedSafeTxHash)
            ) {
                throw new Error(t(`${translationKey}.hashMismatch`));
            }

            return safeTransaction;
        },
        [t],
    );

    /**
     * Whether the service holds the transaction with the exact signature submitted, not any confirmation of the owner:
     * only that proves the uncertain submission landed.
     */
    const reconcile = useCallback(
        async (submitted: IUncertainSafeSignature): Promise<boolean> => {
            const transaction =
                await safeTransactionLookupUtils.findTransaction({
                    network,
                    address: safeAddress,
                    safeTxHash: submitted.safeTxHash,
                });

            return (
                transaction?.confirmations.some(
                    (confirmation) =>
                        addressUtils.isAddressEqual(
                            confirmation.owner,
                            submitted.owner,
                        ) &&
                        isSameHash(confirmation.signature, submitted.signature),
                ) === true
            );
        },
        [network, safeAddress],
    );

    /**
     * Signs the transaction as the owner and submits the signature. A refusal from the service is thrown; any other
     * failure may hide an accepted submission, so it is reconciled once and reported as uncertain when the service
     * does not show it yet.
     */
    const signAndSubmit = useCallback(
        async (
            submitParams: ISignAndSubmitParams,
        ): Promise<SafeSignatureSubmission> => {
            const { protocolKit, owner, safeTransaction, safeTxHash, submit } =
                submitParams;

            const { data: signature } =
                await protocolKit.signTypedData(safeTransaction);

            // The wallet signs with whichever account is active, so a switch during the prompt yields a signature of
            // another account, which the service would refuse or reconciliation look for under the wrong owner.
            if (
                safeProtocolKitUtils.getOwnerConnection(owner, chainId) == null
            ) {
                throw new Error(t(`${translationKey}.walletRequired`));
            }

            const submitted: IUncertainSafeSignature = {
                owner,
                safeTxHash,
                signature,
            };

            try {
                await submit(signature);
            } catch (writeError: unknown) {
                if (SafeServiceError.isDefinitiveWriteError(writeError)) {
                    throw writeError;
                }

                uncertainSignatureRef.current = submitted;

                if (await reconcile(submitted)) {
                    uncertainSignatureRef.current = undefined;
                    return SafeSignatureSubmission.ACCEPTED;
                }

                return SafeSignatureSubmission.UNCERTAIN;
            }

            return SafeSignatureSubmission.ACCEPTED;
        },
        [chainId, reconcile, t],
    );

    /**
     * Checks again whether the uncertain submission landed, and forgets it once it did.
     */
    const recheck = useCallback(async (): Promise<boolean> => {
        const submitted = uncertainSignatureRef.current;

        if (submitted == null) {
            return false;
        }

        const isAccepted = await reconcile(submitted);

        if (isAccepted) {
            uncertainSignatureRef.current = undefined;
        }

        return isAccepted;
    }, [reconcile]);

    /**
     * Whether a submission that may have landed is still unresolved. Read synchronously, so an error handler running
     * before a re-render keeps the submission re-checkable rather than reporting a plain error.
     */
    const hasUncertainSignature = useCallback(
        () => uncertainSignatureRef.current != null,
        [],
    );

    return {
        getProtocolKit,
        readOwnerAuthority,
        assertCanSign,
        buildSafeTransaction,
        signAndSubmit,
        recheck,
        hasUncertainSignature,
    };
};
