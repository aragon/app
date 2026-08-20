// The next/navigation shim of the app does not re-export notFound.
import { notFound } from 'next/navigation-original';
import { Suspense } from 'react';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import { MpcDemoPageClient } from './mpcDemoPageClient';

export interface IMpcDemoPageProps {}

export const MpcDemoPage: React.FC<IMpcDemoPageProps> = async () => {
    const isEnabled = await featureFlags.isEnabled('mpcSystems');

    if (!isEnabled) {
        notFound();
    }

    return (
        <Page.Container>
            <Suspense>
                <MpcDemoPageClient />
            </Suspense>
        </Page.Container>
    );
};
