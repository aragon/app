'use client';

import { Dialog, InputText } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMpcCreateWorkspace } from '@/modules/mpc/api/mpcService';
import { MpcErrorAlert } from '@/modules/mpc/components/mpcErrorAlert';
import { mpcWorkspacePath } from '@/modules/mpc/constants/mpcConstants';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';

export interface IMpcCreateWorkspaceDialogParams {}

export interface IMpcCreateWorkspaceDialogProps
    extends IDialogComponentProps<IMpcCreateWorkspaceDialogParams> {}

interface IMpcCreateWorkspaceFormData {
    name: string;
}

export const MpcCreateWorkspaceDialog: React.FC<
    IMpcCreateWorkspaceDialogProps
> = (props) => {
    const { location } = props;
    const { t } = useTranslations();
    const router = useRouter();
    const { close } = useDialogContext();
    const handleClose = () => close(location.id);

    const { control, handleSubmit } = useForm<IMpcCreateWorkspaceFormData>({
        mode: 'onTouched',
        defaultValues: { name: '' },
    });
    const nameField = useFormField<IMpcCreateWorkspaceFormData, 'name'>(
        'name',
        {
            control,
            label: t('app.mpc.mpcCreateWorkspaceDialog.name.label'),
            rules: { required: true, minLength: 2, maxLength: 64 },
            trimOnBlur: true,
        },
    );

    const { mutate, isPending, error } = useMpcCreateWorkspace({
        onSuccess: (workspace) => {
            handleClose();
            router.push(mpcWorkspacePath(workspace.id));
        },
    });

    const onSubmit = handleSubmit((values) =>
        mutate({ body: { name: values.name } }),
    );

    return (
        <>
            <Dialog.Header
                description={t('app.mpc.mpcCreateWorkspaceDialog.description')}
                onClose={handleClose}
                title={t('app.mpc.mpcCreateWorkspaceDialog.title')}
            />
            <Dialog.Content className="flex flex-col gap-6 px-6 pt-4 pb-6">
                <InputText
                    placeholder={t(
                        'app.mpc.mpcCreateWorkspaceDialog.name.placeholder',
                    )}
                    {...nameField}
                />
                <MpcErrorAlert error={error} />
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t('app.mpc.mpcCreateWorkspaceDialog.actions.submit'),
                    onClick: onSubmit,
                    isLoading: isPending,
                }}
                secondaryAction={{
                    label: t('app.mpc.mpcCreateWorkspaceDialog.actions.cancel'),
                    onClick: handleClose,
                }}
            />
        </>
    );
};
