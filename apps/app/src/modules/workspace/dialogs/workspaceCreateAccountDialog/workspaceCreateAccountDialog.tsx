'use client';

import {
    Heading,
    InputText,
    invariant,
    RadioCard,
    RadioGroup,
    TextArea,
} from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import { useWatch } from 'react-hook-form';
import type { Hex } from 'viem';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { safeShortNameFromNetwork } from '@/modules/application/utils/proxySafeUtils/safeTxServiceNetworks';
import { CreateDaoDialogId } from '@/modules/createDao/constants/createDaoDialogId';
import type { IPublishDaoDialogParams } from '@/modules/createDao/dialogs/publishDaoDialog';
import { SafeDialogId } from '@/modules/safe/constants/safeDialogId';
import type { ISafeDeployTransactionDialogParams } from '@/modules/safe/dialogs/safeDeployTransactionDialog';
import { multisigPlugin } from '@/plugins/multisigPlugin/constants/multisigPlugin';
import { Network } from '@/shared/api/daoService';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { AvatarInput } from '@/shared/components/forms/avatarInput';
import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import {
    type TranslationFunction,
    useTranslations,
} from '@/shared/components/translationsProvider';
import type { IWizardStepperStep } from '@/shared/components/wizards/wizard';
import { WizardDialog } from '@/shared/components/wizards/wizardDialog';
import { useFormField } from '@/shared/hooks/useFormField';
import {
    type IWorkspaceAccount,
    type IWorkspaceAccountMetadata,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import {
    type IWorkspaceNetworkAddress,
    workspaceUtils,
} from '../../utils/workspaceUtils';
import {
    type IWorkspaceCreateAccountForm,
    WorkspaceCreateAccountType,
    workspaceCreateAccountDialogSteps,
} from './workspaceCreateAccountDialogDefinitions';
import { WorkspaceCreateAccountDialogNetwork } from './workspaceCreateAccountDialogNetwork';
import { WorkspaceCreateAccountDialogSigners } from './workspaceCreateAccountDialogSigners';

export interface IWorkspaceCreateAccountDialogParams {
    /**
     * Called with the deployed account, after the dialog closes.
     */
    onCreated: (account: IWorkspaceAccount) => void;
}

export interface IWorkspaceCreateAccountDialogProps
    extends IDialogComponentProps<IWorkspaceCreateAccountDialogParams> {}

const i18nBase = 'app.workspace.workspaceCreateAccountDialog';

const nameMaxLength = 128;
const descriptionMaxLength = 480;

const resolveAccountType = (
    network: Network,
    chosen: WorkspaceCreateAccountType,
): WorkspaceCreateAccountType =>
    chosen === WorkspaceCreateAccountType.SAFE &&
    safeShortNameFromNetwork(network) == null
        ? WorkspaceCreateAccountType.ARAGON
        : chosen;

// Rendered inside its step only, so its rules validate on that step alone.
const WorkspaceCreateAccountDialogDetails: React.FC = () => {
    const { t } = useTranslations();

    const nameField = useFormField<IWorkspaceCreateAccountForm, 'name'>(
        'name',
        {
            label: t(`${i18nBase}.details.name.label`),
            rules: {
                required: `${i18nBase}.details.name.required`,
                maxLength: nameMaxLength,
            },
        },
    );
    const descriptionField = useFormField<
        IWorkspaceCreateAccountForm,
        'description'
    >('description', {
        label: t(`${i18nBase}.details.description.label`),
        rules: { maxLength: descriptionMaxLength },
        sanitizeMode: 'multiline',
    });

    return (
        <div className="flex flex-col gap-10">
            <InputText maxLength={nameMaxLength} {...nameField} />
            <AvatarInput name="avatar" />
            <TextArea
                helpText={t(`${i18nBase}.details.description.helpText`)}
                isOptional={true}
                maxLength={descriptionMaxLength}
                {...descriptionField}
            />
            <ResourcesInput
                helpText={t(`${i18nBase}.details.resources.helpText`)}
                name="resources"
            />
        </div>
    );
};

const WorkspaceCreateAccountDialogSteps: React.FC = () => {
    const { t } = useTranslations();
    const network = useWatch<IWorkspaceCreateAccountForm, 'network'>({
        name: 'network',
    });
    const safeAvailable =
        resolveAccountType(network, WorkspaceCreateAccountType.SAFE) ===
        WorkspaceCreateAccountType.SAFE;

    const { onChange: onAccountTypeChange, ...accountTypeField } = useFormField<
        IWorkspaceCreateAccountForm,
        'accountType'
    >('accountType');

    const [networkStep, detailsStep, signersStep, typeStep] =
        workspaceCreateAccountDialogSteps;

    const renderStep = (step: IWizardStepperStep, children: ReactNode) => (
        <WizardDialog.Step className="flex-col" {...step}>
            <div className="flex flex-col gap-2 pb-6">
                <Heading size="h3">
                    {t(`${i18nBase}.steps.${step.id}.title`)}
                </Heading>
                <p
                    // biome-ignore lint/plugin/noPrimitiveTypography: added on main after the migration; no role assigned yet
                    className="text-base leading-normal text-surface-secondary"
                >
                    {t(`${i18nBase}.steps.${step.id}.description`)}
                </p>
            </div>
            {children}
        </WizardDialog.Step>
    );

    return (
        <>
            {renderStep(networkStep, <WorkspaceCreateAccountDialogNetwork />)}
            {renderStep(detailsStep, <WorkspaceCreateAccountDialogDetails />)}
            {renderStep(signersStep, <WorkspaceCreateAccountDialogSigners />)}
            {renderStep(
                typeStep,
                <RadioGroup
                    onValueChange={onAccountTypeChange}
                    {...accountTypeField}
                    value={resolveAccountType(network, accountTypeField.value)}
                >
                    {[
                        WorkspaceCreateAccountType.SAFE,
                        WorkspaceCreateAccountType.ARAGON,
                    ].map((type) => (
                        <RadioCard
                            description={t(
                                `${i18nBase}.accountType.${type}.description`,
                            )}
                            disabled={
                                type === WorkspaceCreateAccountType.SAFE &&
                                !safeAvailable
                            }
                            key={type}
                            label={t(`${i18nBase}.accountType.${type}.label`)}
                            tag={
                                type === WorkspaceCreateAccountType.SAFE &&
                                !safeAvailable
                                    ? {
                                          label: t(
                                              `${i18nBase}.accountType.SAFE.unsupported`,
                                          ),
                                          variant: 'info',
                                      }
                                    : undefined
                            }
                            value={type}
                        />
                    ))}
                </RadioGroup>,
            )}
        </>
    );
};

const workspaceAccountTypes: Record<
    WorkspaceCreateAccountType,
    WorkspaceAccountType
> = {
    [WorkspaceCreateAccountType.SAFE]: WorkspaceAccountType.SAFE,
    [WorkspaceCreateAccountType.ARAGON]: WorkspaceAccountType.DAO,
};

export interface ICreatedAccountDeployment extends IWorkspaceNetworkAddress {
    /**
     * IPFS URI of the logo pinned during the deployment.
     */
    avatarUri?: string;
}

export type CreatedAccountDetails = Pick<
    IWorkspaceCreateAccountForm,
    'name' | 'description' | 'resources'
>;

/**
 * Maps an account deployed as the given account type to its workspace account.
 * @param details - Form details kept as the account metadata, for account types with no metadata of their own.
 */
export const buildCreatedAccount = (
    accountType: WorkspaceCreateAccountType,
    deployed: ICreatedAccountDeployment,
    details?: CreatedAccountDetails,
): IWorkspaceAccount => {
    const { address, network, avatarUri } = deployed;
    const account: IWorkspaceAccount = {
        id: workspaceUtils.buildAccountId({ address, network }),
        type: workspaceAccountTypes[accountType],
        address,
        network,
    };

    if (details == null) {
        return account;
    }

    const { name, description, resources } = details;
    const links = resources.map((link) => ({
        ...link,
        url: workspaceUtils.ensureUrlProtocol(link.url),
    }));
    const metadata: IWorkspaceAccountMetadata = {
        name,
        ...(description && { description }),
        ...(links.length > 0 && { links }),
        ...(avatarUri && { avatar: avatarUri }),
    };

    return { ...account, metadata };
};

export interface IBuildCreateAccountRequestOptions {
    /**
     * Called with the deployed account.
     */
    onCreated: (account: IWorkspaceAccount) => void;
    /**
     * Translates the labels of the deploy dialog.
     */
    t: TranslationFunction;
}

export type ICreateAccountRequest =
    | {
          dialogId: CreateDaoDialogId.PUBLISH_DAO;
          params: IPublishDaoDialogParams;
      }
    | {
          dialogId: SafeDialogId.DEPLOY_TRANSACTION;
          params: ISafeDeployTransactionDialogParams;
      };

/**
 * Maps the account form to the deploy dialog of the selected account type.
 */
export const buildCreateAccountRequest = (
    form: IWorkspaceCreateAccountForm,
    options: IBuildCreateAccountRequestOptions,
): ICreateAccountRequest => {
    const { network, name, description, avatar, resources } = form;
    const accountType = resolveAccountType(network, form.accountType);
    const { onCreated, t } = options;
    if (accountType === WorkspaceCreateAccountType.SAFE) {
        return {
            dialogId: SafeDialogId.DEPLOY_TRANSACTION,
            params: {
                network,
                name,
                description,
                avatar,
                owners: form.members.map(({ address }) => address),
                threshold: form.threshold,
                onCreated: (deployed) =>
                    onCreated(
                        buildCreatedAccount(accountType, deployed, {
                            name,
                            description,
                            resources,
                        }),
                    ),
            },
        };
    }

    return {
        dialogId: CreateDaoDialogId.PUBLISH_DAO,
        params: {
            values: { network, name, description, avatar, resources, ens: '' },
            plugin: {
                pluginId: multisigPlugin.id,
                settings: {
                    signers: form.members.map(
                        (member) => member.address as Hex,
                    ),
                    minApprovals: form.threshold,
                },
            },
            labels: {
                title: t(`${i18nBase}.deploy.title`),
                description: t(`${i18nBase}.deploy.description`),
                submit: t(`${i18nBase}.deploy.submit`),
                success: t(`${i18nBase}.deploy.success`),
            },
            onCreated: (deployed) =>
                onCreated(buildCreatedAccount(accountType, deployed)),
        },
    };
};

export const WorkspaceCreateAccountDialog: React.FC<
    IWorkspaceCreateAccountDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'WorkspaceCreateAccountDialog: required parameters must be set.',
    );
    const { onCreated } = location.params;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();
    const { address } = useWalletAccount();

    const defaultValues: Partial<IWorkspaceCreateAccountForm> = {
        // The DAO wizard's default chain.
        network: Network.ETHEREUM_SEPOLIA,
        name: '',
        description: '',
        resources: [],
        members: [{ address: address ?? '' }],
        threshold: 1,
        accountType: WorkspaceCreateAccountType.SAFE,
    };

    // Stacked, so closing the deploy dialog returns to the filled-in wizard.
    const handleSubmit = (values: IWorkspaceCreateAccountForm) => {
        const { dialogId, params } = buildCreateAccountRequest(values, {
            onCreated: (account) => {
                close(location.id);
                onCreated(account);
            },
            t,
        });
        open(dialogId, { params, stack: true });
    };

    return (
        <WizardDialog.Container
            defaultValues={defaultValues}
            dialogId={location.id}
            formId="workspaceCreateAccount"
            initialSteps={workspaceCreateAccountDialogSteps}
            onSubmit={handleSubmit}
            submitLabel={t(`${i18nBase}.submit`)}
            title={t(`${i18nBase}.title`)}
        >
            <WorkspaceCreateAccountDialogSteps />
        </WizardDialog.Container>
    );
};
