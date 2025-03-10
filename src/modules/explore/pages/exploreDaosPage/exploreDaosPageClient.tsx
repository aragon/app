'use client';

import { CreateDaoDialog } from '@/modules/createDao/constants/moduleDialogs';
import { Container } from '@/shared/components/container';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { DaoDataListItem } from '@aragon/gov-ui-kit';
import Image from 'next/image';
import type { IGetDaoListParams } from '../../api/daoExplorerService';
import { CtaCard } from '../../components/ctaCard';
import { DaoCarousel, featuredDaos } from '../../components/daoCarousel';
import { ExploreDaos } from '../../components/exploreDao';
import { ExploreNav } from '../../components/exploreNav';
import { ExploreSection } from '../../components/exploreSection';
import doItYourselfIcon from './icons/doItYourselfIcon.svg';
import enterpriseServiceIcon from './icons/enterpriseServiceIcon.svg';
import NetBackground from './icons/net_bg.svg';
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
                className="relative mt-[-72px] flex flex-col items-center self-stretch bg-primary-400 pt-[72px] md:-mt-24 md:pt-24"
            >
                <Container className="w-full py-10 md:px-6 md:py-12">
                    <Image
                        src={NetBackground as string}
                        alt="Background Texture"
                        className="absolute left-0 top-0 size-full object-cover"
                        priority={true}
                    />

                    <div className="relative flex flex-col items-start justify-center gap-2 self-stretch">
                        <div className="flex max-w-[720px] flex-col items-start gap-2 self-stretch md:gap-3">
                            <h1 className="text-2xl font-normal leading-tight text-neutral-0 md:text-3xl">
                                {t('app.explore.exploreDaosPage.hero.title')}
                            </h1>
                            <h3 className="text-base font-normal leading-normal text-primary-50 md:text-xl">
                                {t('app.explore.exploreDaosPage.hero.subtitle')}
                            </h3>
                        </div>
                    </div>
                </Container>
            </div>

            <Container className="py-10 pb-16 md:px-6 md:py-16 md:pb-20">
                <main className="flex flex-col gap-10 md:gap-20">
                    <ExploreSection title={t('app.explore.exploreDaosPage.section.featured')}>
                        <div className="mx-auto max-w-screen-xl px-4">
                            <DaoCarousel speed={50} gap={24}>
                                {featuredDaos.map((dao, index) => {
                                    return (
                                        <div key={dao.daoAddress} className="pointer-events-none max-w-52">
                                            <DaoDataListItem.Structure
                                                key={index}
                                                href={`/dao/${dao.daoAddress}/dashboard`}
                                                address={dao.daoAddress}
                                                name={dao.name}
                                                description={dao.description}
                                                network={dao.network}
                                                logoSrc={ipfsUtils.cidToSrc(dao.logo)}
                                            />
                                            <button className="pointer-events-auto" onClick={() => prompt('HELLO')}>
                                                Helloe
                                            </button>
                                        </div>
                                    );
                                })}
                            </DaoCarousel>
                        </div>
                    </ExploreSection>
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
            </Container>
        </>
    );
};
