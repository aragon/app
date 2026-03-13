import type { Network } from '@/shared/api/daoService';
import ClaimIcon from '../assets/xmaquina_claim.svg';
import GovernIcon from '../assets/xmaquina_govern.svg';
import StakeIcon from '../assets/xmaquina_stake.svg';

export const getActions = (network: Network, address: string) => [
    {
        title: 'app.daos.xmaquina.xmaquinaPageHeader.actions.stake.title',
        description:
            'app.daos.xmaquina.xmaquinaPageHeader.actions.stake.description',
        icon: StakeIcon as string,
        href: 'https://dao.xmaquina.io/stake',
        isExternal: true,
    },
    {
        title: 'app.daos.xmaquina.xmaquinaPageHeader.actions.govern.title',
        description:
            'app.daos.xmaquina.xmaquinaPageHeader.actions.govern.description',
        icon: GovernIcon as string,
        href: `/dao/${network}/${address}/proposals`,
        isExternal: false,
    },
    {
        title: 'app.daos.xmaquina.xmaquinaPageHeader.actions.claim.title',
        description:
            'app.daos.xmaquina.xmaquinaPageHeader.actions.claim.description',
        icon: ClaimIcon as string,
        href: 'https://genesis.xmaquina.io/',
        isExternal: true,
    },
];
