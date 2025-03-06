'use client';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Heading } from '@aragon/gov-ui-kit';
import type React from 'react';
import { type ComponentProps } from 'react';

export interface IExploreSectionProps extends ComponentProps<'section'> {
    /**
     * Title of the section.
     * Translation key, not the actual text - to avoid turning whole ExplorePage into a client component.
     */
    titleKey: string;
}

export const ExploreSection: React.FC<IExploreSectionProps> = ({ children, titleKey }) => {
    const { t } = useTranslations();

    return (
        <section>
            <Heading size="h1" as="h2" className="mb-4 xl:mb-6">
                {t(titleKey)}
            </Heading>
            {children}
        </section>
    );
};
