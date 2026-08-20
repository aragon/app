// The next/navigation shim of the app does not re-export notFound.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import { MpcCreatePageClient } from './mpcCreatePageClient';

export interface IMpcCreatePageParams {
    /**
     * ID of the workspace the system is created in.
     */
    workspaceId: string;
}

export interface IMpcCreatePageProps {
    /**
     * Page parameters.
     */
    params: Promise<IMpcCreatePageParams>;
}

export const MpcCreatePage: React.FC<IMpcCreatePageProps> = async (props) => {
    const { params } = props;
    const isEnabled = await featureFlags.isEnabled('mpcSystems');

    if (!isEnabled) {
        notFound();
    }

    const { workspaceId } = await params;

    return (
        <Page.Container>
            <MpcCreatePageClient workspaceId={workspaceId} />
        </Page.Container>
    );
};
