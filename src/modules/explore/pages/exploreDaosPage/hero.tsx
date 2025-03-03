'use client';

import { useTranslations } from '@/shared/components/translationsProvider';
import Blueprint from './net_bg.svg';

const Hero = () => {
    const { t } = useTranslations();

    return <Hero2 />;

    return (
        <div className="relative -mt-20 overflow-hidden bg-primary-400 pt-20 xl:-mt-24 xl:pt-24">
            <img
                src={Blueprint.src}
                alt="Background Texture"
                className="absolute left-0 top-0 h-full w-full object-cover"
            />
            <div className="mx-4 grid grid-cols-4 gap-x-4 gap-y-4 md:mx-6 md:grid-cols-8 xl:mx-10 xl:grid-cols-12 xl:gap-x-6 xl:gap-y-6 2xl:mx-auto 2xl:w-[1520px] 2xl:gap-x-8 2xl:gap-y-8">
                <div className="relative col-start-1 col-end-12 flex w-full xl:col-start-2">
                    <div className="flex max-w-[720px] flex-col space-y-4 py-16">
                        <h1 className="text-neutral-0 ft-text-5xl" style={{ letterSpacing: '-2.4%' }}>
                            {t('explore.hero.title')}
                        </h1>
                        <h3 className="font-normal leading-[24px] text-neutral-0 ft-text-lg xl:leading-[30px]">
                            {t('explore.hero.subtitle1')}
                        </h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;

function Hero2() {
    const { t } = useTranslations();

    return (
        <div className="relative -mt-[72px] flex flex-col items-center self-stretch bg-primary-400 pt-[72px] xl:-mt-24 xl:pt-24">
            <div className="mx-auto w-full max-w-screen-xl">
                {/* Background Image */}
                <img
                    src={Blueprint.src}
                    alt="Background Texture"
                    // className="absolute right-0 top-[-412px] h-[1178.485px] w-[1440px]"
                    className="absolute left-0 top-0 size-full object-cover"
                />
                {/* Wrapper*/}
                <div className="relative flex max-w-screen-xl flex-col items-start justify-center gap-2 self-stretch px-4 py-10 xl:px-6 xl:py-16">
                    {/* Content Group*/}
                    <div className="flex max-w-[720px] flex-col items-start gap-2 self-stretch xl:gap-4">
                        <h1 className="self-stretch text-2xl font-normal leading-[115%] tracking-[-0.576px] text-primary-50 xl:text-5xl xl:tracking-[-1.152px]">
                            {/*{t('explore.hero.title')}*/}
                            Governed on Aragon
                        </h1>

                        <h3 className="text-base font-normal leading-[150%] text-primary-50 xl:text-xl">
                            {/*{t('explore.hero.subtitle')}*/}
                            Explore the organizations using our modular governance stack to secure their onchain
                            governance.
                        </h3>
                    </div>
                </div>
            </div>
        </div>
    );
}
