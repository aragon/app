import ClaimIcon from '../assets/xmaquina_claim.svg';
import GovernIcon from '../assets/xmaquina_govern.svg';
import StakeIcon from '../assets/xmaquina_stake.svg';

export const actions = [
    {
        title: 'app.daos.xmaquina.xmaquinaPageHeader.actions.stake.title',
        description: 'app.daos.xmaquina.xmaquinaPageHeader.actions.stake.description',
        icon: StakeIcon,
        href: 'https://genesis.xmaquina.io/stake',
        isExternal: true,
    },
    {
        title: 'app.daos.xmaquina.xmaquinaPageHeader.actions.govern.title',
        description: 'app.daos.xmaquina.xmaquinaPageHeader.actions.govern.description',
        icon: GovernIcon,
        href: '/dao/base-mainnet/0xfEA21e0500022F34dE0a02Ae3A7D04dF923Ed020/proposals',
        isExternal: false,
    },
    {
        title: 'app.daos.xmaquina.xmaquinaPageHeader.actions.claim.title',
        description: 'app.daos.xmaquina.xmaquinaPageHeader.actions.claim.description',
        icon: ClaimIcon,
        href: 'https://genesis.xmaquina.io/',
        isExternal: true,
    },
];
