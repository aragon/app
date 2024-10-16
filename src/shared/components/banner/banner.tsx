'use client';

import type { IBannerProps } from '@/shared/components/banner/banner.api';
import { Container } from '@/shared/components/container';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useBannerContent } from '@/shared/hooks/useBannerContent';
import { Button, Icon, IconType } from '@aragon/ods';

export const Banner: React.FC<IBannerProps> = (props) => {
    const { id } = props;

    const { priorityBannerContent } = useBannerContent({ id });

    const { t } = useTranslations();

    if (!priorityBannerContent) {
        return null;
    }

    const { message, buttonLabel, buttonHref } = priorityBannerContent;

    return (
        <div className="flex w-full bg-warning-100">
            <Container className="flex w-full grow flex-col justify-between gap-3 py-6 lg:flex-row" inset={true}>
                <div className="flex gap-x-3 lg:items-center">
                    <Icon icon={IconType.WARNING} className="mt-1 text-warning-500 lg:mt-0" />
                    <p className="self-start justify-self-start text-warning-800 lg:self-center">{t(message)}</p>
                </div>
                <Button
                    href={buttonHref}
                    variant="tertiary"
                    size="sm"
                    iconRight={IconType.CHEVRON_RIGHT}
                    className="ml-7 max-w-fit shrink-0 lg:ml-0"
                >
                    {t(buttonLabel)}
                </Button>
            </Container>
        </div>
    );
};
