'use client';

import { Heading } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { CreateDaoDialogId } from '@/modules/createDao/constants/createDaoDialogId';
import { useFeaturedDaos } from '@/shared/api/cmsService';
import { Carousel } from '@/shared/components/carousel';
import { Container } from '@/shared/components/container';
import { CtaCard } from '@/shared/components/ctaCard';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
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
    const router = useRouter();
    const { isEnabled } = useFeatureFlags();

    return (
        <>
            <ExploreNav />
            <div
                // biome-ignore lint/plugin/noPrimitiveSpacing: explore hero pulled up by the header height, and its section paddings: no role has them
                className="relative mt-[-72px] flex flex-col items-center self-stretch bg-brand-solid pt-[72px] md:-mt-24 md:pt-24"
                id="explore-page-hero"
            >
                {/* biome-ignore lint/plugin/noPrimitiveSpacing: explore hero pulled up by the header height, and its section paddings: no role has them */}
                <Container className="w-full py-10 md:px-6 md:py-12">
                    <Image
                        alt="Background Texture"
                        className="absolute top-0 left-0 size-full object-cover"
                        priority={true}
                        src={NetBackground as string}
                    />

                    <div className="relative flex flex-col items-start justify-center gap-related--fixed-8 self-stretch">
                        <div className="flex max-w-[720px] flex-col items-start gap-related--8-12 self-stretch">
                            <h1 className="type-display text-accent-inverse">
                                {t('app.explore.exploreDaosPage.hero.title')}
                            </h1>
                            <h3 className="type-body--explore-hero text-accent-inverse-brand">
                                {t('app.explore.exploreDaosPage.hero.subtitle')}
                            </h3>
                        </div>
                    </div>
                </Container>
            </div>

            {featuredDaos && (
                <section
                    className={classNames(
                        // biome-ignore lint/plugin/noPrimitiveSpacing: explore hero pulled up by the header height, and its section paddings: no role has them
                        'flex flex-col gap-group-stepped pt-10 md:pt-16',
                    )}
                >
                    <Container className="w-full">
                        <Heading
                            as="h2"
                            className="self-stretch"
                            typeClassName="type-title-section--explore"
                        >
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
                                // biome-ignore lint/suspicious/noArrayIndexKey: CMS entries have no id and are never reordered
                                <DaoCarouselCard key={index} {...dao} />
                            ))}
                        </Carousel>
                    </div>
                </section>
            )}

            {/* biome-ignore lint/plugin/noPrimitiveSpacing: explore hero pulled up by the header height, and its section paddings: no role has them */}
            <Container className="py-10 pb-16 md:px-6 md:py-20">
                <main className="flex flex-col gap-layout">
                    <ExploreSection
                        title={t('app.explore.exploreDaosPage.section.cta')}
                    >
                        <div
                            className={classNames(
                                'grid grid-cols-1 gap-group self-stretch md:grid-cols-2 lg:gap-section--fixed-32',
                                isEnabled('workspaces')
                                    ? 'xl:grid-cols-4'
                                    : 'lg:grid-cols-3',
                            )}
                        >
                            <CtaCard
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
                                description={t(
                                    'app.explore.exploreDaosPage.noCodeSetup.subtitle',
                                )}
                                isPrimary={false}
                                objectType="APP"
                                primaryAction={{
                                    label: t(
                                        'app.explore.exploreDaosPage.noCodeSetup.actionLabel',
                                    ),
                                    onClick: () => {
                                        open(
                                            CreateDaoDialogId.CREATE_DAO_DETAILS,
                                        );
                                    },
                                }}
                                textSize="smaller"
                                title={t(
                                    'app.explore.exploreDaosPage.noCodeSetup.title',
                                )}
                            />
                            {isEnabled('workspaces') && (
                                <CtaCard
                                    description={t(
                                        'app.explore.exploreDaosPage.createWorkspace.subtitle',
                                    )}
                                    isPrimary={false}
                                    objectType="CHAIN"
                                    primaryAction={{
                                        label: t(
                                            'app.explore.exploreDaosPage.createWorkspace.actionLabel',
                                        ),
                                        onClick: () => {
                                            router.push('/create/workspace');
                                        },
                                    }}
                                    textSize="smaller"
                                    title={t(
                                        'app.explore.exploreDaosPage.createWorkspace.title',
                                    )}
                                />
                            )}
                            <CtaCard
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
