'use client';

import { Dialog, invariant } from '@aragon/gov-ui-kit';
import { FormProvider, useForm } from 'react-hook-form';
import { useMpcUpdatePolicy } from '@/modules/mpc/api/mpcService';
import type { IMpcSystem } from '@/modules/mpc/api/mpcService/domain';
import { MpcErrorAlert } from '@/modules/mpc/components/mpcErrorAlert';
import {
    formDataToPolicy,
    type IMpcPolicyFormData,
    MpcPolicyForm,
    policyToFormData,
} from '@/modules/mpc/components/mpcPolicyForm';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IMpcEditPolicyDialogParams {
    /**
     * System whose policy is edited.
     */
    system: IMpcSystem;
}

export interface IMpcEditPolicyDialogProps
    extends IDialogComponentProps<IMpcEditPolicyDialogParams> {}

export const MpcEditPolicyDialog: React.FC<IMpcEditPolicyDialogProps> = (
    props,
) => {
    const { location } = props;
    invariant(
        location.params != null,
        'MpcEditPolicyDialog: required parameters must be set.',
    );
    const { system } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();
    const handleClose = () => close(location.id);

    const formMethods = useForm<IMpcPolicyFormData>({
        mode: 'onTouched',
        defaultValues: policyToFormData(system.policy),
    });

    const { mutate, isPending, error } = useMpcUpdatePolicy({
        onSuccess: handleClose,
    });

    const onSubmit = formMethods.handleSubmit((values) =>
        mutate({
            urlParams: { systemId: system.id },
            body: formDataToPolicy(values),
        }),
    );

    return (
        <FormProvider {...formMethods}>
            <Dialog.Header
                description={t('app.mpc.mpcEditPolicyDialog.description')}
                onClose={handleClose}
                title={t('app.mpc.mpcEditPolicyDialog.title')}
            />
            <Dialog.Content className="flex flex-col gap-6 px-6 pt-4 pb-6">
                <MpcPolicyForm />
                <MpcErrorAlert error={error} />
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t('app.mpc.mpcEditPolicyDialog.actions.submit'),
                    onClick: onSubmit,
                    isLoading: isPending,
                }}
                secondaryAction={{
                    label: t('app.mpc.mpcEditPolicyDialog.actions.cancel'),
                    onClick: handleClose,
                }}
            />
        </FormProvider>
    );
};
