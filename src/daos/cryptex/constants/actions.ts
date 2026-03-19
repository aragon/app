import type { IDao } from '@/shared/api/daoService';
import { daoUtils, type IDaoHeaderAction } from '@/shared/utils/daoUtils';

export const getActions = (dao: IDao): IDaoHeaderAction[] => [
    {
        title: 'app.daos.cryptex.cryptexPageHeader.actions.getCtx.title',
        description:
            'app.daos.cryptex.cryptexPageHeader.actions.getCtx.description',
        href: 'https://www.coinbase.com/en-es/price/cryptex-finance',
        isExternal: true,
    },
    {
        title: 'app.daos.cryptex.cryptexPageHeader.actions.stake.title',
        description:
            'app.daos.cryptex.cryptexPageHeader.actions.stake.description',
        href: daoUtils.getDaoUrl(dao, 'members') ?? '',
        isExternal: false,
    },
    {
        title: 'app.daos.cryptex.cryptexPageHeader.actions.govern.title',
        description:
            'app.daos.cryptex.cryptexPageHeader.actions.govern.description',
        href: daoUtils.getDaoUrl(dao, 'proposals') ?? '',
        isExternal: false,
    },
];
