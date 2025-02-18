'use client';

import { CreateDaoDialog } from '@/modules/createDao/constants/moduleDialogs';
import type { ICreateProcessDetailsDialogParams } from '@/modules/createDao/dialogs/createProcessDetailsDialog';
import { Banner } from '@/shared/components/banner';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useAdminStatus } from '@/shared/hooks/useAdminStatus';
import { Button, IconType } from '@aragon/gov-ui-kit';

export interface IBannerDaoProps {
    /**
     * ID of the DAO.
     */
    id: string;
}

export const BannerDao: React.FC<IBannerDaoProps> = (props) => {
    const { id } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const { isAdminMember, hasAdminPlugin } = useAdminStatus({ daoId: id });

    const handleBannerActionClick = () => {
        const params: ICreateProcessDetailsDialogParams = { daoId: id };
        open(CreateDaoDialog.CREATE_PROCESS_DETAILS, { params });
    };

    const displayAdminMemberBanner = isAdminMember && process.env.NEXT_PUBLIC_FEATURE_GOVERNANCE_DESIGNER === 'true';
    const bannerType = displayAdminMemberBanner ? 'adminMember' : hasAdminPlugin ? 'adminPlugin' : null;

    const bannerActionProps = displayAdminMemberBanner
        ? { onClick: handleBannerActionClick }
        : { href: `/dao/${id}/members` };

    if (bannerType == null) {
        return null;
    }

    return (
        <Banner message={t(`app.application.bannerDao.${bannerType}.message`)}>
            <Button variant="tertiary" size="sm" iconRight={IconType.CHEVRON_RIGHT} {...bannerActionProps}>
                {t(`app.application.bannerDao.${bannerType}.buttonLabel`)}
            </Button>
        </Banner>
    );
};
