import type { IAsset } from '@/modules/finance/api/financeService';
import type { IDao } from '@/shared/api/daoService';

export interface IGaugeRewardMembersFileDownloadProps {
    /**
     * DAO to display in the header.
     */
    dao: IDao;
    /**
     * Asset selected in the campaign creation form, passed via PluginSingleComponent.
     */
    asset?: IAsset;
}
