import { Page } from '@/shared/components/page';
import { DaoDashboardPageClient } from './daoDashboardPageClient';

export interface IDaoDashboardPageProps {
    /**
     * DAO page parameters.
     */
    params: { slug: string };
}

export const DaoDashboardPage: React.FC<IDaoDashboardPageProps> = (props) => {
    const { params } = props;

    return (
        <Page.Container>
            <DaoDashboardPageClient slug={params.slug} />
        </Page.Container>
    );
};
