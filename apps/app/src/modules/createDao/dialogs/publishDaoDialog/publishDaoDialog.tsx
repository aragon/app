import { DaoDataListItem, invariant } from '@aragon/gov-ui-kit';
import { useCallback, useMemo } from 'react';
import type { Hex, TransactionReceipt } from 'viem';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import type { Network } from '@/shared/api/daoService';
import type { IPinResult } from '@/shared/api/ipfsService/domain';
import { usePinFile, usePinJson } from '@/shared/api/ipfsService/mutations';
import { TransactionType } from '@/shared/api/transactionService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    type IBuildTransactionDialogSuccessLinkHref,
    type ITransactionDialogActionParams,
    type ITransactionDialogStep,
    type ITransactionDialogStepMeta,
    TransactionDialog,
    type TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useStepper } from '@/shared/hooks/useStepper';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import type { ICreateDaoFormData } from '../../components/createDaoForm';
import { CreateDaoSlotId } from '../../constants/moduleSlots';
import type {
    IBuildCreateDaoPluginSettingsParams,
    ICreateDaoPluginSettings,
} from '../../types';
import { publishDaoDialogUtils } from './publishDaoDialogUtils';

export enum PublishDaoStep {
    PIN_METADATA = 'PIN_METADATA',
}

export interface IPublishDaoDialogPlugin {
    /**
     * Id of the plugin to install on the DAO.
     */
    pluginId: string;
    /**
     * Signers and approvals of the plugin to install.
     */
    settings: Omit<IBuildCreateDaoPluginSettingsParams, 'network'>;
}

export interface IPublishDaoDialogLabels {
    title: string;
    description: string;
    submit: string;
    success: string;
}

export interface IPublishDaoDialogCreatedDao {
    address: Hex;
    network: Network;
}

export interface IPublishDaoDialogParams {
    /**
     * Values of the create-dao form.
     */
    values: ICreateDaoFormData;
    /**
     * Installs this plugin instead of the Admin plugin.
     */
    plugin?: IPublishDaoDialogPlugin;
    /**
     * Replaces the success link to the DAO page; called with the deployed DAO from the success action or "Proceed anyway".
     */
    onCreated?: (dao: IPublishDaoDialogCreatedDao) => void;
    /**
     * Replaces the default copy.
     */
    labels?: IPublishDaoDialogLabels;
}

export interface IPublishDaoDialogProps
    extends IDialogComponentProps<IPublishDaoDialogParams> {}

