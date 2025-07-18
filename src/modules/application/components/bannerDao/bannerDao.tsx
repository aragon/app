'use client';

import { CreateDaoDialogId } from '@/modules/createDao/constants/createDaoDialogId';
import type { ICreateProcessDetailsDialogParams } from '@/modules/createDao/dialogs/createProcessDetailsDialog';
import { daoMembersPageFilterParam } from '@/modules/governance/pages/daoMembersPage';
import type { IDao } from '@/shared/api/daoService';
import { Banner } from '@/shared/components/banner';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useAdminStatus } from '@/shared/hooks/useAdminStatus';
import { Button, IconType, invariant } from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import { daoUtils } from '../../../../shared/utils/daoUtils';

export interface IBannerDaoProps {
    /**
     * DAO to check admin status for a user.
     */
    dao: IDao;
}

export const BannerDao: React.FC<IBannerDaoProps> = (props) => {
    const { dao } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const { isAdminMember, adminPlugin } = useAdminStatus({ daoId: dao.id, network: dao.network });

    const daoUrl = daoUtils.getDaoUrl(dao)!;

    const handleBannerActionClick = () => {
        invariant(adminPlugin != null, 'BannerDao: admin plugin is expected.');
        const params: ICreateProcessDetailsDialogParams = {
            daoUrl,
            pluginAddress: adminPlugin.address as Hex,
        };
        open(CreateDaoDialogId.CREATE_PROCESS_DETAILS, { params });
    };

    const displayAdminMemberBanner = isAdminMember && process.env.NEXT_PUBLIC_FEATURE_GOVERNANCE_DESIGNER === 'true';

    const bannerType = displayAdminMemberBanner ? 'adminMember' : adminPlugin ? 'adminPlugin' : null;

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
                    <Button
                        size="sm"
                        variant="tertiary"
                        href={`${daoUrl}/members?${daoMembersPageFilterParam}=${adminPlugin!.slug}`}
                        iconRight={IconType.CHEVRON_RIGHT}
                    >
                        {t(`app.application.bannerDao.adminPlugin.action`)}
                    </Button>
                )}
                {isAdminMember && (
                    <Button href={`${daoUrl}/settings`} size="sm" variant="tertiary">
                        {t('app.application.bannerDao.adminMember.manage')}
                    </Button>
                )}
            </div>
        </Banner>
    );
};
