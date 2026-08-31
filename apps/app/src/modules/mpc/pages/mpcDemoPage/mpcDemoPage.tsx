// The next/navigation shim of the app does not re-export notFound.
import { notFound } from 'next/navigation-original';
import { Suspense } from 'react';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import { MpcDemoPageClient } from './mpcDemoPageClient';

export interface IMpcDemoPageParams {
    /**
     * ID of the MPC account (system) the transaction creator operates on.
     */
    systemId: string;
}

export interface IMpcDemoPageProps {
    /**
     * Page parameters.
     */
    params: Promise<IMpcDemoPageParams>;
}

export const MpcDemoPage: React.FC<IMpcDemoPageProps> = async (props) => {
    const { params } = props;
    const isEnabled = await featureFlags.isEnabled('mpcSystems');

    if (!isEnabled) {
        notFound();
    }

    const { systemId } = await params;

    return (
        <Page.Container>
            <Suspense>
                <MpcDemoPageClient systemId={systemId} />
            </Suspense>
        </Page.Container>
    );
};
