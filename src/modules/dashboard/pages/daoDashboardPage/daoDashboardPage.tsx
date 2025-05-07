import { Page } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { DaoDashboardPageClient } from './daoDashboardPageClient';

export interface IDaoDashboardPageProps {
    /**
     * DAO page parameters.
     */
    params: Promise<IDaoPageParams>;
}

export const DaoDashboardPage: React.FC<IDaoDashboardPageProps> = async (props) => {
    const { params } = props;
    const daoPageParams = await params;
    const daoId = await daoUtils.resolveDaoId(daoPageParams);

    return (
        <Page.Container>
            <DaoDashboardPageClient daoId={daoId} />
        </Page.Container>
    );
};
