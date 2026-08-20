'use client';

import {
    AlertCard,
    Button,
    Dialog,
    Dropdown,
    IconType,
    InputText,
} from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { Network } from '@/shared/api/daoService';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';
import {
    useCreateWorkspace,
    WorkspaceServiceKey,
    workspaceMaxNameLength,
    workspaceMaxTargets,
} from '../../api/workspaceService';
import type { ICreateWorkspaceFormData } from './createWorkspaceDialogDefinitions';
import { CreateWorkspaceTargetField } from './createWorkspaceTargetField';

export interface ICreateWorkspaceDialogParams {}

export interface ICreateWorkspaceDialogProps
    extends IDialogComponentProps<ICreateWorkspaceDialogParams> {}

export const CreateWorkspaceDialog: React.FC<ICreateWorkspaceDialogProps> = (
    props,
) => {
    const { location } = props;
    const { id } = location;

    const { t } = useTranslations();
    const { close } = useDialogContext();
    const { address } = useWalletAccount();
    const router = useRouter();
    const queryClient = useQueryClient();

    const formValues = useForm<ICreateWorkspaceFormData>({
        mode: 'onTouched',
        defaultValues: {
            name: '',
            network: Network.ETHEREUM_MAINNET,
            targets: [{}],
        },
    });
    const { control, handleSubmit, watch } = formValues;

    const {
        fields: targetFields,
        append,
        remove,
    } = useFieldArray<ICreateWorkspaceFormData, 'targets'>({
        control,
        name: 'targets',
    });

    const nameField = useFormField<ICreateWorkspaceFormData, 'name'>('name', {
        label: t('app.workspace.createWorkspaceDialog.name.label'),
        control,
        rules: { required: true, maxLength: workspaceMaxNameLength },
    });

    const { value: network, onChange: onNetworkChange } = useFormField<
        ICreateWorkspaceFormData,
        'network'
    >('network', {
        label: t('app.workspace.createWorkspaceDialog.network.label'),
        control,
        rules: { required: true },
    });

    const { mutate, isPending, error } = useCreateWorkspace({
        onSuccess: (workspace) => {
            void queryClient.invalidateQueries({
                queryKey: [WorkspaceServiceKey.WORKSPACES],
            });
            close(id);
            router.push(`/workspaces/${workspace.id}`);
        },
    });

    const availableNetworks = Object.entries(networkDefinitions)
        .filter(([, definition]) => !definition.disabled)
        .sort(([, first], [, second]) => first.order - second.order);

    const handleCancel = () => close(id);

    const handleCreate = handleSubmit((values) => {
        if (address == null) {
            return;
        }

        mutate({
            body: {
                creator: address,
                name: values.name,
                network: values.network,
                targets: values.targets
                    .map((target) => target.value?.address)
                    .filter((target): target is string => target != null),
            },
        });
    });

    const chainId = networkDefinitions[watch('network')].id;

    return (
        <>
            <Dialog.Header
                description={t(
                    'app.workspace.createWorkspaceDialog.description',
                )}
                onClose={handleCancel}
                title={t('app.workspace.createWorkspaceDialog.title')}
            />
            <Dialog.Content className="flex flex-col gap-4 px-6 pt-4 pb-6">
                <FormProvider {...formValues}>
                    <InputText
                        {...nameField}
                        placeholder={t(
                            'app.workspace.createWorkspaceDialog.name.placeholder',
                        )}
                    />
                    <div className="flex flex-col gap-2">
                        <p className="text-neutral-800 text-sm">
                            {t(
                                'app.workspace.createWorkspaceDialog.network.label',
                            )}
                        </p>
                        <Dropdown.Container
                            customTrigger={
                                <Button
                                    className="w-fit"
                                    iconRight={IconType.CHEVRON_DOWN}
                                    size="md"
                                    variant="tertiary"
                                >
                                    {networkDefinitions[network].name}
                                </Button>
                            }
                        >
                            {availableNetworks.map(([key, definition]) => (
                                <Dropdown.Item
                                    key={key}
                                    onClick={() => onNetworkChange(key)}
                                >
                                    {definition.name}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Container>
                    </div>
                    {targetFields.map((field, index) => (
                        <CreateWorkspaceTargetField
                            canRemove={targetFields.length > 1}
                            chainId={chainId}
                            index={index}
                            key={field.id}
                            onRemove={() => remove(index)}
                        />
                    ))}
                    {targetFields.length < workspaceMaxTargets && (
                        <Button
                            className="w-fit"
                            iconLeft={IconType.PLUS}
                            onClick={() => append({})}
                            size="md"
                            variant="tertiary"
                        >
                            {t(
                                'app.workspace.createWorkspaceDialog.targets.add',
                            )}
                        </Button>
                    )}
                    {error != null && (
                        <AlertCard
                            message={t(
                                'app.workspace.createWorkspaceDialog.error',
                            )}
                            variant="critical"
                        />
                    )}
                </FormProvider>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(
                        'app.workspace.createWorkspaceDialog.action.submit',
                    ),
                    onClick: handleCreate,
                    isLoading: isPending,
                }}
                secondaryAction={{
                    label: t(
                        'app.workspace.createWorkspaceDialog.action.cancel',
                    ),
                    onClick: handleCancel,
                }}
            />
        </>
    );
};
