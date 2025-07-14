import { Page } from '@/shared/components/page';
import { daoUtils } from '@/shared/utils/daoUtils';
import type { IDaoProcessPageParams } from '../../types/daoProcessPageParams';
import { DaoProcessDetailsPageClient } from './daoProcessDetailsPageClient';

export interface IDaoProcessDetailsPageProps {
    /**
     * DAO member page parameters.
     */
    params: Promise<IDaoProcessPageParams>;
}

export const DaoProcessDetailsPage: React.FC<IDaoProcessDetailsPageProps> = async (props) => {
    const { params } = props;
    const { slug, addressOrEns, network } = await params;
    const daoId = await daoUtils.resolveDaoId({ addressOrEns, network });

    return (
        <Page.Container>
            <DaoProcessDetailsPageClient slug={slug} daoId={daoId} />
        </Page.Container>
    );
};
