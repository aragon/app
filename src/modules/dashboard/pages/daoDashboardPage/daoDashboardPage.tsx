import { Page } from '@/shared/components/page';
import { DaoDashboardPageContent } from './daoDashboardPageContent';

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
            <DaoDashboardPageContent slug={params.slug} />
        </Page.Container>
    );
};
