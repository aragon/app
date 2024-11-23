import { generateCreateProposalEndDateFormData, generateCreateProposalFormData } from '@/modules/governance/testUtils';
import { createProposalUtils } from '@/modules/governance/utils/createProposalUtils';
import * as Viem from 'viem';
import { tokenPluginAbi } from './tokenPluginAbi';
import { tokenTransactionUtils } from './tokenTransactionUtils';

jest.mock('viem', () => ({ __esModule: true, ...jest.requireActual<typeof Viem>('viem') }));

describe('tokenTransaction utils', () => {
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
                metadata: '0xipfs-cid' as const,
                actions: [{ to: '0xD740fd724D616795120BC363316580dAFf41129A', data: '0x', value: '0' }],
                values,
            };
            parseStartDateSpy.mockReturnValue(startDate);
            parseEndDateSpy.mockReturnValue(endDate);
            tokenTransactionUtils.buildCreateProposalData(params);
            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: tokenPluginAbi,
                functionName: 'createProposal',
                args: [params.metadata, params.actions, BigInt(0), startDate, endDate, 0, false],
            });
        });
    });
});
