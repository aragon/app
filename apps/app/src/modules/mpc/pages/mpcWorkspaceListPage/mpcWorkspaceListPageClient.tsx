'use client';

import { CardEmptyState, StateSkeletonBar } from '@aragon/gov-ui-kit';
import { useMpcWorkspaces } from '@/modules/mpc/api/mpcService';
import { MpcAuthGate } from '@/modules/mpc/components/mpcAuthGate';
import { MpcErrorAlert } from '@/modules/mpc/components/mpcErrorAlert';
import { MpcMockBanner } from '@/modules/mpc/components/mpcMockBanner';
import { MpcWorkspaceCard } from '@/modules/mpc/components/mpcWorkspaceCard';
import { MpcDialogId } from '@/modules/mpc/constants/mpcDialogId';
import { useMpcSessionGuard } from '@/modules/mpc/hooks/useMpcSessionGuard';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IMpcWorkspaceListPageClientProps {}

const MpcWorkspacesList: React.FC = () => {
    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { session } = useMpcSessionGuard();
    const { data, isLoading, error } = useMpcWorkspaces();

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
                    'app.mpc.mpcWorkspaceListPage.empty.description',
                )}
                heading={t('app.mpc.mpcWorkspaceListPage.empty.heading')}
                objectIllustration={{ object: 'USERS' }}
                primaryButton={{
                    label: t('app.mpc.mpcWorkspaceListPage.empty.action'),
                    onClick: () => open(MpcDialogId.CREATE_WORKSPACE),
                }}
            />
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.map((workspace) => (
                <MpcWorkspaceCard
                    currentUserId={session?.user.id}
                    key={workspace.id}
                    workspace={workspace}
                />
            ))}
        </div>
    );
};

export const MpcWorkspaceListPageClient: React.FC<
    IMpcWorkspaceListPageClientProps
> = () => {
    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { isAuthenticated } = useMpcSessionGuard();

    return (
        <Page.Main
            action={
                isAuthenticated
                    ? {
                          label: t('app.mpc.mpcWorkspaceListPage.action'),
                          onClick: () => open(MpcDialogId.CREATE_WORKSPACE),
                      }
                    : undefined
            }
            fullWidth={true}
            title={t('app.mpc.mpcWorkspaceListPage.title')}
        >
            <MpcMockBanner />
            <p className="text-neutral-500">
                {t('app.mpc.mpcWorkspaceListPage.description')}
            </p>
            <MpcAuthGate>
                <MpcWorkspacesList />
            </MpcAuthGate>
        </Page.Main>
    );
};
