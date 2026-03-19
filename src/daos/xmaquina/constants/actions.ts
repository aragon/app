import type { IDao } from '@/shared/api/daoService';
import { daoUtils, type IDaoHeaderAction } from '@/shared/utils/daoUtils';
import ClaimIcon from '../assets/xmaquina_claim.svg';
import GovernIcon from '../assets/xmaquina_govern.svg';
import StakeIcon from '../assets/xmaquina_stake.svg';

export const getActions = (dao: IDao): IDaoHeaderAction[] => [
    {
        title: 'app.daos.xmaquina.xmaquinaPageHeader.actions.stake.title',
        description:
            'app.daos.xmaquina.xmaquinaPageHeader.actions.stake.description',
        image: StakeIcon as string,
        href: 'https://dao.xmaquina.io/stake',
        isExternal: true,
    },
    {
        title: 'app.daos.xmaquina.xmaquinaPageHeader.actions.govern.title',
        description:
            'app.daos.xmaquina.xmaquinaPageHeader.actions.govern.description',
        image: GovernIcon as string,
        href: daoUtils.getDaoUrl(dao, 'proposals') ?? '',
        isExternal: false,
    },
    {
        title: 'app.daos.xmaquina.xmaquinaPageHeader.actions.claim.title',
        description:
            'app.daos.xmaquina.xmaquinaPageHeader.actions.claim.description',
        image: ClaimIcon as string,
        href: 'https://genesis.xmaquina.io/',
        isExternal: true,
    },
];
