'use client';

import type { IBannerProps } from '@/shared/components/banner/banner.api';
import { Container } from '@/shared/components/container';
import { useBannerContent } from '@/shared/hooks/useBannerContent/useBannerContent';
import { Button, Icon, IconType } from '@aragon/ods';

export const Banner: React.FC<IBannerProps> = (props) => {
    const { id } = props;
    const { bannerContent } = useBannerContent({ id });

    if (!bannerContent) {
        return null;
    }

    const { message, buttonLabel, href } = bannerContent;

    return (
        <div className="w-full">
            <div className="flex w-full bg-warning-100">
                <Container className="flex w-full grow flex-col justify-between gap-3 py-6 md:!px-6 lg:flex-row lg:!px-10 xl:!px-20">
                    <div className="flex gap-x-3 lg:items-center">
                        <Icon icon={IconType.WARNING} className="mt-1 text-warning-500 lg:mt-0" />
                        <p className="self-start justify-self-start text-warning-800 lg:self-center">{message}</p>
                    </div>
                    <Button
                        href={href}
                        variant="tertiary"
                        size="sm"
                        iconRight={IconType.CHEVRON_RIGHT}
                        className="ml-7 max-w-fit shrink-0 lg:ml-0"
                    >
                        {buttonLabel}
                    </Button>
                </Container>
            </div>
        </div>
    );
};
