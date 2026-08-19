// The next/navigation shim of the app does not re-export notFound.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import { MpcListPageClient } from './mpcListPageClient';

export interface IMpcListPageProps {}

export const MpcListPage: React.FC<IMpcListPageProps> = async () => {
    const isEnabled = await featureFlags.isEnabled('mpcSystems');

    if (!isEnabled) {
        notFound();
    }

    return (
        <Page.Container>
            <MpcListPageClient />
        </Page.Container>
    );
};
