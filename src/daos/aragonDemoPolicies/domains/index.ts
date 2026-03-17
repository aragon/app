import type { IDaoDomainDefinition } from '@/daos/daoDomains';
import { daoSlotUtils } from '@/daos/utils/daoSlotUtils';
import { DashboardDaoSlotId } from '@/modules/dashboard/constants/moduleDaoSlots';
import { AragonDemoPoliciesPageHeader } from '../components/aragonDemoPoliciesPageHeader';
import { aragonDemoDaoPolicies } from './aragonDemoPolicies';

const aragonDemoPoliciesDomainConfigs = [{ plugin: aragonDemoDaoPolicies }];

export const aragonDemoPoliciesDomains: IDaoDomainDefinition[] =
    daoSlotUtils.generateDomain({
        configs: aragonDemoPoliciesDomainConfigs,
        getPlugin: (config) => config.plugin,
        getSlotComponents: () => [
            {
                slotId: DashboardDaoSlotId.DASHBOARD_DAO_HEADER,
                component: AragonDemoPoliciesPageHeader,
            },
        ],
    });
