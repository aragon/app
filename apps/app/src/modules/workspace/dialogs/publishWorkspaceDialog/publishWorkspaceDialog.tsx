'use client';

import {
    AlertCard,
    Avatar,
    Dialog,
    Heading,
    type IInputFileAvatarValue,
    invariant,
} from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { usePinFile } from '@/shared/api/ipfsService/mutations';
import { useBlockNavigationContext } from '@/shared/components/blockNavigationContext';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { workspaceAccountsOptions } from '../../api/workspaceQueryService';
import {
    useCreateWorkspace,
    useUpdateWorkspace,
    workspaceServiceKeys,
} from '../../api/workspaceService';
import type {
    ICreateWorkspaceFormAccount,
    ICreateWorkspaceFormData,
} from '../../components/createWorkspaceForm';
import {
    workspaceAllAccountsSegment,
    workspaceUtils,
} from '../../utils/workspaceUtils';
import { publishWorkspaceDialogUtils } from './publishWorkspaceDialogUtils';

export interface IPublishWorkspaceDialogParams {
    /**
     * Values of the create-workspace form.
     */
    values: ICreateWorkspaceFormData;
    /**
     * ID of the workspace to update with the form values. A new workspace is created when not set.
     */
    workspaceId?: string;
}

export interface IPublishWorkspaceDialogProps
    extends IDialogComponentProps<IPublishWorkspaceDialogParams> {}

type PublishWorkspaceStatus = 'idle' | 'pending' | 'error' | 'success';

export const PublishWorkspaceDialog: React.FC<IPublishWorkspaceDialogProps> = (
    props,
) => {
    const { location } = props;

    invariant(
        location.params != null,
        'PublishWorkspaceDialog: required parameters must be set.',
    );

    const { values, workspaceId } = location.params;
    const { name, description, avatar, accounts, targets } = values;

    const isUpdate = workspaceId != null;
    const mode = isUpdate ? 'update' : 'create';

    const { t } = useTranslations();
    const { close } = useDialogContext();
    const { setIsBlocked } = useBlockNavigationContext();

    const [status, setStatus] = useState<PublishWorkspaceStatus>('idle');

    const { mutateAsync: pinFile } = usePinFile();
    const { mutateAsync: createWorkspace, data: createdWorkspace } =
        useCreateWorkspace();
    const { mutateAsync: updateWorkspace } = useUpdateWorkspace();

    // An update keeps the ID of the workspace, a creation gets one assigned by the registry.
    const savedWorkspaceId = workspaceId ?? createdWorkspace?.id;
    const queryClient = useQueryClient();

    // A newly selected file is pinned, while an avatar carried over from the stored workspace keeps its URI.
    const resolveAvatarUri = async (value?: IInputFileAvatarValue) => {
        if (value?.file != null) {
            const { IpfsHash } = await pinFile({ body: value.file });

            return ipfsUtils.cidToUri(IpfsHash);
        }

        return value?.url != null ? ipfsUtils.srcToUri(value.url) : undefined;
    };

    // Resolves the type of every account in one call, the authoritative read right before the workspace is stored.
    const resolveAccountInfos = async (
        formAccounts: ICreateWorkspaceFormAccount[],
    ) => {
        if (formAccounts.length === 0) {
            return [];
        }

        const accountRefs = formAccounts.map(({ network, address }) => ({
            network,
            address,
        }));

        return await queryClient.fetchQuery(
            workspaceAccountsOptions({ body: { accounts: accountRefs } }),
        );
    };

    const handlePublishWorkspace = async () => {
        setStatus('pending');

        try {
            const accountInfos = await resolveAccountInfos(accounts);

            const avatarUri = await resolveAvatarUri(avatar);
            const accountAvatars =
                publishWorkspaceDialogUtils.getAccountAvatars(accounts);
            const accountAvatarUris: (string | undefined)[] = [];

            for (const accountAvatar of accountAvatars) {
                accountAvatarUris.push(await resolveAvatarUri(accountAvatar));
            }

            const body = publishWorkspaceDialogUtils.buildWorkspace({
                values,
                avatarUri,
                accountAvatarUris,
                accountInfos,
            });
            const workspace = isUpdate
                ? await updateWorkspace({
                      urlParams: { id: workspaceId },
                      body,
                  })
                : await createWorkspace({ body });

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: workspaceServiceKeys.workspaceList(),
                }),
                queryClient.invalidateQueries({
                    queryKey: workspaceServiceKeys.workspace({
                        urlParams: { id: workspace.id },
                    }),
                }),
            ]);

            setStatus('success');
        } catch {
            setStatus('error');
        }
    };

    const isSuccess = status === 'success';

    // The workspace forms block navigation while dirty, which makes the shared Link wrapper ask the user to confirm
    // leaving the page. Once the workspace is stored, navigating away is the intended outcome, therefore navigation
    // is unblocked before the success link is rendered.
    useEffect(() => {
        if (isSuccess) {
            setIsBlocked(false);
        }
    }, [isSuccess, setIsBlocked]);

    const primaryAction = isSuccess
        ? {
              label: t('app.workspace.publishWorkspaceDialog.button.success'),
              href: workspaceUtils.getAccountScopeUrl(
                  savedWorkspaceId!,
                  workspaceAllAccountsSegment,
                  'overview',
              ),
              onClick: () => close(location.id),
          }
        : {
              label: t(
                  status === 'error'
                      ? 'app.workspace.publishWorkspaceDialog.button.retry'
                      : `app.workspace.publishWorkspaceDialog.${mode}.submit`,
              ),
              isLoading: status === 'pending',
              onClick: () => void handlePublishWorkspace(),
          };

    return (
        <>
            <Dialog.Header
                title={t(`app.workspace.publishWorkspaceDialog.${mode}.title`)}
            />
            <Dialog.Content className="flex flex-col gap-4 px-6 pt-4 pb-6">
                <div className="flex items-center gap-3">
                    <Avatar alt={name} size="lg" src={avatar?.url} />
                    <div className="flex min-w-0 flex-col gap-1">
                        <Heading as="h3" size="h4">
                            {name}
                        </Heading>
                        <p className="text-neutral-500 text-sm leading-normal">
                            {t('app.workspace.publishWorkspaceDialog.summary', {
                                accounts: accounts.length,
                                targets: targets.length,
                            })}
                        </p>
                    </div>
                </div>
                {description !== '' && (
                    <p className="text-base text-neutral-500 leading-normal">
                        {description}
                    </p>
                )}
                {status === 'error' && (
                    <AlertCard
                        message={t(
                            `app.workspace.publishWorkspaceDialog.${mode}.error.title`,
                        )}
                        variant="critical"
                    >
                        {t(
                            `app.workspace.publishWorkspaceDialog.${mode}.error.description`,
                        )}
                    </AlertCard>
                )}
                {isSuccess && (
                    <AlertCard
                        message={t(
                            `app.workspace.publishWorkspaceDialog.${mode}.success`,
                        )}
                        variant="success"
                    />
                )}
            </Dialog.Content>
            <Dialog.Footer
                hasError={status === 'error'}
                primaryAction={primaryAction}
            />
        </>
    );
};
