import ClaimImage from '../assets/boundless-img-claim.png';
import GovernImage from '../assets/boundless-img-govern.png';
import StakeImage from '../assets/boundless-img-stake.png';

export const actions = [
    {
        title: 'app.daos.boundless.boundlessPageHeader.actions.claim.title',
        description: 'app.daos.boundless.boundlessPageHeader.actions.claim.description',
        image: ClaimImage,
        href: 'https://airdrop.boundless.network/',
        isExternal: true,
    },
    {
        title: 'app.daos.boundless.boundlessPageHeader.actions.stake.title',
        description: 'app.daos.boundless.boundlessPageHeader.actions.stake.description',
        image: StakeImage,
        href: 'https://staking.boundless.network',
        isExternal: true,
    },
    {
        title: 'app.daos.boundless.boundlessPageHeader.actions.govern.title',
        description: 'app.daos.boundless.boundlessPageHeader.actions.govern.description',
        image: GovernImage,
        href: '/dao/ethereum-mainnet/boundless.dao.eth/proposals',
        isExternal: false,
    },
];
