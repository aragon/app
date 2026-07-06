import { generateProposalAction } from '@/modules/governance/testUtils';
import { proposalActionUtils } from '@/modules/governance/utils/proposalActionUtils';
import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import { ExecuteActionDetails, initExecuteActionViews } from './index';

describe('initExecuteActionViews', () => {
    it('registers the execute details view for the executor selector, resolving actions the backend types as Unknown', () => {
        initExecuteActionViews();

        // Backend payload shape for an `execute((address,uint256,bytes)[])` call on a wrapper contract the backend
        // does not classify (e.g. CrossChainExecutor): outer call decoded but type set to Unknown.
        const action = generateProposalAction({
            type: 'Unknown',
            data: '0x3f707e6b',
            inputData: {
                function: 'execute',
                contract: 'CrossChainExecutor',
                parameters: [
                    {
                        name: '_actions',
                        type: 'tuple[]',
                        components: [
                            { name: 'to', type: 'address' },
                            { name: 'value', type: 'uint256' },
                            { name: 'data', type: 'bytes' },
                        ],
                        value: [],
                    },
                ],
            },
        });

        const selector = proposalActionUtils.actionToFunctionSelector(action);

        expect(selector).toEqual('0x3f707e6b');
        expect(
            actionViewRegistry.getViewBySelector(selector)?.componentDetails,
        ).toEqual(ExecuteActionDetails);
    });
});
