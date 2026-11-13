'use client';

import { AddressOutput, DefinitionList, invariant } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { TransactionReceipt } from 'viem';
import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useStepper } from '@/shared/hooks/useStepper';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { safeDeploymentUtils } from '../../utils/safeDeploymentUtils';

export interface ISafeDeployedSafe {
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Address of the deployed Safe.
     */
    address: string;
    /**
     * Name the user gave to the Safe.
     */
    name?: string;
}

export interface ISafeDeployTransactionDialogParams {
    /**
     * Network to deploy the Safe on.
     */
    network: Network;
    /**
     * Name the user gave to the Safe.
     */
    name?: string;
    /**
     * Addresses of the Safe owners.
     */
    owners: string[];
    /**
     * Number of owner approvals a Safe transaction needs.
     */
    threshold: number;
    /**
     * Callback called with the deployed Safe once the transaction is confirmed.
     */
    onCreated: (safe: ISafeDeployedSafe) => void;
}

export interface ISafeDeployTransactionDialogProps
    extends IDialogComponentProps<ISafeDeployTransactionDialogParams> {}

export const SafeDeployTransactionDialog: React.FC<
    ISafeDeployTransactionDialogProps
> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'SafeDeployTransactionDialog: required parameters must be set.',
    );
    const { network, name, owners, threshold, onCreated } = location.params;

    const { t } = useTranslations();

    // The same owners, approvals and salt always give the same address, so every opening gets its own salt.
    const [saltNonce] = useState(() => Date.now().toString());
    const [predictedAddress, setPredictedAddress] = useState<string>();

    const stepper = useStepper<
        ITransactionDialogStepMeta,
        TransactionDialogStep
    >({
        initialActiveStep: TransactionDialogStep.PREPARE,
    });

    const handlePrepareTransaction = async () => {
        const { address, transaction } =
            await safeDeploymentUtils.buildDeployment({
                network,
                owners,
                threshold,
                saltNonce,
            });
        setPredictedAddress(address);

        return transaction;
    };

    const handleSuccess = async (receipt: TransactionReceipt) => {
        try {
            const address = await safeDeploymentUtils.getSafeAddress(receipt);
            onCreated({ network, address, name });
        } catch (error) {
            monitoringUtils.logError(error, {
                context: { network, hash: receipt.transactionHash },
            });
        }
    };

    const translationKey = 'app.safe.safeDeployTransactionDialog';

    return (
        <TransactionDialog
            description={t(`${translationKey}.description`)}
            network={network}
            onSuccess={handleSuccess}
            prepareTransaction={handlePrepareTransaction}
            stepper={stepper}
            submitLabel={t(`${translationKey}.submit`)}
            successLink={{ label: t(`${translationKey}.success`) }}
            title={t(`${translationKey}.title`)}
        >
            <DefinitionList.Container>
                {name != null && (
                    <DefinitionList.Item
                        term={t(`${translationKey}.summary.name`)}
                    >
                        {name}
                    </DefinitionList.Item>
                )}
                <DefinitionList.Item
                    term={t(`${translationKey}.summary.network`)}
                >
                    {networkDefinitions[network].name}
                </DefinitionList.Item>
                <DefinitionList.Item
                    term={t(`${translationKey}.summary.approvals`)}
                >
                    {t(`${translationKey}.summary.approvalsValue`, {
                        threshold,
                        owners: owners.length,
                    })}
                </DefinitionList.Item>
                {predictedAddress != null && (
                    <DefinitionList.Item
                        term={t(`${translationKey}.summary.address`)}
                    >
                        <AddressOutput address={predictedAddress} />
                    </DefinitionList.Item>
                )}
            </DefinitionList.Container>
        </TransactionDialog>
    );
};
