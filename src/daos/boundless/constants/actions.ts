import type { IDao } from '@/shared/api/daoService';
import { daoUtils, type IDaoHeaderAction } from '@/shared/utils/daoUtils';
import ClaimImage from '../assets/boundless-img-claim.png';
import GovernImage from '../assets/boundless-img-govern.png';
import StakeImage from '../assets/boundless-img-stake.png';

export const getActions = (dao: IDao): IDaoHeaderAction[] => [
    {
        title: 'app.daos.boundless.boundlessPageHeader.actions.claim.title',
        description:
            'app.daos.boundless.boundlessPageHeader.actions.claim.description',
        image: ClaimImage,
        href: 'https://airdrop.boundless.network/',
        isExternal: true,
    },
    {
        title: 'app.daos.boundless.boundlessPageHeader.actions.stake.title',
        description:
            'app.daos.boundless.boundlessPageHeader.actions.stake.description',
        image: StakeImage,
        href: 'https://staking.boundless.network',
        isExternal: true,
    },
    {
        title: 'app.daos.boundless.boundlessPageHeader.actions.govern.title',
        description:
            'app.daos.boundless.boundlessPageHeader.actions.govern.description',
        image: GovernImage,
        href: daoUtils.getDaoUrl(dao, 'proposals') ?? '',
        isExternal: false,
    },
];
