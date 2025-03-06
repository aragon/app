'use client';

import { ExploreCta } from '@/modules/explore/components/exploreCta';
import { ExploreNav } from '@/modules/explore/components/exploreNav';
import { ExploreSection } from '@/modules/explore/components/exploreSection';
import { Hero } from '@/modules/explore/components/hero';
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
            <main className="mx-auto flex max-w-screen-xl flex-col gap-10 px-4 py-10 md:gap-20 md:px-6 md:py-16">
                <ExploreSection title={t('app.explore.exploreDaosPage.sectionTitle')}>
                    <ExploreDaos initialParams={initialParams} />
                </ExploreSection>
                <ExploreSection title={t('app.explore.cta.sectionTitle')}>
                    <ExploreCta />
                </ExploreSection>
            </main>
        </>
    );
};
