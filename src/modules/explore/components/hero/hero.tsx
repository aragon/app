'use client';

import { useTranslations } from '@/shared/components/translationsProvider';
import Image from 'next/image';
import Blueprint from './net_bg.svg';

export const Hero = () => {
    const { t } = useTranslations();

    return (
        <div
            id="explore-page-hero"
            className="relative mt-[-72px] flex flex-col items-center self-stretch bg-primary-400 pt-[72px] lg:-mt-24 lg:pt-24"
        >
            <div className="mx-auto w-full max-w-screen-xl">
                {/* Background Image */}
                <Image
                    src={Blueprint as string}
                    alt="Background Texture"
                    className="absolute left-0 top-0 size-full object-cover"
                    priority={true}
                />
                {/* Wrapper*/}
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
    );
};
