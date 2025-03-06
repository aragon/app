'use client';

import { CreateDaoDialog } from '@/modules/createDao/constants/moduleDialogs';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import Image from 'next/image';
import type { IGetDaoListParams } from '../../api/daoExplorerService';
import { CtaCard } from '../../components/ctaCard';
import { ExploreDaos } from '../../components/exploreDao';
import { ExploreNav } from '../../components/exploreNav';
import { ExploreSection } from '../../components/exploreSection';
import doItYourselfIcon from './icons/doItYourselfIcon.svg';
import enterpriseServiceIcon from './icons/enterpriseServiceIcon.svg';
import Blueprint from './icons/net_bg.svg';
import noCodeSetupIcon from './icons/noCodeSetup.svg';

export interface IExploreDaosPageClientProps {
    /**
     * Initial parameters to use to fetch the list of DAOs.
     */
    initialParams: IGetDaoListParams;
}

export const ExploreDaosPageClient: React.FC<IExploreDaosPageClientProps> = (props) => {
    const { initialParams } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

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
                                {t('app.explore.exploreDaosPage.hero.title')}
                            </h1>
                            <h3 className="text-base font-normal leading-normal text-primary-50 lg:text-xl">
                                {t('app.explore.exploreDaosPage.hero.subtitle')}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            <main className="mx-auto flex max-w-screen-xl flex-col gap-10 px-4 py-10 md:gap-20 md:px-6 md:py-16">
                <ExploreSection title={t('app.explore.exploreDaosPage.section.daos')}>
                    <ExploreDaos initialParams={initialParams} />
                </ExploreSection>
                <ExploreSection title={t('app.explore.exploreDaosPage.section.cta')}>
                    <div className="flex flex-col items-start gap-4 self-stretch md:flex-row md:gap-8">
                        <CtaCard
                            imgSrc={noCodeSetupIcon as string}
                            title={t('app.explore.exploreDaosPage.noCodeSetup.title')}
                            subtitle={t('app.explore.exploreDaosPage.noCodeSetup.subtitle')}
                            isPrimary={true}
                            actionLabel={t('app.explore.exploreDaosPage.noCodeSetup.actionLabel')}
                            actionOnClick={() => open(CreateDaoDialog.CREATE_DAO_DETAILS)}
                        />
                        <CtaCard
                            imgSrc={enterpriseServiceIcon as string}
                            title={t('app.explore.exploreDaosPage.enterpriseService.title')}
                            subtitle={t('app.explore.exploreDaosPage.enterpriseService.subtitle')}
                            isPrimary={false}
                            actionLabel={t('app.explore.exploreDaosPage.enterpriseService.actionLabel')}
                            actionHref="https://www.aragon.org/get-assistance-form"
                        />
                        <CtaCard
                            imgSrc={doItYourselfIcon as string}
                            title={t('app.explore.exploreDaosPage.doItYourself.title')}
                            subtitle={t('app.explore.exploreDaosPage.doItYourself.subtitle')}
                            isPrimary={false}
                            actionLabel={t('app.explore.exploreDaosPage.doItYourself.actionLabel')}
                            actionHref="https://docs.aragon.org/"
                        />
                    </div>
                </ExploreSection>
            </main>
        </>
    );
};
