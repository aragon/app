import CtxImage from '../assets/cryptex-img-ctx.png';
import GovernImage from '../assets/cryptex-img-govern.png';
import StakeImage from '../assets/cryptex-img-stake.png';
import { cryptex } from './cryptex';

const cryptexIdDelimiterIndex = cryptex.id.lastIndexOf('-');
const cryptexNetwork = cryptex.id.slice(0, cryptexIdDelimiterIndex);
const cryptexAddress = cryptex.id.slice(cryptexIdDelimiterIndex + 1);

const cryptexProposalsHref = `/dao/${cryptexNetwork}/${cryptexAddress}/proposals`;

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
        href: cryptexProposalsHref,
        isExternal: false,
    },
];
