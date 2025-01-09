import { usePinJson } from '@/shared/api/ipfsService/mutations';
import { useBlockNavigationContext } from '@/shared/components/blockNavigationContext';
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
import type { TransactionReceipt } from 'viem';
import { useAccount } from 'wagmi';
import type { ICreateDaoFormData } from '../../components/createDaoForm';
import { publishDaoDialogUtils } from './publishDaoDialogUtils';
import { usePinFile } from '@/shared/api/ipfsService/mutations/usePinFile';

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
    const { name, description, network } = values;
    const { name: networkName } = networkDefinitions[network];

    const { t } = useTranslations();
    const { setIsBlocked } = useBlockNavigationContext();

    const stepper = useStepper<ITransactionDialogStepMeta, PublishDaoStep | TransactionDialogStep>({
        initialActiveStep: PublishDaoStep.PIN_METADATA,
    });

    const { data: pinJsonData, status, mutate: pinJson } = usePinJson({ onSuccess: stepper.nextStep });

    const { mutate: pinFile } = usePinFile();

    const handlePinData = useCallback(
        (params: ITransactionDialogActionParams, logoCid?: string) => {
            const daoMetadata = publishDaoDialogUtils.prepareMetadata(values, logoCid);
            pinJson({ body: daoMetadata }, params);
        },
        [pinJson, values],
    );

    const handlePinFile = useCallback(
        (params: ITransactionDialogActionParams) => {
            invariant(values.logo !== undefined && typeof values.logo !== 'string', 'Logo must be a file.');
            pinFile(
                { body: values.logo },
                {
                    onSuccess: (fileResult) => {
                        const logoCid = fileResult.IpfsHash;
                        handlePinData(params, logoCid);
                    },
                    ...params,
                },
            );
        },
        [pinFile, handlePinData, values],
    );

    const handlePrepareTransaction = () => {
        invariant(pinJsonData != null, 'PublishDaoDialog: metadata not pinned for prepare transaction step.');
        const { IpfsHash: metadataCid } = pinJsonData;

        return publishDaoDialogUtils.buildTransaction({ values: values, metadataCid, connectedAddress: address });
    };

    const getDaoLink = (txReceipt: TransactionReceipt) => {
        setIsBlocked(false);

        const daoAddress = publishDaoDialogUtils.getDaoAddress(txReceipt)!;
        const daoId = `${network}-${daoAddress}`;

        return `/dao/${daoId}`;
    };

    const metadataPinAction = values.logo ? handlePinFile : handlePinData;

    const customSteps: Array<ITransactionDialogStep<PublishDaoStep>> = useMemo(
        () => [
            {
                id: PublishDaoStep.PIN_METADATA,
                order: 0,
                meta: {
                    label: t(`app.createDao.publishDaoDialog.step.${PublishDaoStep.PIN_METADATA}.label`),
                    errorLabel: t(`app.createDao.publishDaoDialog.step.${PublishDaoStep.PIN_METADATA}.errorLabel`),
                    state: status,
                    action: metadataPinAction,
                    auto: true,
                },
            },
        ],
        [t, status, metadataPinAction],
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
            <DaoDataListItem.Structure name={name} description={description} network={networkName} />
        </TransactionDialog>
    );
};
