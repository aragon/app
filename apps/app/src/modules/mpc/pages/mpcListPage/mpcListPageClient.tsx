'use client';

import { CardEmptyState, StateSkeletonBar } from '@aragon/gov-ui-kit';
import { useMpcSystems } from '@/modules/mpc/api/mpcService';
import { MpcAuthGate } from '@/modules/mpc/components/mpcAuthGate';
import { MpcErrorAlert } from '@/modules/mpc/components/mpcErrorAlert';
import { MpcMockBanner } from '@/modules/mpc/components/mpcMockBanner';
import { MpcSystemCard } from '@/modules/mpc/components/mpcSystemCard';
import { MPC_CREATE_PATH } from '@/modules/mpc/constants/mpcConstants';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IMpcListPageClientProps {}

const MpcSystemsList: React.FC = () => {
    const { t } = useTranslations();
    const { data, isLoading, error } = useMpcSystems();

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
                description={t('app.mpc.mpcListPage.empty.description')}
                heading={t('app.mpc.mpcListPage.empty.heading')}
                objectIllustration={{ object: 'SECURITY' }}
                primaryButton={{
                    label: t('app.mpc.mpcListPage.empty.action'),
                    href: MPC_CREATE_PATH,
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

export const MpcListPageClient: React.FC<IMpcListPageClientProps> = () => {
    const { t } = useTranslations();

    return (
        <Page.Main
            action={{
                label: t('app.mpc.mpcListPage.action'),
                href: MPC_CREATE_PATH,
            }}
            fullWidth={true}
            title={t('app.mpc.mpcListPage.title')}
        >
            <MpcMockBanner />
            <MpcAuthGate>
                <MpcSystemsList />
            </MpcAuthGate>
        </Page.Main>
    );
};
