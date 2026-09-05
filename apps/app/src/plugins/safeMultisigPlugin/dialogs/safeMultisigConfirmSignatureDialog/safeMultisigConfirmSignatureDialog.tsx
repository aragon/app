'use client';

import { addressUtils, Dialog, invariant } from '@aragon/gov-ui-kit';
import type { Network } from '@/shared/api/daoService';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';

export interface ISafeMultisigConfirmSignatureDialogParams {
    /**
     * Title of the proposal the signature reports a result for.
     */
    proposalTitle: string;
    /**
     * Address of the Safe acting as the body.
     */
    safeAddress: string;
    /**
     * Owner address the signature is produced with.
     */
    signerAddress: string;
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Defines if the body vetoes rather than approves.
     */
    isVeto: boolean;
    /**
     * Nonce the signature applies to. Absent when queueing a new report, whose nonce is only
     * allocated at submit time.
     */
    nonce?: string;
    /**
     * Whether this confirmation reaches the Safe's threshold, so execution follows immediately in
     * the same flow. The owner is then asked for two wallet interactions rather than one: a free
     * signature, then a transaction that costs gas.
     */
    willExecute: boolean;
    /**
     * Called once the owner confirms.
     */
    onConfirm: () => void;
}

export interface ISafeMultisigConfirmSignatureDialogProps
    extends IDialogComponentProps<ISafeMultisigConfirmSignatureDialogParams> {}

const translationKey =
    'app.plugins.safeMultisig.safeMultisigConfirmSignatureDialog';

export const SafeMultisigConfirmSignatureDialog: React.FC<
    ISafeMultisigConfirmSignatureDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'SafeMultisigConfirmSignatureDialog: required parameters must be set.',
    );

    const {
        proposalTitle,
        safeAddress,
        signerAddress,
        network,
        isVeto,
        nonce,
        willExecute,
        onConfirm,
    } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const actionKey = isVeto ? 'veto' : 'approval';

    const handleConfirm = () => {
        close();
        onConfirm();
    };

    return (
        <>
            <Dialog.Header title={t(`${translationKey}.${actionKey}.title`)} />
            <Dialog.Content
                className="pb-4 md:pb-6"
                description={t(`${translationKey}.${actionKey}.description`)}
            >
                <dl className="flex flex-col gap-3 pt-2">
                    <SafeMultisigConfirmSignatureRow
                        label={t(`${translationKey}.details.proposal`)}
                        value={proposalTitle}
                    />
                    <SafeMultisigConfirmSignatureRow
                        label={t(`${translationKey}.details.safe`)}
                        value={addressUtils.truncateAddress(safeAddress)}
                    />
                    {nonce != null && (
                        <SafeMultisigConfirmSignatureRow
                            label={t(`${translationKey}.details.nonce`)}
                            value={nonce}
                        />
                    )}
                    <SafeMultisigConfirmSignatureRow
                        label={t(`${translationKey}.details.signingAs`)}
                        value={addressUtils.truncateAddress(signerAddress)}
                    />
                    <SafeMultisigConfirmSignatureRow
                        label={t(`${translationKey}.details.network`)}
                        value={networkDefinitions[network].name}
                    />
                </dl>
                {/* The design showed a gas-fee row here. Confirming alone is an offchain signature
                    with no fee to quote - but the confirmation that reaches the threshold is
                    followed straight away by execution, which is onchain and does cost gas. That is
                    two wallet interactions from one click, so it is said before the first one. */}
                <p className="pt-4 text-neutral-500 text-sm md:text-base">
                    {t(
                        `${translationKey}.${willExecute ? 'bundledExecution' : 'gasless'}`,
                    )}
                </p>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(`${translationKey}.${actionKey}.action`),
                    onClick: handleConfirm,
                }}
                secondaryAction={{
                    label: t(`${translationKey}.cancel`),
                    onClick: () => close(),
                }}
            />
        </>
    );
};

const SafeMultisigConfirmSignatureRow: React.FC<{
    label: string;
    value: string;
}> = (props) => {
    const { label, value } = props;

    return (
        <div className="flex flex-row items-baseline justify-between gap-4">
            <dt className="text-neutral-500 text-sm md:text-base">{label}</dt>
            <dd className="truncate text-neutral-800 text-sm md:text-base">
                {value}
            </dd>
        </div>
    );
};
