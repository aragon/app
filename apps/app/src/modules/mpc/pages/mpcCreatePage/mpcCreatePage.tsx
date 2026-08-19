// The next/navigation shim of the app does not re-export notFound.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import { MpcCreatePageClient } from './mpcCreatePageClient';

export interface IMpcCreatePageProps {}

export const MpcCreatePage: React.FC<IMpcCreatePageProps> = async () => {
    const isEnabled = await featureFlags.isEnabled('mpcSystems');

    if (!isEnabled) {
        notFound();
    }

    return (
        <Page.Container>
            <MpcCreatePageClient />
        </Page.Container>
    );
};
