import { ProposalActionType } from '@/modules/governance/api/governanceService';
import { generateSmartContractAbi } from '@/modules/governance/testUtils';
import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { generateDao } from '../../../testUtils';
import type { IActionComposerInputItem } from './actionComposerInput.api';
import { actionComposerInputUtils, ActionItemId } from './actionComposerInputUtils';

describe('actionComposerUtils', () => {
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
            const result = actionComposerInputUtils.getActionGroups({ t, dao, abis: [], nativeGroups });
            // Should include OSX group and all nativeGroups
            expect(result.map((g) => g.id)).toEqual(['OSX', '0xN1', '0xN2']);
        });

        it('returns only custom groups if no nativeGroups including DAO native group', () => {
            const dao = generateDao({ address: '0xDAO' });
            const abis = [
                generateSmartContractAbi({ address: '0xC1', name: 'Custom1' }),
                generateSmartContractAbi({ address: '0xC2', name: 'Custom2' }),
            ];
            const result = actionComposerInputUtils.getActionGroups({ t, dao, abis, nativeGroups: [] });
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
            const result = actionComposerInputUtils.getActionGroups({ t, dao, abis: abisWithOverlap, nativeGroups });
            // Should filter out 0xN1 and 0xDAO from custom, keep 0xC3
            expect(result.map((g) => g.id)).toEqual(['0xC3', 'OSX', '0xN1', '0xN2']);
        });
    });

    describe('getActionItems', () => {
        const t = (key: string) => key;

        it('returns default and native items if no abis', () => {
            const dao = generateDao({ address: '0xDAO' });
            const nativeItems = [
                {
                    id: 'native-1',
                    name: 'Native Item 1',
                    icon: IconType.SETTINGS,
                    groupId: '0xN1',
                },
                {
                    id: 'native-2',
                    name: 'Native Item 2',
                    icon: IconType.PLUS,
                    groupId: '0xN2',
                },
            ];
            const result = actionComposerInputUtils.getActionItems({ t, dao, abis: [], nativeItems });
            expect(result.map((item) => item.id)).toEqual([
                // non-grouped, default items first
                ActionItemId.ADD_CONTRACT,
                ProposalActionType.TRANSFER,
                // DAO group with default Metadata Update action
                ProposalActionType.METADATA_UPDATE,
                // other native items
                'native-1',
                'native-2',
            ]);
        });

        it('returns default and custom items if no native items', () => {
            const dao = generateDao({ address: '0xDAO' });
            const abis = [
                generateSmartContractAbi({ address: '0xC1', name: 'Custom1' }),
                generateSmartContractAbi({
                    address: '0xC2',
                    name: 'Custom2',
                    functions: [{ name: 'customAction1', parameters: [] }],
                }),
            ];
            const result = actionComposerInputUtils.getActionItems({ t, dao, abis, nativeItems: [] });
            expect(result.map((item) => item.id)).toEqual([
                // non-grouped, default items first
                ActionItemId.ADD_CONTRACT,
                ProposalActionType.TRANSFER,
                // imported contract functions with default RAW_CALLDATA action
                '0xC1-RAW_CALLDATA',
                '0xC2-customAction1-0',
                '0xC2-RAW_CALLDATA',
                // DAO group with default Metadata Update action
                ProposalActionType.METADATA_UPDATE,
            ]);
        });

        it('merges custom and native items with groupId overlap', () => {
            const dao = generateDao({ address: '0xDAO' });
            const abisWithOverlap = [
                generateSmartContractAbi({
                    address: '0xN1',
                    name: 'Overlap',
                    functions: [
                        { name: 'custom-1', parameters: [] },
                        { name: 'native-1', parameters: [] },
                        { name: 'native-2', parameters: [] },
                    ],
                }),
                generateSmartContractAbi({
                    address: '0xC1',
                    name: 'NonOverlap',
                    functions: [{ name: 'custom-1', parameters: [] }],
                }),
                generateSmartContractAbi({
                    address: '0xDAO',
                    name: 'DaoOverlap',
                    functions: [
                        { name: 'custom-1', parameters: [] },
                        { name: 'custom-2', parameters: [] },
                        { name: 'setMetadata', parameters: [{ name: '_metadata', type: 'bytes' }] },
                    ],
                }),
            ];
            const nativeItemsWithOverlap = [
                {
                    id: 'native-1',
                    name: 'Native Item 1',
                    icon: IconType.EXPAND,
                    groupId: '0xN1',
                    defaultValue: {
                        inputData: { function: 'native-1', contract: 'Test', parameters: [] },
                    },
                },
                {
                    id: 'native-2',
                    name: 'Native Item 2',
                    icon: IconType.EXPAND,
                    groupId: '0xN1',
                    defaultValue: {
                        inputData: { function: 'native-2', contract: 'Test', parameters: [] },
                    },
                },
                {
                    id: 'native-3',
                    name: 'Native Item 3',
                    icon: IconType.EXPAND,
                    groupId: '0xN2',
                    defaultValue: {
                        inputData: { function: 'native-3', contract: 'Test', parameters: [] },
                    },
                },
                {
                    id: 'native-4',
                    name: 'Native Item 5',
                    icon: IconType.EXPAND,
                    groupId: '0xN2',
                    defaultValue: {
                        inputData: { function: 'native-4', contract: 'Test', parameters: [] },
                    },
                },
            ] as unknown as IActionComposerInputItem[];

            const [
                addContract,
                transfer,
                importedC1F1,
                importedC1Default,
                nativeOSXF1,
                nativeOSXF2,
                nativeOSXF3,
                nativeOSXF4,
                nativeN1F1,
                nativeN1F2,
                nativeN1F3,
                nativeN1F4,
                nativeN2F1,
                nativeN2F2,
                nativeN2F3,
            ] = actionComposerInputUtils.getActionItems({
                t,
                dao,
                abis: abisWithOverlap,
                nativeItems: nativeItemsWithOverlap,
            });

            // non-grouped, default items first
            expect(addContract.id).toBe(ActionItemId.ADD_CONTRACT);
            expect(transfer.id).toBe(ProposalActionType.TRANSFER);
            expect(addContract.groupId).toBeUndefined();
            expect(transfer.groupId).toBeUndefined();

            // imported, non-overlap contract functions with default RAW_CALLDATA action
            expect(importedC1F1.id).toBe(`0xC1-${abisWithOverlap[1].functions[0].name}-0`);
            expect(importedC1F1.groupId).toBe('0xC1');
            expect(importedC1F1.icon).toBe(IconType.SLASH);
            expect(importedC1Default.id).toBe('0xC1-RAW_CALLDATA');
            expect(importedC1Default.groupId).toBe('0xC1');
            expect(importedC1Default.icon).toBe(IconType.BLOCKCHAIN_SMARTCONTRACT);

            // Native items with merged custom actions where groupId overlaps

            // 0xOSX - with overlap with imported items
            expect(nativeOSXF1.id).toBe('0xDAO-custom-1-0');
            expect(nativeOSXF1.groupId).toBe('OSX');
            expect(nativeOSXF1.icon).toBe(IconType.SLASH);
            expect(nativeOSXF2.id).toBe('0xDAO-custom-2-1');
            expect(nativeOSXF2.groupId).toBe('OSX');
            expect(nativeOSXF2.icon).toBe(IconType.SLASH);
            expect(nativeOSXF3.id).toBe(ProposalActionType.METADATA_UPDATE);
            expect(nativeOSXF3.groupId).toBe('OSX');
            expect(nativeOSXF3.icon).toBe(IconType.SETTINGS);
            expect(nativeOSXF4.id).toBe('0xDAO-RAW_CALLDATA');
            expect(nativeOSXF4.groupId).toBe('OSX');
            expect(nativeOSXF4.icon).toBe(IconType.BLOCKCHAIN_SMARTCONTRACT);

            // 0xN1 - with overlap with imported items
            expect(nativeN1F1.id).toBe(`0xN1-${abisWithOverlap[0].functions[0].name}-0`);
            expect(nativeN1F1.groupId).toBe('0xN1');
            expect(nativeN1F1.icon).toBe(IconType.SLASH);
            expect(nativeN1F2.id).toBe('native-1');
            expect(nativeN1F2.groupId).toBe('0xN1');
            expect(nativeN1F2.icon).toBe(IconType.EXPAND);
            expect(nativeN1F3.id).toBe('native-2');
            expect(nativeN1F3.groupId).toBe('0xN1');
            expect(nativeN1F3.icon).toBe(IconType.EXPAND);
            expect(nativeN1F4.id).toBe('0xN1-RAW_CALLDATA');
            expect(nativeN1F4.groupId).toBe('0xN1');
            expect(nativeN1F4.icon).toBe(IconType.BLOCKCHAIN_SMARTCONTRACT);

            // 0xN2 - no overlap with imported items
            expect(nativeN2F1.id).toBe('native-3');
            expect(nativeN2F1.groupId).toBe('0xN2');
            expect(nativeN2F1.icon).toBe(IconType.EXPAND);
            expect(nativeN2F2.id).toBe('native-4');
            expect(nativeN2F2.groupId).toBe('0xN2');
            expect(nativeN2F2.icon).toBe(IconType.EXPAND);
            expect(nativeN2F3).toBeUndefined(); // no RAW_CALLDATA action for "pure" native items
        });

        it("doesn't include transfer action if isWithoutTransfer is true", () => {
            const dao = generateDao({ address: '0xDAO' });
            const isWithoutTransfer = true;

            const result = actionComposerInputUtils.getActionItems({
                t,
                dao,
                abis: [],
                nativeItems: [],
                isWithoutTransfer,
            });

            expect(result.map((item) => item.id)).not.toContain(ProposalActionType.TRANSFER);
        });

        it("doesn't include raw calldata action if isWithoutRawCalldata is true", () => {
            const dao = generateDao({ address: '0xDAO' });
            const abis = [generateSmartContractAbi({ address: '0xC1', name: 'Custom1' })];
            const isWithoutRawCalldata = true;

            const result = actionComposerInputUtils.getActionItems({
                t,
                dao,
                abis,
                nativeItems: [],
                isWithoutRawCalldata,
            });

            expect(result.find((item) => item.defaultValue?.type === ActionItemId.RAW_CALLDATA)).toBeUndefined();
        });
    });
});
