'use client';

import { Dialog, InputText, invariant } from '@aragon/gov-ui-kit';
import { useForm } from 'react-hook-form';
import { useMpcAddWorkspaceMember } from '@/modules/mpc/api/mpcService';
import { MpcErrorAlert } from '@/modules/mpc/components/mpcErrorAlert';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';

export interface IMpcAddWorkspaceMemberDialogParams {
    /**
     * ID of the workspace.
     */
    workspaceId: string;
}

export interface IMpcAddWorkspaceMemberDialogProps
    extends IDialogComponentProps<IMpcAddWorkspaceMemberDialogParams> {}

interface IMpcAddWorkspaceMemberFormData {
    username: string;
}

export const MpcAddWorkspaceMemberDialog: React.FC<
    IMpcAddWorkspaceMemberDialogProps
> = (props) => {
    const { location } = props;
    invariant(
        location.params != null,
        'MpcAddWorkspaceMemberDialog: required parameters must be set.',
    );
    const { workspaceId } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();
    const handleClose = () => close(location.id);

    const { control, handleSubmit } = useForm<IMpcAddWorkspaceMemberFormData>({
        mode: 'onTouched',
        defaultValues: { username: '' },
    });
    const usernameField = useFormField<
        IMpcAddWorkspaceMemberFormData,
        'username'
    >('username', {
        control,
        label: t('app.mpc.mpcAddWorkspaceMemberDialog.username.label'),
        rules: { required: true, minLength: 3, maxLength: 32 },
        trimOnBlur: true,
    });

    const { mutate, isPending, error } = useMpcAddWorkspaceMember({
        onSuccess: handleClose,
    });

    const onSubmit = handleSubmit((values) =>
        mutate({ urlParams: { workspaceId }, body: values }),
    );

    return (
        <>
            <Dialog.Header
                description={t(
                    'app.mpc.mpcAddWorkspaceMemberDialog.description',
                )}
                onClose={handleClose}
                title={t('app.mpc.mpcAddWorkspaceMemberDialog.title')}
            />
            <Dialog.Content className="flex flex-col gap-6 px-6 pt-4 pb-6">
                <InputText
                    placeholder={t(
                        'app.mpc.mpcAddWorkspaceMemberDialog.username.placeholder',
                    )}
                    {...usernameField}
                />
                <MpcErrorAlert error={error} />
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(
                        'app.mpc.mpcAddWorkspaceMemberDialog.actions.submit',
                    ),
                    onClick: onSubmit,
                    isLoading: isPending,
                }}
                secondaryAction={{
                    label: t(
                        'app.mpc.mpcAddWorkspaceMemberDialog.actions.cancel',
                    ),
                    onClick: handleClose,
                }}
            />
        </>
    );
};
