import { TokenProposalActionType } from '@/plugins/tokenPlugin/types';
import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import { TokenMintActionDetails } from './components/tokenMintActionDetails';

export const initTokenActionViews = () => {
    actionViewRegistry.register({
        actionType: TokenProposalActionType.MINT,
        componentDetails: TokenMintActionDetails,
    });
};