export const PublishDaoDialog: React.FC<IPublishDaoDialogProps> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'PublishDaoDialog: required parameters must be set.',
    );

    const { address } = useWalletAccount();
    invariant(address != null, 'PublishDaoDialog: user must be connected.');

    const { values, plugin, onCreated, labels } = location.params;
    const { name, description, network, avatar, ens } = values;
    const { name: networkName } = networkDefinitions[network];

    const { t } = useTranslations();

    const stepper = useStepper<
        ITransactionDialogStepMeta,
        PublishDaoStep | TransactionDialogStep
    >({
        initialActiveStep: PublishDaoStep.PIN_METADATA,
    });

    const {
        data: pinJsonData,
        status: pinJsonStatus,
        mutate: pinJson,
    } = usePinJson({ onSuccess: stepper.nextStep });

    const { mutate: pinFile, status: pinFileStatus } = usePinFile();

    const handlePinData = useCallback(
        (params: ITransactionDialogActionParams, avatarCid?: string) => {
            const daoMetadata = publishDaoDialogUtils.prepareMetadata(
                values,
                avatarCid,
            );
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
            invariant(
                values.avatar?.file != null,
                'PublishDaoDialog: avatar.file must be defined.',
            );
            pinFile(
                { body: values.avatar.file },
                {
                    onSuccess: (fileResult) =>
                        handlePinFileSuccess(params, fileResult),
                    ...params,
                },
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
        }
        if (pinFileStatus === 'pending' || pinJsonStatus === 'pending') {
            return 'pending';
        }
        if (pinFileStatus === 'success' && pinJsonStatus === 'success') {
            return 'success';
        }

        return 'idle';
    }, [values.avatar, pinFileStatus, pinJsonStatus]);

    const buildPluginSettings = (): ICreateDaoPluginSettings[] | undefined => {
        if (plugin == null) {
            return undefined;
        }

        const buildSettings = pluginRegistryUtils.getSlotFunction<
            IBuildCreateDaoPluginSettingsParams,
            ICreateDaoPluginSettings
        >({
            slotId: CreateDaoSlotId.CREATE_DAO_BUILD_PLUGIN_SETTINGS,
            pluginId: plugin.pluginId,
        });
        invariant(
            buildSettings != null,
            `PublishDaoDialog: no plugin settings builder registered for plugin "${plugin.pluginId}".`,
        );

        return [buildSettings({ network, ...plugin.settings })];
    };

    const handlePrepareTransaction = () => {
        invariant(
            pinJsonData != null,
            'PublishDaoDialog: metadata not pinned for prepare transaction step.',
        );
        const { IpfsHash: metadataCid } = pinJsonData;

        return publishDaoDialogUtils.buildTransaction({
            values,
            metadataCid,
            connectedAddress: address,
            pluginSettings: buildPluginSettings(),
        });
    };

    const getCreatedDao = (receipt: TransactionReceipt) => {
        const address = publishDaoDialogUtils.getDaoAddress(receipt);
        invariant(
            address != null,
            'PublishDaoDialog: no DAORegistered event found in the receipt.',
        );

        return address;
    };

    const handleCreated = (receipt: TransactionReceipt) =>
        onCreated?.({ address: getCreatedDao(receipt), network });

    const getDaoLink = ({
        receipt,
    }: IBuildTransactionDialogSuccessLinkHref) => {
        const daoAddress = getCreatedDao(receipt);
        const daoEnsName = ens !== '' ? `${ens}.dao.eth` : undefined;

        return `/dao/${network}/${daoEnsName ?? daoAddress}`;
    };

    const successLabel =
        labels?.success ?? t('app.createDao.publishDaoDialog.button.success');
    const successLink =
        onCreated != null
            ? { label: successLabel, onClick: handleCreated }
            : { label: successLabel, href: getDaoLink };

    const metadataPinAction = values.avatar?.file
        ? handlePinFile
        : handlePinData;

    const customSteps: ITransactionDialogStep<PublishDaoStep>[] = useMemo(
        () => [
            {
                id: PublishDaoStep.PIN_METADATA,
                order: 0,
                meta: {
                    label: t(
                        `app.createDao.publishDaoDialog.step.${PublishDaoStep.PIN_METADATA}.label`,
                    ),
                    errorLabel: t(
                        `app.createDao.publishDaoDialog.step.${PublishDaoStep.PIN_METADATA}.errorLabel`,
                    ),
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
            analytics={{
                flow: 'create_dao',
                transactionTypeEvent: 'dao_create',
            }}
            customSteps={customSteps}
            description={
                labels?.description ??
                t('app.createDao.publishDaoDialog.description')
            }
            dialogId={location.id}
            network={network}
            onProceedAnyway={onCreated != null ? handleCreated : undefined}
            prepareTransaction={handlePrepareTransaction}
            preventCloseWhileBusy={onCreated != null}
            stepper={stepper}
            submitLabel={
                labels?.submit ??
                t('app.createDao.publishDaoDialog.button.submit')
            }
            successLink={successLink}
            title={labels?.title ?? t('app.createDao.publishDaoDialog.title')}
            transactionType={TransactionType.PLUGIN_CREATE}
        >
            <DaoDataListItem.Structure
                description={description}
                logoSrc={avatar?.url}
                name={name}
                network={networkName}
            />
        </TransactionDialog>
    );
};
