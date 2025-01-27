'use client';

import { CreateDaoDialog } from '@/modules/createDao/constants/moduleDialogs';
import type { ICreateProcessInfoDialogParams } from '@/modules/createDao/dialogs/createProcessInfoDialog';
import { useMemberExists } from '@/modules/governance/api/governanceService/queries/useMemberExists';
import { Banner } from '@/shared/components/banner';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { Button, IconType } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';

export interface IBannerDaoProps {
    /**
     * ID of the DAO.
     */
    id: string;
}

export const BannerDao: React.FC<IBannerDaoProps> = (props) => {
    const { id } = props;

    const { t } = useTranslations();
    const { address: memberAddress } = useAccount();
    const { open } = useDialogContext();

    const adminPlugin = useDaoPlugins({ daoId: id, subdomain: 'admin' });
    const pluginAddress = adminPlugin?.[0]?.meta?.address;
    const hasAdminPlugin = pluginAddress != null;

    const memberExistsParams = { memberAddress: memberAddress as string, pluginAddress: pluginAddress! };
    const { data: isAdminMember } = useMemberExists(
        { urlParams: memberExistsParams },
        { enabled: memberAddress != null && pluginAddress != null },
    );

    const handleBannerActionClick = () => {
        const params: ICreateProcessInfoDialogParams = { daoId: id };
        open(CreateDaoDialog.CREATE_PROCESS_INFO, { params });
    };

    const displayAdminMemberBanner = isAdminMember && process.env.NEXT_PUBLIC_FEATURE_GOVERNANCE_DESIGNER === 'true';
    const bannerType = displayAdminMemberBanner ? 'adminMember' : hasAdminPlugin ? 'adminPlugin' : null;

    const bannerActionProps = isAdminMember ? { onClick: handleBannerActionClick } : { href: `/dao/${id}/members` };

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
