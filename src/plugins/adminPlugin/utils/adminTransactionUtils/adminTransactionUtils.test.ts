import { generateCreateProposalFormData } from '@/modules/governance/testUtils';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import * as Viem from 'viem';
import { adminPluginAbi } from './adminPluginAbi';
import { adminTransactionUtils } from './adminTransactionUtils';

describe('adminTransaction utils', () => {
    const encodeFunctionDataSpy = jest.spyOn(Viem, 'encodeFunctionData');

    afterEach(() => {
        encodeFunctionDataSpy.mockReset();
    });

    describe('buildCreateProposalData', () => {
        it('correctly encodes the create-proposal data from the given parameters', () => {
            const metadata = 'testData';
            const actions: ITransactionRequest[] = [{ to: '0x123', data: '0x000' }];
            const values = generateCreateProposalFormData();
            adminTransactionUtils.buildCreateProposalData({ metadata: '0xdao-metadata-cid' as const, actions, values });
            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: adminPluginAbi,
                functionName: 'createProposal',
                args: [metadata, actions, BigInt(0), BigInt(0), ''],
            });
        });
    });
});
