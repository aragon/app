import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import type { IDaoPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { networkUtils } from '@/shared/utils/networkUtils';
import { DaoSettingsPageClient } from './daoSettingsPageClient';

export interface IDaoSettingsPageProps {
    /**
     * DAO page parameters.
     */
    params: Promise<IDaoPageParams>;
}

export const DaoSettingsPage: React.FC<IDaoSettingsPageProps> = async (props) => {
    const { params } = props;
    const daoPageParams = await params;

    if (!networkUtils.isValidNetwork(daoPageParams.network)) {
        // invalid network handled in DAO layout
        return null;
    }

    const daoId = await daoUtils.resolveDaoId(daoPageParams);
    const isSubDaoEnabled = await featureFlags.isEnabled('subDao');

    return (
        <Page.Container>
            <Page.Content>
                <DaoSettingsPageClient daoId={daoId} isSubDaoEnabled={isSubDaoEnabled} />
            </Page.Content>
        </Page.Container>
    );
};
