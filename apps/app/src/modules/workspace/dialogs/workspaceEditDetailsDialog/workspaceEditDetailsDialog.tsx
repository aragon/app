'use client';

import { AlertCard, Dialog, invariant } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    type IWorkspace,
    useUpdateWorkspaceDetails,
    useWorkspace,
    workspaceServiceKeys,
} from '../../api/workspaceService';
import {
    CreateWorkspaceForm,
    type ICreateWorkspaceFormData,
} from '../../components/createWorkspaceForm';
import { useResolveWorkspaceAvatar } from '../../hooks/useResolveWorkspaceAvatar';
import { workspaceFormUtils } from '../../utils/workspaceFormUtils';

export interface IWorkspaceEditDetailsDialogParams {
    /**
     * ID of the workspace to edit the details of.
     */
    workspaceId: string;
}

export interface IWorkspaceEditDetailsDialogProps
    extends IDialogComponentProps<IWorkspaceEditDetailsDialogParams> {}

type WorkspaceDetailsFormData = Pick<
    ICreateWorkspaceFormData,
    'name' | 'description' | 'avatar' | 'resources'
>;

const formId = 'workspaceEditDetailsForm';

export const WorkspaceEditDetailsDialog: React.FC<
    IWorkspaceEditDetailsDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'WorkspaceEditDetailsDialog: required parameters must be set.',
    );

    const { workspaceId } = location.params;

    const { data: workspace } = useWorkspace({
        urlParams: { id: workspaceId },
    });

    // The form takes its default values on mount, so it renders once the stored workspace is read.
    if (workspace == null) {
        return null;
    }

    return (
        <WorkspaceEditDetailsDialogForm
            dialogId={location.id}
            workspace={workspace}
        />
    );
};

interface IWorkspaceEditDetailsDialogFormProps {
    /**
     * ID of the dialog, to close it.
     */
    dialogId: string;
    /**
     * Workspace to edit the details of.
     */
    workspace: IWorkspace;
}

const WorkspaceEditDetailsDialogForm: React.FC<
    IWorkspaceEditDetailsDialogFormProps
> = (props) => {
    const { dialogId, workspace } = props;

    const { t } = useTranslations();
    const { close } = useDialogContext();
    const queryClient = useQueryClient();

    const resolveAvatarUri = useResolveWorkspaceAvatar();
    const { mutateAsync: updateWorkspaceDetails } = useUpdateWorkspaceDetails();
    const [hasError, setHasError] = useState(false);

    const { name, description, avatar, resources } =
        workspaceFormUtils.buildFormValues(workspace);
    const formMethods = useForm<WorkspaceDetailsFormData>({
        mode: 'onTouched',
        defaultValues: { name, description, avatar, resources },
    });
    const {
        handleSubmit,
        control,
        formState: { isSubmitting },
    } = formMethods;
    const currentName = useWatch({ control, name: 'name' });

    const handleClose = () => close(dialogId);

    const onFormSubmit = async (values: WorkspaceDetailsFormData) => {
        setHasError(false);

        try {
            await saveDetails(values);
            handleClose();
        } catch {
            setHasError(true);
        }
    };

    const saveDetails = async (values: WorkspaceDetailsFormData) => {
        const avatarUri = await resolveAvatarUri(values.avatar);

        await updateWorkspaceDetails({
            urlParams: { id: workspace.id },
            body: {
                name: values.name,
                description: values.description,
                avatar: avatarUri ?? null,
                links: values.resources,
            },
        });

        await Promise.all([
            queryClient.invalidateQueries({
                queryKey: workspaceServiceKeys.workspace({
                    urlParams: { id: workspace.id },
                }),
            }),
            queryClient.invalidateQueries({
                queryKey: workspaceServiceKeys.workspaceList(),
            }),
        ]);
    };

    return (
        <FormProvider {...formMethods}>
            <Dialog.Header
                description={t(
                    'app.workspace.workspaceEditDetailsDialog.description',
                )}
                onClose={handleClose}
                title={t('app.workspace.workspaceEditDetailsDialog.title')}
            />
            <Dialog.Content>
                <form
                    className="flex flex-col gap-section py-inset-flush--fixed-16"
                    id={formId}
                    onSubmit={handleSubmit(onFormSubmit)}
                >
                    <CreateWorkspaceForm.Metadata isStacked={true} />
                    {hasError && (
                        <AlertCard
                            message={t(
                                'app.workspace.workspaceEditDetailsDialog.error.title',
                            )}
                            variant="critical"
                        >
                            {t(
                                'app.workspace.workspaceEditDetailsDialog.error.description',
                            )}
                        </AlertCard>
                    )}
                </form>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(
                        'app.workspace.workspaceEditDetailsDialog.action.save',
                    ),
                    type: 'submit',
                    form: formId,
                    disabled: currentName.trim() === '' || isSubmitting,
                    isLoading: isSubmitting,
                }}
                secondaryAction={{
                    label: t(
                        'app.workspace.workspaceEditDetailsDialog.action.cancel',
                    ),
                    onClick: handleClose,
                }}
            />
        </FormProvider>
    );
};
