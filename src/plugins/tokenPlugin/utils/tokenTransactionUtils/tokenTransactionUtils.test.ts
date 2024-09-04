import * as Viem from 'viem';
import { tokenPluginAbi } from './abi/tokenPlugin';
import { tokenTransactionUtils } from './tokenTransactionUtils';

jest.mock('viem', () => ({ __esModule: true, ...jest.requireActual('viem') }));

describe('tokenTransaction utils', () => {
    const encodeFunctionDataSpy = jest.spyOn(Viem, 'encodeFunctionData');

    afterEach(() => {
        encodeFunctionDataSpy.mockReset();
    });

    describe('buildCreateProposalData', () => {
        it('correctly encodes the create-proposal data from the given parameters', () => {
            const params = {
                metadata: '0xipfs-cid' as const,
                actions: [{ to: '0xD740fd724D616795120BC363316580dAFf41129A', data: '0x', value: '0' }],
                startDate: 0,
                endDate: 1724939,
            };
            tokenTransactionUtils.buildCreateProposalData(params);
            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: tokenPluginAbi,
                functionName: 'createProposal',
                args: [params.metadata, params.actions, BigInt(0), params.startDate, params.endDate, 0, false],
            });
        });
    });
});
