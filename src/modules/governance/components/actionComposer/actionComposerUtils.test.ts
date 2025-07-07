import type { IProposalActionInputData } from '@aragon/gov-ui-kit';
import { actionComposerUtils } from './actionComposerUtils';

describe('actionComposerUtils', () => {
    describe('createFunctionSelector', () => {
        it('returns correct selector for transfer(address,uint256)', () => {
            const inputData: IProposalActionInputData = {
                function: 'transfer',
                contract: 'ERC20',
                parameters: [
                    { name: 'to', type: 'address', value: '' },
                    { name: 'amount', type: 'uint256', value: '' },
                ],
            };
            // keccak256('transfer(address,uint256)') = 0xa9059cbb...
            // selector = 0xa9059cbb
            expect(actionComposerUtils.createFunctionSelector(inputData)).toBe('0xa9059cbb');
        });
    });
});
