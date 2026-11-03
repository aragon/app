import { TokenProposalActionType } from '@/plugins/tokenPlugin/types';
import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import { TokenMintActionDetails } from './components/tokenMintActionDetails';
import { initTokenActionViews } from './index';

describe('initTokenActionViews', () => {
    beforeAll(() => {
        initTokenActionViews();
    });

    it('registers the token mint details view by action type', () => {
        expect(
            actionViewRegistry.getViewByActionType(
                TokenProposalActionType.MINT,
            ),
        ).toEqual(
            expect.objectContaining({
                actionType: TokenProposalActionType.MINT,
                componentDetails: TokenMintActionDetails,
            }),
        );
    });

    it('does not register a view for the mint function selector, keeping the create flow on the plugin component', () => {
        expect(
            actionViewRegistry.getViewBySelector('0x40c10f19'),
        ).toBeUndefined();
    });

    it('does not register a create component, a composer item or a permission for token mints', () => {
        const view = actionViewRegistry.getViewByActionType(
            TokenProposalActionType.MINT,
        );

        expect(view?.componentCreate).toBeUndefined();
        expect(view?.getItem).toBeUndefined();
        expect(view?.permissionId).toBeUndefined();
    });
});
