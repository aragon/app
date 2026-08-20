'use client';

import { Button, CardEmptyState, IconType } from '@aragon/gov-ui-kit';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useWorkspaces } from '../../api/workspaceService';
import { WorkspaceList } from '../../components/workspaceList';
import { WorkspaceDialogId } from '../../constants/workspaceDialogId';

export interface IWorkspaceListPageClientProps {}

export const WorkspaceListPageClient: React.FC<
    IWorkspaceListPageClientProps
> = () => {
    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { address } = useWalletAccount();

    // The service lists the workspaces of one creator, so the connected wallet is required.
    const { data: workspaces } = useWorkspaces(
        { queryParams: { creator: address as string } },
        { enabled: address != null },
    );

    // The create dialog requires a wallet, prompt the connection first when there is none.
    const { check: checkWalletConnected } = useConnectedWalletGuard();

    const handleCreateWorkspace = () =>
        checkWalletConnected({
            onSuccess: () => open(WorkspaceDialogId.CREATE_WORKSPACE),
        });

    return (
        <>
            <Page.Header
                description={t('app.workspace.workspaceListPage.description')}
                title={t('app.workspace.workspaceListPage.title')}
            >
                <Button
                    className="w-fit"
                    iconLeft={IconType.PLUS}
                    onClick={handleCreateWorkspace}
                    size="md"
                    variant="primary"
                >
                    {t('app.workspace.workspaceListPage.action')}
                </Button>
            </Page.Header>
            <Page.Content>
                <Page.Main>
                    {address == null ? (
                        <CardEmptyState
                            description={t(
                                'app.workspace.workspaceListPage.disconnected.description',
                            )}
                            heading={t(
                                'app.workspace.workspaceListPage.disconnected.heading',
                            )}
                            objectIllustration={{ object: 'USERS' }}
                            primaryButton={{
                                label: t(
                                    'app.workspace.workspaceListPage.disconnected.action',
                                ),
                                onClick: handleCreateWorkspace,
                            }}
                        />
                    ) : (
                        <WorkspaceList workspaces={workspaces ?? []} />
                    )}
                </Page.Main>
            </Page.Content>
        </>
    );
};
