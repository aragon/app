import { generateDao } from '@/shared/testUtils';
import type { IProposalActionInputData } from '@aragon/gov-ui-kit';
import { addressUtils } from '@aragon/gov-ui-kit';
import { generateSmartContractAbi } from '../../testUtils/generators';
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

    describe('getActionGroups', () => {
        const t = (key: string) => key;
        const truncateAddressSpy = jest.spyOn(addressUtils, 'truncateAddress');

        beforeEach(() => {
            truncateAddressSpy.mockImplementation((address) => `truncated-${String(address)}`);
        });

        afterEach(() => {
            truncateAddressSpy.mockReset();
        });

        it('returns only native groups if no abis', () => {
            const dao = generateDao({ address: '0xDAO' });
            const nativeGroups = [
                { id: '0xN1', name: 'Native1', info: 'info1' },
                { id: '0xN2', name: 'Native2', info: 'info2' },
            ];
            const result = actionComposerUtils.getActionGroups({ t, dao, abis: [], nativeGroups });
            // Should include OSX group and all nativeGroups
            expect(result.map((g) => g.id)).toEqual(['OSX', '0xN1', '0xN2']);
        });

        it('returns only custom groups if no nativeGroups including DAO native group', () => {
            const dao = generateDao({ address: '0xDAO' });
            const abis = [
                generateSmartContractAbi({ address: '0xC1', name: 'Custom1' }),
                generateSmartContractAbi({ address: '0xC2', name: 'Custom2' }),
            ];
            const result = actionComposerUtils.getActionGroups({ t, dao, abis, nativeGroups: [] });
            // Should include custom abis as groups, plus DAO/OSX group
            expect(result.map((g) => g.id)).toEqual(['0xC1', '0xC2', 'OSX']);
        });

        it('filters out custom groups that match native group ids or dao address', () => {
            const dao = generateDao({ address: '0xDAO' });
            const nativeGroups = [
                { id: '0xN1', name: 'Native1', info: 'info1' },
                { id: '0xN2', name: 'Native2', info: 'info2' },
            ];
            const abisWithOverlap = [
                generateSmartContractAbi({ address: '0xN1', name: 'CustomOverlap' }),
                generateSmartContractAbi({ address: '0xC3', name: 'Custom3' }),
                generateSmartContractAbi({ address: '0xDAO', name: 'CustomDao' }),
            ];
            const result = actionComposerUtils.getActionGroups({ t, dao, abis: abisWithOverlap, nativeGroups });
            // Should filter out 0xN1 and 0xDAO from custom, keep 0xC3
            expect(result.map((g) => g.id)).toEqual(['0xC3', 'OSX', '0xN1', '0xN2']);
        });
    });
});
