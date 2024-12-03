import { generateCreateProposalFormData } from '@/modules/governance/testUtils';
import * as Viem from 'viem';
import { adminPluginAbi } from './adminPluginAbi';
import { adminTransactionUtils } from './adminTransactionUtils';

jest.mock('viem', () => ({ __esModule: true, ...jest.requireActual<typeof Viem>('viem') }));

describe('adminTransaction utils', () => {
    const encodeFunctionDataSpy = jest.spyOn(Viem, 'encodeFunctionData');

    afterEach(() => {
        encodeFunctionDataSpy.mockReset();
    });

    describe('buildCreateProposalData', () => {
        it('correctly encodes the create-proposal data from the given parameters', () => {
            const params = {
                metadata: '0xdao-metadata-cid' as const,
                actions: [
                    {
                        to: '0x00C51Fad10462780e488B54D413aD92B28b88204',
                        data: '0x0000000000000000000000084512000',
                        value: '0',
                    },
                ],
                values: generateCreateProposalFormData(),
            };
            adminTransactionUtils.buildCreateProposalData(params);
            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: adminPluginAbi,
                functionName: 'createProposal',
                args: [params.metadata, params.actions, BigInt(0), BigInt(0), ''],
            });
        });
    });
});
