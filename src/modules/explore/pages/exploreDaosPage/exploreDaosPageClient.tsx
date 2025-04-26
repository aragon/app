'use client';

import { CreateDaoDialogId } from '@/modules/createDao/constants/createDaoDialogId';
import { Carousel } from '@/shared/components/carousel';
import { Container } from '@/shared/components/container';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Heading } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import Image from 'next/image';
import doItYourselfIcon from '../../../../assets/images/doItYourselfIcon.svg';
import enterpriseServiceIcon from '../../../../assets/images/enterpriseServiceIcon.svg';
import NetBackground from '../../../../assets/images/net_bg.svg';
import noCodeSetupIcon from '../../../../assets/images/noCodeSetup.svg';
import { useFeaturedDaos } from '../../api/cmsService';
import type { IGetDaoListParams } from '../../api/daoExplorerService';
import { CtaCard } from '../../components/ctaCard';
import { DaoCarouselCard } from '../../components/daoCarouselCard';
import { ExploreDaos } from '../../components/exploreDao';
import { ExploreNav } from '../../components/exploreNav';
import { ExploreSection } from '../../components/exploreSection';

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
    const { data: featuredDaos } = useFeaturedDaos();

    return (
        <>
            <ExploreNav />
            <div
                id="explore-page-hero"
                className="bg-primary-400 relative mt-[-72px] flex flex-col items-center self-stretch pt-[72px] md:-mt-24 md:pt-24"
            >
                <Container className="w-full py-10 md:px-6 md:py-12">
                    <Image
                        src={NetBackground as string}
                        alt="Background Texture"
                        className="absolute top-0 left-0 size-full object-cover"
                        priority={true}
                    />

                    <div className="relative flex flex-col items-start justify-center gap-2 self-stretch">
                        <div className="flex max-w-[720px] flex-col items-start gap-2 self-stretch md:gap-3">
                            <h1 className="text-neutral-0 text-3xl leading-tight font-normal md:text-5xl">
                                {t('app.explore.exploreDaosPage.hero.title')}
                            </h1>
                            <h3 className="text-primary-50 text-lg leading-normal font-normal md:text-2xl">
                                {t('app.explore.exploreDaosPage.hero.subtitle')}
                            </h3>
                        </div>
                    </div>
                </Container>
            </div>

            {featuredDaos && (
                <section className={classNames('flex flex-col gap-4 pt-10 md:gap-6 md:pt-16')}>
                    <Container className="w-full">
                        <Heading size="h1" as="h2" className="self-stretch">
                            {t('app.explore.exploreDaosPage.section.featured')}
                        </Heading>
                    </Container>
                    <div className="w-full">
                        <Carousel speed={40} speedOnHoverFactor={0.2} animationDelay={2} gap={16}>
                            {featuredDaos.map((dao, index) => (
                                <DaoCarouselCard key={index} {...dao} />
                            ))}
                        </Carousel>
                    </div>
                </section>
            )}

            <Container className="py-10 pb-16 md:px-6 md:py-20">
                <main className="flex flex-col gap-10 md:gap-20">
                    <ExploreSection title={t('app.explore.exploreDaosPage.section.daos')}>
                        <ExploreDaos initialParams={initialParams} />
                    </ExploreSection>
                    <ExploreSection title={t('app.explore.exploreDaosPage.section.cta')}>
                        <div className="flex flex-col items-start gap-4 self-stretch md:flex-row md:gap-4 lg:gap-8">
                            <CtaCard
                                imgSrc={noCodeSetupIcon as string}
                                title={t('app.explore.exploreDaosPage.noCodeSetup.title')}
                                subtitle={t('app.explore.exploreDaosPage.noCodeSetup.subtitle')}
                                isPrimary={true}
                                actionLabel={t('app.explore.exploreDaosPage.noCodeSetup.actionLabel')}
                                actionOnClick={() => open(CreateDaoDialogId.CREATE_DAO_DETAILS)}
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
            </Container>
        </>
    );
};
