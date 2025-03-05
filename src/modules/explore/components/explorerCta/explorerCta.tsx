'use client';

import { CtaCard } from '@/modules/explore/components/explorerCta/ctaCard';
import { useTranslations } from '@/shared/components/translationsProvider';
import type React from 'react';
import doItYourselfIcon from './doItYourselfIcon.svg';
import enterpriseServiceIcon from './enterpriseServiceIcon.svg';
import noCodeSetupIcon from './noCodeSetup.svg';

export const ExplorerCta: React.FC = () => {
    const { t } = useTranslations();

    return (
        <div className="flex flex-col items-start gap-4 self-stretch md:flex-row md:gap-8">
            <CtaCard
                imgSrc={noCodeSetupIcon as string}
                title={t('app.explore.cta.noCodeSetup.title')}
                subtitle={t('app.explore.cta.noCodeSetup.subtitle')}
                isPrimary={true}
                actionLabel={t('app.explore.cta.noCodeSetup.actionLabel')}
                actionHref={'/'}
            />
            <CtaCard
                imgSrc={enterpriseServiceIcon as string}
                title={t('app.explore.cta.enterpriseService.title')}
                subtitle={t('app.explore.cta.enterpriseService.subtitle')}
                isPrimary={false}
                actionLabel={t('app.explore.cta.enterpriseService.actionLabel')}
                actionHref={'/'}
            />
            <CtaCard
                imgSrc={doItYourselfIcon as string}
                title={t('app.explore.cta.doItYourself.title')}
                subtitle={t('app.explore.cta.doItYourself.subtitle')}
                isPrimary={false}
                actionLabel={t('app.explore.cta.doItYourself.actionLabel')}
                actionHref={'/'}
            />
        </div>
    );
};
