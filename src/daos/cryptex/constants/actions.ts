import CtxImage from '../assets/cryptex-img-ctx.png';
import GovernImage from '../assets/cryptex-img-govern.png';
import StakeImage from '../assets/cryptex-img-stake.png';

export const actions = [
    {
        title: 'app.daos.cryptex.cryptexPageHeader.actions.getCtx.title',
        description:
            'app.daos.cryptex.cryptexPageHeader.actions.getCtx.description',
        image: CtxImage,
        href: 'https://www.cryptex.finance/',
        isExternal: true,
    },
    {
        title: 'app.daos.cryptex.cryptexPageHeader.actions.stake.title',
        description:
            'app.daos.cryptex.cryptexPageHeader.actions.stake.description',
        image: StakeImage,
        href: 'https://www.cryptex.finance/',
        isExternal: true,
    },
    {
        title: 'app.daos.cryptex.cryptexPageHeader.actions.govern.title',
        description:
            'app.daos.cryptex.cryptexPageHeader.actions.govern.description',
        image: GovernImage,
        href: '/dao/ethereum-sepolia/0x1111111111111111111111111111111111111111/proposals',
        isExternal: false,
    },
];
