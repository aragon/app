import type { IDaoDomainDefinition } from '@/daos/daoDomains';
import { daoSlotUtils } from '@/daos/utils/daoSlotUtils';
import { DashboardDaoSlotId } from '@/modules/dashboard/constants/moduleDaoSlots';
import { BoundlessPageHeader } from '../components/boundlessPageHeader';
import { boundless } from './boundless';

const boundlessDomainConfigs = [{ plugin: boundless }];

export const boundlessDomains: IDaoDomainDefinition[] =
    daoSlotUtils.generateDomain({
        configs: boundlessDomainConfigs,
        getPlugin: (config) => config.plugin,
        getSlotComponents: () => [
            {
                slotId: DashboardDaoSlotId.DASHBOARD_DAO_HEADER,
                component: BoundlessPageHeader,
            },
        ],
    });
