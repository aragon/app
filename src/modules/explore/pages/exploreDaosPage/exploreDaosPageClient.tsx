'use client';

import { ExploreCta } from '@/modules/explore/components/exploreCta';
import { ExploreNav } from '@/modules/explore/components/exploreNav';
import { ExploreSection } from '@/modules/explore/components/exploreSection';
import { Hero } from '@/modules/explore/components/hero';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IGetDaoListParams } from '../../api/daoExplorerService';
import { ExploreDaos } from '../../components/exploreDao';

export interface IExploreDaosPageClientProps {
    /**
     * Initial parameters to use to fetch the list of DAOs.
     */
    initialParams: IGetDaoListParams;
}

export const ExploreDaosPageClient: React.FC<IExploreDaosPageClientProps> = (props) => {
    const { initialParams } = props;

    const { t } = useTranslations();

    return (
        <>
            <ExploreNav />
            <Hero />
            <Page.Content className="!px-4 !py-10 xl:!px-6 xl:!py-16">
                <Page.Main className="!gap-10 xl:gap-20">
                    <ExploreSection title={t('app.explore.featured.sectionTitle')}>
                        Featured DAOs Carousel
                    </ExploreSection>
                    <ExploreSection title={t('app.explore.exploreDaosPage.sectionTitle')}>
                        <ExploreDaos initialParams={initialParams} />
                    </ExploreSection>
                    <ExploreSection title={t('app.explore.cta.sectionTitle')}>
                        <ExploreCta />
                    </ExploreSection>
                </Page.Main>
            </Page.Content>
        </>
    );
};
