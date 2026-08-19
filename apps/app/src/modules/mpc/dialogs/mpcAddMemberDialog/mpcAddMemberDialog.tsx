'use client';

import {
    Dialog,
    InputText,
    invariant,
    Radio,
    RadioGroup,
} from '@aragon/gov-ui-kit';
import { useForm } from 'react-hook-form';
import { useMpcAddMember } from '@/modules/mpc/api/mpcService';
import type { MpcMemberRole } from '@/modules/mpc/api/mpcService/domain';
import { MpcErrorAlert } from '@/modules/mpc/components/mpcErrorAlert';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';

export interface IMpcAddMemberDialogParams {
    /**
     * ID of the system.
     */
    systemId: string;
}

export interface IMpcAddMemberDialogProps
    extends IDialogComponentProps<IMpcAddMemberDialogParams> {}

interface IMpcAddMemberFormData {
    username: string;
    role: MpcMemberRole;
}

const roles: MpcMemberRole[] = ['owner', 'approver', 'viewer'];

export const MpcAddMemberDialog: React.FC<IMpcAddMemberDialogProps> = (
    props,
) => {
    const { location } = props;
    invariant(
        location.params != null,
        'MpcAddMemberDialog: required parameters must be set.',
    );
    const { systemId } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();
    const handleClose = () => close(location.id);

    const { control, handleSubmit } = useForm<IMpcAddMemberFormData>({
        mode: 'onTouched',
        defaultValues: { username: '', role: 'approver' },
    });
    const usernameField = useFormField<IMpcAddMemberFormData, 'username'>(
        'username',
        {
            control,
            label: t('app.mpc.mpcAddMemberDialog.username.label'),
            rules: { required: true, minLength: 3, maxLength: 32 },
            trimOnBlur: true,
        },
    );
    const roleField = useFormField<IMpcAddMemberFormData, 'role'>('role', {
        control,
        label: t('app.mpc.mpcAddMemberDialog.role.label'),
        rules: { required: true },
    });

    const { mutate, isPending, error } = useMpcAddMember({
        onSuccess: handleClose,
    });

    const onSubmit = handleSubmit((values) =>
        mutate({ urlParams: { systemId }, body: values }),
    );

    return (
        <>
            <Dialog.Header
                description={t('app.mpc.mpcAddMemberDialog.description')}
                onClose={handleClose}
                title={t('app.mpc.mpcAddMemberDialog.title')}
            />
            <Dialog.Content className="flex flex-col gap-6 px-6 pt-4 pb-6">
                <InputText
                    placeholder={t(
                        'app.mpc.mpcAddMemberDialog.username.placeholder',
                    )}
                    {...usernameField}
                />
                <RadioGroup
                    helpText={t('app.mpc.mpcAddMemberDialog.role.helpText')}
                    label={roleField.label}
                    onValueChange={roleField.onChange}
                    value={roleField.value}
                >
                    {roles.map((role) => (
                        <Radio
                            key={role}
                            label={t(`app.mpc.mpcAddMemberDialog.role.${role}`)}
                            value={role}
                        />
                    ))}
                </RadioGroup>
                <MpcErrorAlert error={error} />
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t('app.mpc.mpcAddMemberDialog.actions.submit'),
                    onClick: onSubmit,
                    isLoading: isPending,
                }}
                secondaryAction={{
                    label: t('app.mpc.mpcAddMemberDialog.actions.cancel'),
                    onClick: handleClose,
                }}
            />
        </>
    );
};
