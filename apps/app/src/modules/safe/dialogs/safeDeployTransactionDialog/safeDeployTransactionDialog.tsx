'use client';

import {
    DaoDataListItem,
    type IInputFileAvatarValue,
    invariant,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { TransactionReceipt } from 'viem';
import safeWallet from '@/assets/images/safeWallet.png';
import type { Network } from '@/shared/api/daoService';
import { usePinFile } from '@/shared/api/ipfsService/mutations';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useStepper } from '@/shared/hooks/useStepper';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { safeDeploymentUtils } from '../../utils/safeDeploymentUtils';

export interface ISafeDeployedSafe {
    network: Network;
    address: string;
    avatarUri?: string;
}

export interface ISafeDeployTransactionDialogParams {
    /**
     * Network to deploy the Safe on.
     */
    network: Network;
    /**
     * Name the user gave to the Safe.
     */
    name: string;
    description?: string;
    avatar?: IInputFileAvatarValue;
    /**
     * Addresses of the Safe owners.
     */
    owners: string[];
    /**
     * Number of owner approvals a Safe transaction needs.
     */
    threshold: number;
    /**
     * Called when the user finishes the confirmed deployment.
     */
    onCreated: (safe: ISafeDeployedSafe) => void;
}

export interface ISafeDeployTransactionDialogProps
    extends IDialogComponentProps<ISafeDeployTransactionDialogParams> {}

type SafeAddressRead =
    | { status: 'pending' | 'error'; receipt: TransactionReceipt }
    | { status: 'success'; receipt: TransactionReceipt; address: string };

export const SafeDeployTransactionDialog: React.FC<
    ISafeDeployTransactionDialogProps
> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'SafeDeployTransactionDialog: required parameters must be set.',
    );
    const { network, name, description, avatar, owners, threshold, onCreated } =
        location.params;

    const { t } = useTranslations();
    const translationKey = 'app.safe.safeDeployTransactionDialog';

    // A new salt keeps two deployments with the same signers from sharing one address.
    const [saltNonce] = useState(() => {
        const random = crypto.getRandomValues(new Uint32Array(1))[0];
        return ((BigInt(Date.now()) << BigInt(32)) | BigInt(random)).toString();
    });
    const [predictedAddress, setPredictedAddress] = useState<string>();
    const [avatarUri, setAvatarUri] = useState<string>();
    const [addressRead, setAddressRead] = useState<SafeAddressRead>();
    const { mutateAsync: pinFile } = usePinFile();

    const stepper = useStepper<
        ITransactionDialogStepMeta,
        TransactionDialogStep
    >({
        initialActiveStep: TransactionDialogStep.PREPARE,
    });

    const handlePrepareTransaction = async () => {
        if (avatar?.file != null && avatarUri == null) {
            const { IpfsHash } = await pinFile({ body: avatar.file });
            setAvatarUri(ipfsUtils.cidToUri(IpfsHash));
        }
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

    const handleReadAddress = async (receipt: TransactionReceipt) => {
        setAddressRead({ status: 'pending', receipt });
        try {
            const address = await safeDeploymentUtils.getSafeAddress(receipt);
            setAddressRead({ status: 'success', receipt, address });
        } catch (error) {
            monitoringUtils.logError(error, {
                context: { network, hash: receipt.transactionHash },
            });
            setAddressRead({ status: 'error', receipt });
        }
    };

    const steps = stepper.steps.map((step) =>
        step.id === TransactionDialogStep.CONFIRM &&
        step.meta.state === 'success'
            ? {
                  ...step,
                  meta: {
                      ...step.meta,
                      state: addressRead?.status ?? 'pending',
                      errorLabel:
                          addressRead?.status === 'error'
                              ? t(`${translationKey}.addressError`)
                              : step.meta.errorLabel,
                      action:
                          addressRead?.status === 'error'
                              ? () =>
                                    void handleReadAddress(addressRead.receipt)
                              : undefined,
                  },
              }
            : step,
    );

    const handleCreated = (receipt: TransactionReceipt) => {
        invariant(
            addressRead?.status === 'success' &&
                addressRead.receipt.transactionHash === receipt.transactionHash,
            'SafeDeployTransactionDialog: the receipt has no deployed Safe.',
        );
        onCreated({
            network,
            address: addressRead.address,
            ...(avatarUri && { avatarUri }),
        });
    };

    return (
        <TransactionDialog
            description={t(`${translationKey}.description`)}
            dialogId={location.id}
            network={network}
            onSuccess={handleReadAddress}
            prepareTransaction={handlePrepareTransaction}
            preventCloseWhileBusy={true}
            stepper={{ ...stepper, steps }}
            submitLabel={t(`${translationKey}.submit`)}
            successLink={{
                label: t(`${translationKey}.success`),
                onClick: handleCreated,
            }}
            title={t(`${translationKey}.title`)}
        >
            <DaoDataListItem.Structure
                address={predictedAddress}
                description={description}
                logoSrc={avatar?.url ?? safeWallet.src}
                name={name}
                network={networkDefinitions[network].name}
            />
        </TransactionDialog>
    );
};
