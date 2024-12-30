import { useDao } from '@/shared/api/daoService';
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
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useStepper } from '@/shared/hooks/useStepper';
import { invariant } from '@aragon/gov-ui-kit';
import { useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';
import type { ICreateProcessFormData } from '../../components/createProcessForm';
import type { IPluginSetupData } from '../prepareProcessDialog/prepareProcessDialogUtils';
import { publishProcessDialogUtils } from './publishProcessDialogUtils';

export enum PublishProcessStep {
    PIN_METADATA = 'PIN_METADATA',
}

export interface IPublishProcessDialogParams {
    /**
     * Values of the create-process form.
     */
    values: ICreateProcessFormData;
    /**
     * ID of the DAO to create the process for.
     */
    daoId: string;
    /**
     * IDs of the plugins already prepared.
     */
    setupData: IPluginSetupData[];
}

export interface IPublishProcessDialogProps extends IDialogComponentProps<IPublishProcessDialogParams> {}

export const PublishProcessDialog: React.FC<IPublishProcessDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'PublishProcessDialog: required parameters must be set.');
    const { daoId, values, setupData } = location.params;

    const { address } = useAccount();
    invariant(address != null, 'PublishProcessDialog: user must be connected.');

    const { t } = useTranslations();

    const { setIsBlocked } = useBlockNavigationContext();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const [adminPlugin] = useDaoPlugins({ daoId, subdomain: 'admin' }) ?? [];

    const stepper = useStepper<ITransactionDialogStepMeta, PublishProcessStep | TransactionDialogStep>({
        initialActiveStep: PublishProcessStep.PIN_METADATA,
    });

    const { data: pinJsonData, status, mutate: pinJson } = usePinJson({ onSuccess: stepper.nextStep });

    const handlePrepareTransaction = async () => {
        invariant(pinJsonData != null, 'PublishProposalDialog: metadata not pinned for prepare transaction step.');
        invariant(dao != null, 'PrepareProcessDialog: DAO cannot be fetched');

        const { IpfsHash: metadataCid } = pinJsonData;

        const transaction = await publishProcessDialogUtils.buildTransaction({
            values,
            setupData,
            dao,
            plugin: adminPlugin.meta,
            metadataCid,
        });

        setIsBlocked(false);

        return transaction;
    };

    const handlePinJson = useCallback(
        (params: ITransactionDialogActionParams) => {
            const proposalMetadata = publishProcessDialogUtils.prepareProposalMetadata();
            pinJson({ body: proposalMetadata }, params);
        },
        [pinJson],
    );

    const pinMetadataNamespace = `app.governance.publishProposalDialog.step.${PublishProcessStep.PIN_METADATA}`;
    const customSteps: Array<ITransactionDialogStep<PublishProcessStep>> = useMemo(
        () => [
            {
                id: PublishProcessStep.PIN_METADATA,
                order: 0,
                meta: {
                    label: t(`${pinMetadataNamespace}.label`),
                    errorLabel: t(`${pinMetadataNamespace}.errorLabel`),
                    state: status,
                    action: handlePinJson,
                    auto: true,
                },
            },
        ],
        [status, handlePinJson, pinMetadataNamespace, t],
    );

    return (
        <TransactionDialog<PublishProcessStep>
            title={t('app.createDao.publishProcessDialog.title')}
            description={t('app.createDao.publishProcessDialog.description')}
            submitLabel={t('app.createDao.publishProcessDialog.button.submit')}
            successLink={{
                label: t('app.createDao.publishProcessDialog.button.success'),
                href: `/dao/${daoId}/proposals`,
            }}
            stepper={stepper}
            customSteps={customSteps}
            prepareTransaction={handlePrepareTransaction}
        />
    );
};
