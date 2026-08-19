'use client';

import {
    AlertCard,
    Button,
    Card,
    Heading,
    IconType,
    InputText,
    TextArea,
} from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
    useMpcDeleteSystem,
    useMpcUpdateSystem,
} from '@/modules/mpc/api/mpcService';
import type { IMpcSystem } from '@/modules/mpc/api/mpcService/domain';
import { MPC_LIST_PATH } from '@/modules/mpc/constants/mpcConstants';
import { MpcDialogId } from '@/modules/mpc/constants/mpcDialogId';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { MpcErrorAlert } from '../mpcErrorAlert';

export interface IMpcSystemSettingsProps {
    /**
     * System to manage.
     */
    system: IMpcSystem;
    /**
     * Whether the current user is an owner of the system.
     */
    isOwner: boolean;
    /**
     * Whether the device share is stored in this browser.
     */
    hasDeviceShare?: boolean;
}

interface IMpcSystemDetailsFormData {
    name: string;
    description: string;
}

export const MpcSystemSettings: React.FC<IMpcSystemSettingsProps> = (props) => {
    const { system, isOwner, hasDeviceShare } = props;
    const { t } = useTranslations();
    const router = useRouter();
    const { open } = useDialogContext();

    const { control, handleSubmit, formState } =
        useForm<IMpcSystemDetailsFormData>({
            mode: 'onTouched',
            values: {
                name: system.name,
                description: system.description ?? '',
            },
        });
    const nameField = useFormField<IMpcSystemDetailsFormData, 'name'>('name', {
        control,
        label: t('app.mpc.mpcSystemSettings.details.name.label'),
        rules: { required: true, maxLength: 64 },
        trimOnBlur: true,
        disabled: !isOwner,
    });
    const descriptionField = useFormField<
        IMpcSystemDetailsFormData,
        'description'
    >('description', {
        control,
        label: t('app.mpc.mpcSystemSettings.details.description.label'),
        rules: { maxLength: 280 },
        sanitizeMode: 'multiline',
        disabled: !isOwner,
    });

    const updateSystem = useMpcUpdateSystem();
    const deleteSystem = useMpcDeleteSystem({
        onSuccess: () => router.push(MPC_LIST_PATH),
    });

    const onSubmitDetails = handleSubmit((values) =>
        updateSystem.mutate({
            urlParams: { systemId: system.id },
            body: {
                name: values.name,
                description:
                    values.description.trim().length > 0
                        ? values.description.trim()
                        : undefined,
            },
        }),
    );

    const handleDelete = () => {
        // POC: simple confirmation, no dedicated dialog.
        if (window.confirm(t('app.mpc.mpcSystemSettings.danger.confirm'))) {
            deleteSystem.mutate({ urlParams: { systemId: system.id } });
        }
    };

    const isActive = system.status === 'active';
    const params = { system };

    return (
        <div className="flex flex-col gap-6">
            <Card className="flex flex-col gap-4 p-6">
                <Heading size="h3">
                    {t('app.mpc.mpcSystemSettings.details.title')}
                </Heading>
                <form
                    className="flex flex-col gap-4"
                    onSubmit={onSubmitDetails}
                >
                    <InputText maxLength={64} {...nameField} />
                    <TextArea
                        isOptional={true}
                        maxLength={280}
                        {...descriptionField}
                    />
                    <MpcErrorAlert error={updateSystem.error} />
                    {isOwner && (
                        <div>
                            <Button
                                disabled={!formState.isDirty}
                                isLoading={updateSystem.isPending}
                                size="md"
                                type="submit"
                                variant="primary"
                            >
                                {t('app.mpc.mpcSystemSettings.details.save')}
                            </Button>
                        </div>
                    )}
                </form>
            </Card>

            <Card className="flex flex-col gap-4 p-6">
                <Heading size="h3">
                    {t('app.mpc.mpcSystemSettings.key.title')}
                </Heading>
                <p className="text-neutral-500 text-sm">
                    {t('app.mpc.mpcSystemSettings.key.description')}
                </p>
                {!isOwner && (
                    <AlertCard
                        message={t('app.mpc.mpcSystemSettings.key.ownerOnly')}
                        variant="info"
                    />
                )}
                <div className="flex flex-wrap gap-3">
                    <Button
                        disabled={
                            !isOwner || !isActive || hasDeviceShare !== true
                        }
                        iconLeft={IconType.RELOAD}
                        onClick={() => open(MpcDialogId.RESHARE, { params })}
                        size="md"
                        variant="secondary"
                    >
                        {t('app.mpc.mpcSystemSettings.key.reshare')}
                    </Button>
                    <Button
                        disabled={!isOwner || !isActive}
                        iconLeft={IconType.BLOCKCHAIN_WALLET}
                        onClick={() => open(MpcDialogId.RECOVER, { params })}
                        size="md"
                        variant="secondary"
                    >
                        {t('app.mpc.mpcSystemSettings.key.recover')}
                    </Button>
                    <Button
                        disabled={
                            !isOwner || !isActive || hasDeviceShare !== true
                        }
                        iconLeft={IconType.WITHDRAW}
                        onClick={() => open(MpcDialogId.EXPORT_KEY, { params })}
                        size="md"
                        variant="tertiary"
                    >
                        {t('app.mpc.mpcSystemSettings.key.export')}
                    </Button>
                </div>
            </Card>

            <Card className="flex flex-col gap-4 border-critical-300 p-6">
                <Heading size="h3">
                    {t('app.mpc.mpcSystemSettings.danger.title')}
                </Heading>
                <p className="text-neutral-500 text-sm">
                    {t('app.mpc.mpcSystemSettings.danger.description')}
                </p>
                <MpcErrorAlert error={deleteSystem.error} />
                <div>
                    <Button
                        disabled={!isOwner}
                        iconLeft={IconType.CLOSE}
                        isLoading={deleteSystem.isPending}
                        onClick={handleDelete}
                        size="md"
                        variant="critical"
                    >
                        {t('app.mpc.mpcSystemSettings.danger.delete')}
                    </Button>
                </div>
            </Card>
        </div>
    );
};
