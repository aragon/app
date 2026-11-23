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
import type { Hex } from 'viem';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { CreateDaoDialogId } from '@/modules/createDao/constants/createDaoDialogId';
import type { IPublishDaoDialogParams } from '@/modules/createDao/dialogs/publishDaoDialog';
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
                <p className="text-base leading-normal text-neutral-500">
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
                >
                    {/* Safe stays disabled until Safe accounts can be created (#1580). */}
                    {[
                        WorkspaceCreateAccountType.SAFE,
                        WorkspaceCreateAccountType.ARAGON,
                    ].map((type) => (
                        <RadioCard
                            description={t(
                                `${i18nBase}.accountType.${type}.description`,
                            )}
                            disabled={type === WorkspaceCreateAccountType.SAFE}
                            key={type}
                            label={t(`${i18nBase}.accountType.${type}.label`)}
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

/**
 * Maps an account deployed as the given account type to its workspace account.
 */
export const buildCreatedAccount = (
    accountType: WorkspaceCreateAccountType,
    deployed: IWorkspaceNetworkAddress,
): IWorkspaceAccount => ({
    id: workspaceUtils.buildAccountId(deployed),
    type: workspaceAccountTypes[accountType],
    address: deployed.address,
    network: deployed.network,
});

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

export interface ICreateAccountRequest {
    /**
     * Dialog deploying the account.
     */
    dialogId: string;
    /**
     * Parameters of that dialog.
     */
    params: IPublishDaoDialogParams;
}

/**
 * Maps the account form to the deploy dialog of the selected account type.
 */
export const buildCreateAccountRequest = (
    form: IWorkspaceCreateAccountForm,
    options: IBuildCreateAccountRequestOptions,
): ICreateAccountRequest => {
    const { accountType, network, name, description, avatar, resources } = form;
    const { onCreated, t } = options;
    // Safe creation lands with #1580, its card is disabled until then.
    invariant(
        accountType !== WorkspaceCreateAccountType.SAFE,
        'buildCreateAccountRequest: Safe accounts cannot be created yet.',
    );

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
        accountType: WorkspaceCreateAccountType.ARAGON,
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
