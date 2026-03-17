import type { IDaoDomainDefinition } from '@/daos/daoDomains';
import { daoSlotUtils } from '@/daos/utils/daoSlotUtils';
import { DashboardDaoSlotId } from '@/modules/dashboard/constants/moduleDaoSlots';
import { AragonDemoPageHeader } from '../components/aragonDemoPageHeader';
import { aragonDemoDao } from './aragonDemo';

const aragonDemoDomainConfigs = [{ plugin: aragonDemoDao }];

export const aragonDemoDomains: IDaoDomainDefinition[] =
    daoSlotUtils.generateDomain({
        configs: aragonDemoDomainConfigs,
        getPlugin: (config) => config.plugin,
        getSlotComponents: () => [
            {
                slotId: DashboardDaoSlotId.DASHBOARD_DAO_HEADER,
                component: AragonDemoPageHeader,
            },
        ],
    });
