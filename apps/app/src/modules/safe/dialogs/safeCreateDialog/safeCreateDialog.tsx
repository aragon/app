'use client';

import {
    Dialog,
    type ICompositeAddress,
    InputText,
    invariant,
} from '@aragon/gov-ui-kit';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { SafeDialogId, safeCreationNetworks } from '@/modules/safe/constants';
import { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { ManageMembershipAddressList } from '@/shared/components/forms/manageMembershipAddressList';
import { NetworkInput } from '@/shared/components/forms/networkInput';
import { NumberProgressInput } from '@/shared/components/forms/numberProgressInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { ISafeDeployTransactionDialogParams } from '../safeDeployTransactionDialog';

interface ISafeCreateFormData {
    /**
     * Network to deploy the Safe on.
     */
    network: Network;
    /**
     * Optional name of the Safe.
     */
    name: string;
    /**
     * Owners of the Safe.
     */
    members: ICompositeAddress[];
    /**
     * Number of owner approvals a Safe transaction needs.
     */
    threshold: number;
}

export interface ISafeCreateDialogParams
    extends Pick<ISafeDeployTransactionDialogParams, 'onCreated'> {}

export interface ISafeCreateDialogProps
    extends IDialogComponentProps<ISafeCreateDialogParams> {}

const nameMaxLength = 64;

export const SafeCreateDialog: React.FC<ISafeCreateDialogProps> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'SafeCreateDialog: required parameters must be set.',
    );
    const { onCreated } = location.params;

    const { address } = useWalletAccount();
    invariant(address != null, 'SafeCreateDialog: user must be connected.');

    const { t } = useTranslations();
    const { open, close } = useDialogContext();

    const formMethods = useForm<ISafeCreateFormData>({
        mode: 'onTouched',
        defaultValues: {
            network: Network.ETHEREUM_SEPOLIA,
            name: '',
            members: [{ address }],
            threshold: 1,
        },
    });
    const { control, handleSubmit } = formMethods;

    const network = useWatch({ control, name: 'network' });
    const members = useWatch({ control, name: 'members' });
    const threshold = useWatch({ control, name: 'threshold' });

    const translationKey = 'app.safe.safeCreateDialog';

    const nameField = useFormField<ISafeCreateFormData, 'name'>('name', {
        control,
        label: t(`${translationKey}.name.label`),
        rules: { maxLength: nameMaxLength },
    });

    const handleCancel = () => close(location.id);

    const handleContinue = handleSubmit((values) => {
        const name = values.name.trim();
        const params: ISafeDeployTransactionDialogParams = {
            network: values.network,
            name: name === '' ? undefined : name,
            owners: values.members.map((member) => member.address),
            threshold: values.threshold,
            onCreated,
        };
        // Escape must not close the deploy dialog: closed while the transaction confirms, the Safe is never handed
        // back. Cancel and Done of the transaction dialog still close it.
        open(SafeDialogId.DEPLOY_TRANSACTION, {
            stack: true,
            params,
            onClose: () => undefined,
        });
    });

    return (
        <FormProvider {...formMethods}>
            <Dialog.Header
                onClose={handleCancel}
                title={t(`${translationKey}.title`)}
            />
            <Dialog.Content className="flex flex-col gap-6 px-6 pt-4 pb-6">
                <NetworkInput name="network" networks={safeCreationNetworks} />
                <InputText
                    helpText={t(`${translationKey}.name.helpText`)}
                    isOptional={true}
                    maxLength={nameMaxLength}
                    {...nameField}
                />
                <ManageMembershipAddressList
                    allowEmptyList={false}
                    helpText={t(`${translationKey}.owners.helpText`)}
                    label={t(`${translationKey}.owners.label`)}
                    network={network}
                />
                <NumberProgressInput
                    fieldName="threshold"
                    helpText={t(`${translationKey}.threshold.helpText`)}
                    label={t(`${translationKey}.threshold.label`)}
                    min={1}
                    total={members.length}
                    totalLabel={t(`${translationKey}.threshold.total`, {
                        total: members.length,
                    })}
                    valueLabel={threshold.toString()}
                />
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(`${translationKey}.action.continue`),
                    onClick: handleContinue,
                }}
                secondaryAction={{
                    label: t(`${translationKey}.action.cancel`),
                    onClick: handleCancel,
                }}
            />
        </FormProvider>
    );
};
