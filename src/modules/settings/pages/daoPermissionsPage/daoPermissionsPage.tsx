import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import type { IDaoPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { networkUtils } from '@/shared/utils/networkUtils';
import { DaoPermissionsPageClient } from './daoPermissionsPageClient';

export interface IDaoPermissionsPageProps {
    /**
     * DAO page parameters.
     */
    params: Promise<IDaoPageParams>;
}

export const DaoPermissionsPage: React.FC<IDaoPermissionsPageProps> = async (
    props,
) => {
    const { params } = props;
    const daoPageParams = await params;

    if (!networkUtils.isValidNetwork(daoPageParams.network)) {
        // invalid network handled in DAO layout
        return null;
    }

    if (!(await featureFlags.isEnabled('permissionsPage'))) {
        notFound();
    }

    const daoId = await daoUtils.resolveDaoId(daoPageParams);

    return (
        <Page.Container>
            <DaoPermissionsPageClient daoId={daoId} />
        </Page.Container>
    );
};
