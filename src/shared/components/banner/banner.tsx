'use client';

import { Container } from '@/shared/components/container';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, Icon, IconType } from '@aragon/gov-ui-kit';
import { useBannerContent } from './useBannerContent';

export interface IBannerProps {
    /**
     * ID of the DAO.
     */
    id: string;
}

export const Banner: React.FC<IBannerProps> = (props) => {
    const { id } = props;

    const { t } = useTranslations();

    const bannerContent = useBannerContent({ id });

    if (bannerContent == null) {
        return null;
    }

    return (
        <div className="flex w-full bg-warning-100">
            <Container className="flex w-full grow flex-col justify-between gap-3 py-6 lg:flex-row" inset={true}>
                <div className="flex gap-x-3 lg:items-center">
                    <Icon icon={IconType.WARNING} className="mt-1 text-warning-500 lg:mt-0" />
                    <p className="place-self-start text-warning-800 lg:self-center">
                        {t(`app.shared.banner.${bannerContent.type}.message`)}
                    </p>
                </div>
                <Button
                    href={bannerContent.getButtonLink(id)}
                    variant="tertiary"
                    size="sm"
                    iconRight={IconType.CHEVRON_RIGHT}
                    className="ml-7 max-w-fit shrink-0 lg:ml-0"
                >
                    {t(`app.shared.banner.${bannerContent.type}.buttonLabel`)}
                </Button>
            </Container>
        </div>
    );
};
