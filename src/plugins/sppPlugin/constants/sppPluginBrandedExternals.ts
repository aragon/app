import safeWallet from '@/assets/images/safeWallet.png';
import type { IProposalVotingBodyBrand } from '@aragon/gov-ui-kit';
import { VotingBodyBrandIdentity } from '../types';

export const brandedExternals: Record<VotingBodyBrandIdentity, IProposalVotingBodyBrand | undefined> = {
    [VotingBodyBrandIdentity.SAFE]: {
        logo: safeWallet.src,
        label: 'Safe{Wallet}',
    },
    [VotingBodyBrandIdentity.EOA]: undefined,
    [VotingBodyBrandIdentity.OTHER]: undefined,
};
