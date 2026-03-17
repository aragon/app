import type { IDaoDomainDefinition } from '@/daos/daoDomains';
import { DashboardDaoSlotId } from '@/modules/dashboard/constants/moduleDaoSlots';
import { XmaquinaPageHeader } from '../components';
import { xmaquina } from './xmaquinaBase';
import { xmaquinaPeaq } from './xmaquinaPeaq';

export const xmaquinaDomains: IDaoDomainDefinition[] = [
    {
        plugin: xmaquina,
        slotComponents: [
            {
                slotId: DashboardDaoSlotId.DASHBOARD_DAO_HEADER,
                component: XmaquinaPageHeader,
            },
        ],
    },
    {
        plugin: xmaquinaPeaq,
        slotComponents: [
            {
                slotId: DashboardDaoSlotId.DASHBOARD_DAO_HEADER,
                component: XmaquinaPageHeader,
            },
        ],
    },
];
