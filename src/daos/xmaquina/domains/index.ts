import type { IDaoDomainDefinition } from '@/daos/daoDomains';
import { daoSlotUtils } from '@/daos/utils/daoSlotUtils';
import { DashboardDaoSlotId } from '@/modules/dashboard/constants/moduleDaoSlots';
import { XmaquinaPageHeader } from '../components';
import { xmaquina } from './xmaquinaBase';
import { xmaquinaPeaq } from './xmaquinaPeaq';

const xmaquinaDomainConfigs = [{ plugin: xmaquina }, { plugin: xmaquinaPeaq }];

export const xmaquinaDomains: IDaoDomainDefinition[] =
    daoSlotUtils.generateDomain({
        configs: xmaquinaDomainConfigs,
        getPlugin: (config) => config.plugin,
        getSlotComponents: () => [
            {
                slotId: DashboardDaoSlotId.DASHBOARD_DAO_HEADER,
                component: XmaquinaPageHeader,
            },
        ],
    });
