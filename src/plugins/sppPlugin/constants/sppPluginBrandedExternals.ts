import { VotingBodyBrandIdentity } from '@/plugins/sppPlugin/types/enum/sppVotingBodyBrandIdentity';
import type { IProposalVotingBodyBrand } from '@aragon/gov-ui-kit';
import safeWallet from '../assets/images/logos/safeWallet.png';

export const brandedExternals: Record<VotingBodyBrandIdentity, IProposalVotingBodyBrand | undefined> = {
    [VotingBodyBrandIdentity.SAFE_WALLET]: {
        logo: safeWallet.src,
        label: 'Safe{Wallet}',
    },
    [VotingBodyBrandIdentity.OTHER]: undefined,
};
