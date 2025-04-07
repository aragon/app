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
            const metadata = '0xmeta';
            const actions: ITransactionRequest[] = [{ to: '0x123', data: '0x000', value: BigInt(0) }];
            const values = generateCreateProposalFormData();
            const transactionData = '0xdata';
            encodeFunctionDataSpy.mockReturnValueOnce(transactionData);

            const result = adminTransactionUtils.buildCreateProposalData({ metadata, actions, values });
            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: adminPluginAbi,
                functionName: 'createProposal',
                args: [metadata, actions, BigInt(0), BigInt(0), ''],
            });
            expect(result).toEqual(transactionData);
        });
    });
});
