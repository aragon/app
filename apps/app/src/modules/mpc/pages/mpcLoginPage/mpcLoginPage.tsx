// The next/navigation shim of the app does not re-export notFound.
import { notFound } from 'next/navigation-original';
import { Suspense } from 'react';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import { MpcLoginPageClient } from './mpcLoginPageClient';

export interface IMpcLoginPageProps {}

export const MpcLoginPage: React.FC<IMpcLoginPageProps> = async () => {
    const isEnabled = await featureFlags.isEnabled('mpcSystems');

    if (!isEnabled) {
        notFound();
    }

    return (
        <Page.Container>
            <Suspense>
                <MpcLoginPageClient />
            </Suspense>
        </Page.Container>
    );
};
