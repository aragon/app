import { Page } from '@/shared/components/page';
import { QueryClient } from '@tanstack/react-query';
import { daoListOptions } from '../../api/daoExplorerService';
import { ExploreNav } from '../../components/exploreNav';
import { Hero } from '../../components/hero';
import { Section } from '../../components/section';
import { ExploreDaosPageClient } from './exploreDaosPageClient';

export interface IExploreDaosPageProps {}

const daosPerPage = 20;

export const ExploreDaosPage: React.FC<IExploreDaosPageProps> = async () => {
    const queryClient = new QueryClient();

    const daoListQueryParams = { pageSize: daosPerPage, page: 1, sort: 'metrics.tvlUSD' };
    const daoListParams = { queryParams: daoListQueryParams };
    await queryClient.prefetchInfiniteQuery(daoListOptions(daoListParams));

    return (
        <Page.Container queryClient={queryClient}>
            <ExploreNav />
            <Hero />
            <Page.Content className="!px-4 !py-10 xl:!px-6 xl:!py-16">
                <Page.Main className="!gap-10 xl:gap-20">
                    <Section title="Featured">Featured DAOs Carousel</Section>
                    <Section title="Explore">
                        <ExploreDaosPageClient initialParams={daoListParams} />
                    </Section>
                    <Section title="Getting Started">
                        <p>Getting Started section</p>
                    </Section>
                </Page.Main>
            </Page.Content>
        </Page.Container>
    );
};
