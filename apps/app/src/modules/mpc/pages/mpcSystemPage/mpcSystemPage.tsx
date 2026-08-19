// The next/navigation shim of the app does not re-export notFound.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import { MpcSystemPageClient } from './mpcSystemPageClient';

export interface IMpcSystemPageParams {
    /**
     * ID of the system.
     */
    systemId: string;
}

export interface IMpcSystemPageProps {
    /**
     * Page parameters.
     */
    params: Promise<IMpcSystemPageParams>;
}

export const MpcSystemPage: React.FC<IMpcSystemPageProps> = async (props) => {
    const { params } = props;
    const isEnabled = await featureFlags.isEnabled('mpcSystems');

    if (!isEnabled) {
        notFound();
    }

    const { systemId } = await params;

    return (
        <Page.Container>
            <MpcSystemPageClient systemId={systemId} />
        </Page.Container>
    );
};
