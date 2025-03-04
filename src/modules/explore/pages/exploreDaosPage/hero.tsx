'use client';

import { Image } from '@/shared/components/image';
import { useTranslations } from '@/shared/components/translationsProvider';
import Blueprint from './net_bg.svg';

export const Hero = () => {
    const { t } = useTranslations();

    return (
        <div className="relative mt-[-72px] flex flex-col items-center self-stretch bg-primary-400 pt-[72px] lg:-mt-24 lg:pt-24">
            <div className="mx-auto w-full max-w-screen-xl">
                {/* Background Image */}
                <Image
                    src={Blueprint as string}
                    alt="Background Texture"
                    // className="absolute right-0 top-[-412px] h-[1178.485px] w-[1440px]"
                    className="absolute left-0 top-0 size-full object-cover"
                />
                {/* Wrapper*/}
                <div className="relative flex max-w-screen-xl flex-col items-start justify-center gap-2 self-stretch px-4 py-10 lg:px-6 lg:py-16">
                    {/* Content Group*/}
                    <div className="flex max-w-[720px] flex-col items-start gap-2 self-stretch lg:gap-4">
                        <h1 className="self-stretch text-2xl font-normal leading-[115%] tracking-[-0.576px] text-primary-50 lg:text-5xl lg:tracking-[-1.152px]">
                            {/*{t('explore.hero.title')}*/}
                            Governed on Aragon
                        </h1>

                        <h3 className="text-base font-normal leading-[150%] text-primary-50 lg:text-xl">
                            {/*{t('explore.hero.subtitle')}*/}
                            Explore the organizations using our modular governance stack to secure their onchain
                            governance.
                        </h3>
                    </div>
                </div>
            </div>
        </div>
    );
};
