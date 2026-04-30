'use client';

import { Heading } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import Image from 'next/image';
import { Suspense } from 'react';
import { CreateDaoDialogId } from '@/modules/createDao/constants/createDaoDialogId';
import { useFeaturedDaos } from '@/shared/api/cmsService';
import { Carousel } from '@/shared/components/carousel';
import { Container } from '@/shared/components/container';
import { CtaCard } from '@/shared/components/ctaCard';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import NetBackground from '../../../../assets/images/net_bg.svg';
import type { IGetDaoListParams } from '../../api/daoExplorerService';
import { DaoCarouselCard } from '../../components/daoCarouselCard';
import { ExploreDaos } from '../../components/exploreDaos';
import { ExploreNav } from '../../components/exploreNav';
import { ExploreSection } from '../../components/exploreSection';

export const exploreDaosSectionId = 'explore-daos-section';

export interface IExploreDaosPageClientProps {
    /**
     * Initial parameters to use to fetch the list of DAOs.
     */
    initialParams: IGetDaoListParams;
}

export const ExploreDaosPageClient: React.FC<IExploreDaosPageClientProps> = (
    props,
) => {
    const { initialParams } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { data: featuredDaos } = useFeaturedDaos();

    return (
        <>
            <ExploreNav />
            <div
                className="relative mt-[-72px] flex flex-col items-center self-stretch bg-primary-400 pt-[72px] md:-mt-24 md:pt-24"
                id="explore-page-hero"
            >
                <Container className="w-full py-10 md:px-6 md:py-12">
                    <Image
                        alt="Background Texture"
                        className="absolute top-0 left-0 size-full object-cover"
                        priority={true}
                        src={NetBackground as string}
                    />

                    <div className="relative flex flex-col items-start justify-center gap-2 self-stretch">
                        <div className="flex max-w-[720px] flex-col items-start gap-2 self-stretch md:gap-3">
                            <h1 className="font-normal text-3xl text-neutral-0 leading-tight md:text-5xl">
                                {t('app.explore.exploreDaosPage.hero.title')}
                            </h1>
                            <h3 className="font-normal text-lg text-primary-50 leading-normal md:text-2xl">
                                {t('app.explore.exploreDaosPage.hero.subtitle')}
                            </h3>
                        </div>
                    </div>
                </Container>
            </div>

            {featuredDaos && (
                <section
                    className={classNames(
                        'flex flex-col gap-4 pt-10 md:gap-6 md:pt-16',
                    )}
                >
                    <Container className="w-full">
                        <Heading as="h2" className="self-stretch" size="h1">
                            {t('app.explore.exploreDaosPage.section.featured')}
                        </Heading>
                    </Container>
                    <div className="w-full">
                        <Carousel
                            animationDelay={2}
                            gap={16}
                            speed={40}
                            speedOnHoverFactor={0.2}
                        >
                            {featuredDaos.map((dao, index) => (
                                <DaoCarouselCard key={index} {...dao} />
                            ))}
                        </Carousel>
                    </div>
                </section>
            )}

            <Container className="py-10 pb-16 md:px-6 md:py-20">
                <main className="flex flex-col gap-10 md:gap-20">
                    <ExploreSection
                        title={t('app.explore.exploreDaosPage.section.cta')}
                    >
                        <div className="flex flex-col gap-4 self-stretch md:flex-row md:gap-4 lg:gap-8">
                            <CtaCard
                                className="flex-1"
                                description={t(
                                    'app.explore.exploreDaosPage.enterpriseService.subtitle',
                                )}
                                isPrimary={true}
                                objectType="SMART_CONTRACT"
                                primaryAction={{
                                    href: 'https://www.aragon.org/get-assistance-form',
                                    label: t(
                                        'app.explore.exploreDaosPage.enterpriseService.actionLabel',
                                    ),
                                }}
                                tag={t(
                                    'app.explore.exploreDaosPage.enterpriseService.tag',
                                )}
                                textSize="smaller"
                                title={t(
                                    'app.explore.exploreDaosPage.enterpriseService.title',
                                )}
                            />
                            <CtaCard
                                className="flex-1"
                                description={t(
                                    'app.explore.exploreDaosPage.noCodeSetup.subtitle',
                                )}
                                isPrimary={false}
                                objectType="APP"
                                primaryAction={{
                                    label: t(
                                        'app.explore.exploreDaosPage.noCodeSetup.actionLabel',
                                    ),
                                    onClick: () =>
                                        open(
                                            CreateDaoDialogId.CREATE_DAO_DETAILS,
                                        ),
                                }}
                                textSize="smaller"
                                title={t(
                                    'app.explore.exploreDaosPage.noCodeSetup.title',
                                )}
                            />
                            <CtaCard
                                className="flex-1"
                                description={t(
                                    'app.explore.exploreDaosPage.doItYourself.subtitle',
                                )}
                                isPrimary={false}
                                objectType="BOOK"
                                primaryAction={{
                                    href: 'https://docs.aragon.org/',
                                    label: t(
                                        'app.explore.exploreDaosPage.doItYourself.actionLabel',
                                    ),
                                }}
                                textSize="smaller"
                                title={t(
                                    'app.explore.exploreDaosPage.doItYourself.title',
                                )}
                            />
                        </div>
                    </ExploreSection>
                    <ExploreSection
                        id={exploreDaosSectionId}
                        title={t('app.explore.exploreDaosPage.section.daos')}
                    >
                        <Suspense fallback={null}>
                            <ExploreDaos initialParams={initialParams} />
                        </Suspense>
                    </ExploreSection>
                </main>
            </Container>
        </>
    );
};
