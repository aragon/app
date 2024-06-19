import { Page } from '@/shared/components/page';
import type { IDaoPageParams } from '@/shared/types';
import { DaoDashboardPageClient } from './daoDashboardPageClient';

export interface IDaoDashboardPageProps {
    /**
     * DAO page parameters.
     */
    params: IDaoPageParams;
}

export const DaoDashboardPage: React.FC<IDaoDashboardPageProps> = (props) => {
    const { params } = props;

    return (
        <Page.Container>
            <DaoDashboardPageClient id={params.id} />
        </Page.Container>
    );
};
