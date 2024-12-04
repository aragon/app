import { generateCreateProposalEndDateFormData, generateCreateProposalFormData } from '@/modules/governance/testUtils';
import { createProposalUtils } from '@/modules/governance/utils/createProposalUtils';
import * as Viem from 'viem';
import { multisigPluginAbi } from './multisigPluginAbi';
import { multisigTransactionUtils } from './multisigTransactionUtils';

jest.mock('viem', () => ({ __esModule: true, ...jest.requireActual<typeof Viem>('viem') }));

describe('multisigTransaction utils', () => {
    const encodeFunctionDataSpy = jest.spyOn(Viem, 'encodeFunctionData');
    const parseStartDateSpy = jest.spyOn(createProposalUtils, 'parseStartDate');
    const parseEndDateSpy = jest.spyOn(createProposalUtils, 'parseEndDate');

    afterEach(() => {
        encodeFunctionDataSpy.mockReset();
        parseStartDateSpy.mockReset();
        parseEndDateSpy.mockReset();
    });

    describe('buildCreateProposalData', () => {
        it('correctly encodes the create-proposal data from the given parameters', () => {
            const startDate = 0;
            const endDate = 1728660603;
            const values = { ...generateCreateProposalFormData(), ...generateCreateProposalEndDateFormData() };
            const params = {
                metadata: '0xdao-metadata-cid' as const,
                actions: [
                    {
                        to: '0x00C51Fad10462780e488B54D413aD92B28b88204',
                        data: '0x0000000000000000000000084512000',
                        value: '0',
                    },
                ],
                values,
            };
            parseStartDateSpy.mockReturnValue(startDate);
            parseEndDateSpy.mockReturnValue(endDate);
            multisigTransactionUtils.buildCreateProposalData(params);
            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: multisigPluginAbi,
                functionName: 'createProposal',
                args: [params.metadata, params.actions, BigInt(0), false, false, startDate, endDate],
            });
        });
    });
});
