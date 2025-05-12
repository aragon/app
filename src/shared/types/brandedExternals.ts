import type { IProposalVotingBodyBrand } from '@aragon/gov-ui-kit';
import safeWallet from '../../assets/images/logos/safeWallet.png';

export enum VotingBodyBrandIdentity {
    SAFE_WALLET = 'safeWallet',
    OTHER = 'other',
}

export const brandedExternals: Record<VotingBodyBrandIdentity, IProposalVotingBodyBrand | undefined> = {
    [VotingBodyBrandIdentity.SAFE_WALLET]: {
        logo: safeWallet.src,
        label: 'Safe{Wallet}',
    },
    [VotingBodyBrandIdentity.OTHER]: undefined,
};
