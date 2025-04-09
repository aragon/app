'use client';

import { CreateDaoDialog } from '@/modules/createDao/constants/createDaoDialogId';
import type { ICreateProcessDetailsDialogParams } from '@/modules/createDao/dialogs/createProcessDetailsDialog';
import { useAdminStatus } from '@/plugins/adminPlugin/hooks/useAdminStatus';
import { Banner } from '@/shared/components/banner';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
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

    if (bannerType == null) {
        return null;
    }

    return (
        <Banner message={t(`app.application.bannerDao.${bannerType}.message`)}>
            <div className="flex gap-3">
                {bannerType === 'adminMember' && (
                    <Button size="sm" variant="secondary" onClick={handleBannerActionClick} iconLeft={IconType.PLUS}>
                        {t(`app.application.bannerDao.adminMember.action`)}
                    </Button>
                )}
                {bannerType === 'adminPlugin' && (
                    <Button size="sm" variant="tertiary" href={`/dao/${id}/members`} iconRight={IconType.CHEVRON_RIGHT}>
                        {t(`app.application.bannerDao.adminPlugin.action`)}
                    </Button>
                )}
                {isAdminMember && (
                    <Button href={`/dao/${id}/settings`} size="sm" variant="tertiary">
                        {t('app.application.bannerDao.adminMember.manage')}
                    </Button>
                )}
            </div>
        </Banner>
    );
};
