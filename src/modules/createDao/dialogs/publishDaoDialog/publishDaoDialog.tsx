import type { IPinResult } from '@/shared/api/ipfsService/domain';
import { usePinFile, usePinJson } from '@/shared/api/ipfsService/mutations';
import { useBlockNavigationContext } from '@/shared/components/blockNavigationContext';
import { useDebugContext } from '@/shared/components/debugProvider';
import { type IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogActionParams,
    type ITransactionDialogStep,
    type ITransactionDialogStepMeta,
    TransactionDialog,
    type TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useStepper } from '@/shared/hooks/useStepper';
import { DaoDataListItem, invariant } from '@aragon/gov-ui-kit';
import { useCallback, useMemo } from 'react';
import type { Hex, TransactionReceipt } from 'viem';
import { useAccount } from 'wagmi';
import type { ICreateDaoFormData } from '../../components/createDaoForm';
import { publishDaoDialogUtils } from './publishDaoDialogUtils';

export enum PublishDaoStep {
    PIN_METADATA = 'PIN_METADATA',
}

export interface IPublishDaoDialogParams {
    /**
     * Values of the create-dao form.
     */
    values: ICreateDaoFormData;
}

export interface IPublishDaoDialogProps extends IDialogComponentProps<IPublishDaoDialogParams> {}

export const PublishDaoDialog: React.FC<IPublishDaoDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'PublishDaoDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'PublishDaoDialog: user must be connected.');

    const { values } = location.params;
    const { name, description, network, avatar } = values;
    const { name: networkName } = networkDefinitions[network];

    const { t } = useTranslations();
    const { setIsBlocked } = useBlockNavigationContext();
    const { values: debugValues } = useDebugContext();

    const stepper = useStepper<ITransactionDialogStepMeta, PublishDaoStep | TransactionDialogStep>({
        initialActiveStep: PublishDaoStep.PIN_METADATA,
    });

    const { data: pinJsonData, status: pinJsonStatus, mutate: pinJson } = usePinJson({ onSuccess: stepper.nextStep });

    const { mutate: pinFile, status: pinFileStatus } = usePinFile();

    const handlePinData = useCallback(
        (params: ITransactionDialogActionParams, avatarCid?: string) => {
            const daoMetadata = publishDaoDialogUtils.prepareMetadata(values, avatarCid);
            pinJson({ body: daoMetadata }, params);
        },
        [pinJson, values],
    );

    const handlePinFileSuccess = useCallback(
        (params: ITransactionDialogActionParams, fileResult: IPinResult) => {
            const avatarCid = fileResult.IpfsHash;
            handlePinData(params, avatarCid);
        },
        [handlePinData],
    );

    const handlePinFile = useCallback(
        (params: ITransactionDialogActionParams) => {
            invariant(values.avatar?.file != null, 'PublishDaoDialog: avatar.file must be defined.');
            pinFile(
                { body: values.avatar.file },
                { onSuccess: (fileResult) => handlePinFileSuccess(params, fileResult), ...params },
            );
        },
        [pinFile, values, handlePinFileSuccess],
    );

    const pinningStatus = useMemo(() => {
        if (!values.avatar?.file) {
            return pinJsonStatus;
        }

        if (pinFileStatus === 'error' || pinJsonStatus === 'error') {
            return 'error';
        } else if (pinFileStatus === 'pending' || pinJsonStatus === 'pending') {
            return 'pending';
        } else if (pinFileStatus === 'success' && pinJsonStatus === 'success') {
            return 'success';
        }

        return 'idle';
    }, [values.avatar, pinFileStatus, pinJsonStatus]);

    const handlePrepareTransaction = () => {
        invariant(pinJsonData != null, 'PublishDaoDialog: metadata not pinned for prepare transaction step.');
        const { IpfsHash: metadataCid } = pinJsonData;

        return publishDaoDialogUtils.buildTransaction({
            values: values,
            metadataCid,
            connectedAddress: address,
            daoFactoryAddress: debugValues.daoFactoryAddress as Hex | undefined,
        });
    };

    const getDaoLink = (txReceipt: TransactionReceipt) => {
        setIsBlocked(false);

        const daoAddress = publishDaoDialogUtils.getDaoAddress(txReceipt)!;
        const daoId = `${network}-${daoAddress}`;

        return `/dao/${daoId}`;
    };

    const metadataPinAction = values.avatar?.file ? handlePinFile : handlePinData;

    const customSteps: Array<ITransactionDialogStep<PublishDaoStep>> = useMemo(
        () => [
            {
                id: PublishDaoStep.PIN_METADATA,
                order: 0,
                meta: {
                    label: t(`app.createDao.publishDaoDialog.step.${PublishDaoStep.PIN_METADATA}.label`),
                    errorLabel: t(`app.createDao.publishDaoDialog.step.${PublishDaoStep.PIN_METADATA}.errorLabel`),
                    state: pinningStatus,
                    action: metadataPinAction,
                    auto: true,
                },
            },
        ],
        [t, metadataPinAction, pinningStatus],
    );

    return (
        <TransactionDialog<PublishDaoStep>
            title={t('app.createDao.publishDaoDialog.title')}
            description={t('app.createDao.publishDaoDialog.description')}
            submitLabel={t('app.createDao.publishDaoDialog.button.submit')}
            successLink={{ label: t('app.createDao.publishDaoDialog.button.success'), href: getDaoLink }}
            stepper={stepper}
            customSteps={customSteps}
            prepareTransaction={handlePrepareTransaction}
            network={network}
        >
            <DaoDataListItem.Structure
                name={name}
                logoSrc={avatar?.url}
                description={description}
                network={networkName}
            />
        </TransactionDialog>
    );
};
