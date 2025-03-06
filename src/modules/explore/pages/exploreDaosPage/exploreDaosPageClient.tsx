'use client';

import { useTranslations } from '@/shared/components/translationsProvider';
import Image from 'next/image';
import type { IGetDaoListParams } from '../../api/daoExplorerService';
import { ExploreCta } from '../../components/exploreCta';
import { ExploreDaos } from '../../components/exploreDao';
import { ExploreNav } from '../../components/exploreNav';
import { ExploreSection } from '../../components/exploreSection';
import Blueprint from './net_bg.svg';

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
            <div
                id="explore-page-hero"
                className="relative mt-[-72px] flex flex-col items-center self-stretch bg-primary-400 pt-[72px] lg:-mt-24 lg:pt-24"
            >
                <div className="mx-auto w-full max-w-screen-xl">
                    <Image
                        src={Blueprint as string}
                        alt="Background Texture"
                        className="absolute left-0 top-0 size-full object-cover"
                        priority={true}
                    />

                    <div className="relative flex max-w-screen-xl flex-col items-start justify-center gap-2 self-stretch px-4 py-10 lg:px-6 lg:py-12">
                        <div className="flex max-w-[720px] flex-col items-start gap-2 self-stretch lg:gap-3">
                            <h1 className="text-2xl font-normal leading-tight text-neutral-0 lg:text-3xl">
                                {t('app.explore.hero.title')}
                            </h1>
                            <h3 className="text-base font-normal leading-normal text-primary-50 lg:text-xl">
                                {t('app.explore.hero.subtitle')}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

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
