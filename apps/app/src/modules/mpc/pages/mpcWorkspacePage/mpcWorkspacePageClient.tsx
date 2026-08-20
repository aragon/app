'use client';

import {
    CardEmptyState,
    IconType,
    Spinner,
    StateSkeletonBar,
    Tabs,
} from '@aragon/gov-ui-kit';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    useMpcWorkspace,
    useMpcWorkspaceSystems,
} from '@/modules/mpc/api/mpcService';
import type { IMpcWorkspace } from '@/modules/mpc/api/mpcService/domain';
import { MpcAuthGate } from '@/modules/mpc/components/mpcAuthGate';
import { MpcErrorAlert } from '@/modules/mpc/components/mpcErrorAlert';
import { MpcMockBanner } from '@/modules/mpc/components/mpcMockBanner';
import { MpcSystemCard } from '@/modules/mpc/components/mpcSystemCard';
import { MpcWorkspaceMembersList } from '@/modules/mpc/components/mpcWorkspaceMembersList';
import { MpcWorkspacePolicyList } from '@/modules/mpc/components/mpcWorkspacePolicyList';
import {
    MPC_LIST_PATH,
    type MpcWorkspaceTab,
    mpcCreateSystemPath,
    mpcPolicyNewPath,
    mpcWorkspacePath,
} from '@/modules/mpc/constants/mpcConstants';
import { MpcDialogId } from '@/modules/mpc/constants/mpcDialogId';
import { useMpcSessionGuard } from '@/modules/mpc/hooks/useMpcSessionGuard';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IMpcWorkspacePageClientProps {
    /**
     * ID of the workspace.
     */
    workspaceId: string;
}

const tabs: MpcWorkspaceTab[] = ['systems', 'policies', 'members'];

const MpcWorkspaceSystems: React.FC<{ workspace: IMpcWorkspace }> = ({
    workspace,
}) => {
    const { t } = useTranslations();
    const { data, isLoading, error } = useMpcWorkspaceSystems({
        urlParams: { workspaceId: workspace.id },
    });

    if (isLoading) {
        return (
            <div className="flex flex-col gap-3">
                <StateSkeletonBar size="lg" width="60%" />
                <StateSkeletonBar size="lg" width="40%" />
            </div>
        );
    }

    if (error != null) {
        return <MpcErrorAlert error={error} />;
    }

    if (data == null || data.length === 0) {
        return (
            <CardEmptyState
                description={t(
                    'app.mpc.mpcWorkspacePage.systems.empty.description',
                )}
                heading={t('app.mpc.mpcWorkspacePage.systems.empty.heading')}
                objectIllustration={{ object: 'SECURITY' }}
                primaryButton={{
                    label: t('app.mpc.mpcWorkspacePage.systems.empty.action'),
                    href: mpcCreateSystemPath(workspace.id),
                }}
            />
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.map((system) => (
                <MpcSystemCard key={system.id} system={system} />
            ))}
        </div>
    );
};

const MpcWorkspaceContent: React.FC<IMpcWorkspacePageClientProps> = (props) => {
    const { workspaceId } = props;
    const { t } = useTranslations();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { open } = useDialogContext();
    const { session } = useMpcSessionGuard();
    const {
        data: workspace,
        isLoading,
        error,
    } = useMpcWorkspace({
        urlParams: { workspaceId },
    });

    const tabParam = searchParams.get('tab');
    const activeTab: MpcWorkspaceTab =
        tabParam === 'policies' || tabParam === 'members'
            ? tabParam
            : 'systems';

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Spinner size="xl" variant="neutral" />
            </div>
        );
    }

    if (error != null || workspace == null) {
        return <MpcErrorAlert error={error} />;
    }

    const isOwner = workspace.ownerId === session?.user.id;
    const owner = workspace.members.find((member) => member.role === 'owner');

    const handleTabChange = (value: string) =>
        router.replace(
            mpcWorkspacePath(workspace.id, value as MpcWorkspaceTab),
        );

    return (
        <>
            <Page.Header
                breadcrumbs={[
                    {
                        href: MPC_LIST_PATH,
                        label: t('app.mpc.mpcWorkspacePage.breadcrumb'),
                    },
                    { label: workspace.name },
                ]}
                breadcrumbsTag={{
                    label: t(
                        isOwner
                            ? 'app.mpc.mpcWorkspacePage.ownerTag'
                            : 'app.mpc.mpcWorkspacePage.memberTag',
                    ),
                    variant: isOwner ? 'primary' : 'neutral',
                }}
                description={t('app.mpc.mpcWorkspacePage.description', {
                    owner: owner?.username ?? workspace.ownerId,
                })}
                title={workspace.name}
            />
            <MpcMockBanner />
            <Tabs.Root
                isUnderlined={true}
                onValueChange={handleTabChange}
                value={activeTab}
            >
                <Tabs.List>
                    {tabs.map((tab) => (
                        <Tabs.Trigger
                            key={tab}
                            label={t(`app.mpc.mpcWorkspacePage.tabs.${tab}`)}
                            value={tab}
                        />
                    ))}
                </Tabs.List>
                <Tabs.Content className="pt-6" value="systems">
                    <Page.MainSection
                        action={{
                            label: t('app.mpc.mpcWorkspacePage.systems.action'),
                            iconLeft: IconType.PLUS,
                            href: mpcCreateSystemPath(workspace.id),
                        }}
                        description={t(
                            'app.mpc.mpcWorkspacePage.systems.description',
                        )}
                        title={t('app.mpc.mpcWorkspacePage.systems.title')}
                    >
                        <MpcWorkspaceSystems workspace={workspace} />
                    </Page.MainSection>
                </Tabs.Content>
                <Tabs.Content className="pt-6" value="policies">
                    <Page.MainSection
                        action={
                            isOwner
                                ? {
                                      label: t(
                                          'app.mpc.mpcWorkspacePage.policies.action',
                                      ),
                                      iconLeft: IconType.PLUS,
                                      href: mpcPolicyNewPath(workspace.id),
                                  }
                                : undefined
                        }
                        description={t(
                            'app.mpc.mpcWorkspacePage.policies.description',
                        )}
                        title={t('app.mpc.mpcWorkspacePage.policies.title')}
                    >
                        <MpcWorkspacePolicyList
                            canManage={isOwner}
                            workspaceId={workspace.id}
                        />
                    </Page.MainSection>
                </Tabs.Content>
                <Tabs.Content className="pt-6" value="members">
                    <Page.MainSection
                        description={t(
                            'app.mpc.mpcWorkspacePage.members.description',
                        )}
                        title={t('app.mpc.mpcWorkspacePage.members.title')}
                    >
                        <MpcWorkspaceMembersList
                            canManage={isOwner}
                            onAddMemberClick={() =>
                                open(MpcDialogId.ADD_WORKSPACE_MEMBER, {
                                    params: { workspaceId: workspace.id },
                                })
                            }
                            workspaceId={workspace.id}
                        />
                    </Page.MainSection>
                </Tabs.Content>
            </Tabs.Root>
        </>
    );
};

export const MpcWorkspacePageClient: React.FC<IMpcWorkspacePageClientProps> = (
    props,
) => {
    const { workspaceId } = props;

    return (
        <Page.Main fullWidth={true}>
            <MpcAuthGate redirectTo={mpcWorkspacePath(workspaceId)}>
                <MpcWorkspaceContent workspaceId={workspaceId} />
            </MpcAuthGate>
        </Page.Main>
    );
};
