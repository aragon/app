'use client';

import {
    AlertCard,
    Avatar,
    Dialog,
    Heading,
    invariant,
} from '@aragon/gov-ui-kit';
import { useEffect, useState } from 'react';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { usePinFile } from '@/shared/api/ipfsService/mutations';
import { useBlockNavigationContext } from '@/shared/components/blockNavigationContext';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useCreateWorkspace } from '../../api/workspaceService';
import type { ICreateWorkspaceFormData } from '../../components/createWorkspaceForm';
import { publishWorkspaceDialogUtils } from './publishWorkspaceDialogUtils';

export interface IPublishWorkspaceDialogParams {
    /**
     * Values of the create-workspace form.
     */
    values: ICreateWorkspaceFormData;
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

    const { address } = useWalletAccount();
    invariant(
        address != null,
        'PublishWorkspaceDialog: user must be connected.',
    );

    const { values } = location.params;
    const { name, description, avatar, accounts, targets } = values;

    const { t } = useTranslations();
    const { close } = useDialogContext();
    const { setIsBlocked } = useBlockNavigationContext();

    const [status, setStatus] = useState<PublishWorkspaceStatus>('idle');
    const [workspaceId, setWorkspaceId] = useState<string>();

    const { mutateAsync: pinFile } = usePinFile();
    const { mutateAsync: createWorkspace } = useCreateWorkspace();

    const pinAvatar = async (file?: File) => {
        if (file == null) {
            return undefined;
        }

        const { IpfsHash } = await pinFile({ body: file });

        return IpfsHash;
    };

    const handleCreateWorkspace = async () => {
        setStatus('pending');

        try {
            const avatarCid = await pinAvatar(avatar?.file);
            const accountAvatarFiles =
                publishWorkspaceDialogUtils.getAccountAvatarFiles(accounts);
            const accountAvatarCids: (string | undefined)[] = [];

            for (const file of accountAvatarFiles) {
                accountAvatarCids.push(await pinAvatar(file));
            }

            const body = publishWorkspaceDialogUtils.buildWorkspace({
                values,
                owner: address,
                avatarCid,
                accountAvatarCids,
            });
            const workspace = await createWorkspace({ body });

            setWorkspaceId(workspace.id);
            setStatus('success');
        } catch {
            setStatus('error');
        }
    };

    const isSuccess = status === 'success';

    // The create-workspace wizard blocks navigation while its form is dirty, which makes the shared Link wrapper
    // ask the user to confirm leaving the page. Once the workspace is created, navigating away is the intended
    // outcome, therefore navigation is unblocked before the success link is rendered.
    useEffect(() => {
        if (isSuccess) {
            setIsBlocked(false);
        }
    }, [isSuccess, setIsBlocked]);

    const primaryAction = isSuccess
        ? {
              label: t('app.workspace.publishWorkspaceDialog.button.success'),
              href: `/workspace/${workspaceId!}`,
              onClick: () => close(location.id),
          }
        : {
              label: t(
                  `app.workspace.publishWorkspaceDialog.button.${status === 'error' ? 'retry' : 'submit'}`,
              ),
              isLoading: status === 'pending',
              onClick: () => void handleCreateWorkspace(),
          };

    return (
        <>
            <Dialog.Header
                title={t('app.workspace.publishWorkspaceDialog.title')}
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
                            'app.workspace.publishWorkspaceDialog.error.title',
                        )}
                        variant="critical"
                    >
                        {t(
                            'app.workspace.publishWorkspaceDialog.error.description',
                        )}
                    </AlertCard>
                )}
                {isSuccess && (
                    <AlertCard
                        message={t(
                            'app.workspace.publishWorkspaceDialog.success.title',
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
