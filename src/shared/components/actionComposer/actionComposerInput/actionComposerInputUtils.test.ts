import { ProposalActionType } from '@/modules/governance/api/governanceService';
import { generateSmartContractAbi } from '@/modules/governance/testUtils';
import { addressUtils, IconType } from '@aragon/gov-ui-kit';
import { mockTranslations } from '../../../../test/utils';
import { generateDao } from '../../../testUtils';
import type { IActionComposerInputItem } from './actionComposerInput.api';
import { actionComposerInputUtils, ActionItemId } from './actionComposerInputUtils';

describe('actionComposerUtils', () => {
    describe('getActionGroups', () => {
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
            const result = actionComposerInputUtils.getActionGroups({
                t: mockTranslations.tMock,
                dao,
                abis: [],
                nativeGroups,
            });
            // Should include 0xDAO group and all nativeGroups
            expect(result.map((g) => g.id)).toEqual(['0xDAO', '0xN1', '0xN2']);
        });

        it('returns only custom groups if no nativeGroups including DAO native group', () => {
            const dao = generateDao({ address: '0xDAO' });
            const abis = [
                generateSmartContractAbi({ address: '0xC1', name: 'Custom1' }),
                generateSmartContractAbi({ address: '0xC2', name: 'Custom2' }),
            ];
            const result = actionComposerInputUtils.getActionGroups({
                t: mockTranslations.tMock,
                dao,
                abis,
                nativeGroups: [],
            });
            // Should include custom abis as groups, plus DAO group
            expect(result.map((g) => g.id)).toEqual(['0xC1', '0xC2', '0xDAO']);
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
            const result = actionComposerInputUtils.getActionGroups({
                t: mockTranslations.tMock,
                dao,
                abis: abisWithOverlap,
                nativeGroups,
            });
            // Should filter out 0xN1 and 0xDAO from custom, keep 0xC3
            expect(result.map((g) => g.id)).toEqual(['0xC3', '0xDAO', '0xN1', '0xN2']);
        });
    });

    describe('getActionItems', () => {
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
            const result = actionComposerInputUtils.getActionItems({
                t: mockTranslations.tMock,
                dao,
                abis: [],
                nativeItems,
            });
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
            const result = actionComposerInputUtils.getActionItems({
                t: mockTranslations.tMock,
                dao,
                abis,
                nativeItems: [],
            });
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

        it('maintains correct order: non-grouped, custom, native', () => {
            const dao = generateDao({ address: '0xDAO' });
            const abis = [
                generateSmartContractAbi({
                    address: '0xCustom1',
                    name: 'Custom1',
                    functions: [{ name: 'customFunction', parameters: [] }],
                }),
            ];
            const nativeItems = [
                {
                    id: 'native-1',
                    name: 'Native Item 1',
                    icon: IconType.SETTINGS,
                    groupId: '0xNative1',
                },
            ];

            const result = actionComposerInputUtils.getActionItems({
                t: mockTranslations.tMock,
                dao,
                abis,
                nativeItems,
            });

            const itemIds = result.map((item) => item.id);
            // Non-grouped items should come first
            expect(itemIds[0]).toBe(ActionItemId.ADD_CONTRACT);
            expect(itemIds[1]).toBe(ProposalActionType.TRANSFER);
            // Custom items should come next
            expect(itemIds[2]).toBe('0xCustom1-customFunction-0');
            expect(itemIds[3]).toBe('0xCustom1-RAW_CALLDATA');
            // Native items should come last
            expect(itemIds[4]).toBe(ProposalActionType.METADATA_UPDATE);
            expect(itemIds[5]).toBe('native-1');
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
            ];
            const nativeItemsWithOverlap = [
                {
                    id: 'native-1',
                    name: 'Native Item 1',
                    icon: IconType.SETTINGS,
                    groupId: '0xN1',
                    defaultValue: {
                        inputData: { function: 'native-1', contract: 'Test', parameters: [] },
                    },
                },
                {
                    id: 'native-2',
                    name: 'Native Item 2',
                    icon: IconType.HOME,
                    groupId: '0xN1',
                    defaultValue: {
                        inputData: { function: 'native-2', contract: 'Test', parameters: [] },
                    },
                },
            ] as unknown as IActionComposerInputItem[];

            const result = actionComposerInputUtils.getActionItems({
                t: mockTranslations.tMock,
                dao,
                abis: abisWithOverlap,
                nativeItems: nativeItemsWithOverlap,
            });

            const n1GroupItems = result.filter((item) => item.groupId === '0xN1');
            expect(n1GroupItems.length).toBe(4); // 1 new custom + 2 native + 1 RAW_CALLDATA

            const [custom1, native1, native2, rawCallData] = n1GroupItems;
            expect(custom1.id).toBe('0xN1-custom-1-0');
            expect(custom1.icon).toBe(IconType.SLASH); // custom items get default SLASH icon
            expect(native1.id).toBe('native-1');
            expect(native1.icon).toBe(IconType.SETTINGS); // native items preserve their icons
            expect(native2.id).toBe('native-2');
            expect(native2.icon).toBe(IconType.HOME);
            expect(rawCallData.id).toBe('0xN1-RAW_CALLDATA');
            expect(rawCallData.icon).toBe(IconType.BLOCKCHAIN_SMARTCONTRACT);
        });

        it('can filter action items by type', () => {
            const dao = generateDao({ address: '0xDAO' });
            const abis = [generateSmartContractAbi({ address: '0xC1', name: 'Custom1' })];
            const excludeActionTypes = [ActionItemId.RAW_CALLDATA, ProposalActionType.TRANSFER];

            const result = actionComposerInputUtils.getActionItems({
                t: mockTranslations.tMock,
                dao,
                abis,
                nativeItems: [],
                excludeActionTypes,
            });

            expect(result.find((item) => item.defaultValue?.type === ProposalActionType.TRANSFER)).toBeUndefined();
            expect(result.find((item) => item.defaultValue?.type === ActionItemId.RAW_CALLDATA)).toBeUndefined();
        });
    });
});
