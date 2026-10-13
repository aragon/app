import { toFunctionSelector } from 'viem';
import { generateProposalAction } from '@/modules/governance/testUtils';
import { generateDao } from '@/shared/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { ProposalActionType } from '../../api/governanceService';
import { proposalActionUtils } from './proposalActionUtils';

describe('proposalActionUtils', () => {
    const getSlotFunctionsSpy = jest.spyOn(
        pluginRegistryUtils,
        'getSlotFunctions',
    );

    afterEach(() => {
        getSlotFunctionsSpy.mockReset();
    });

    describe('normalizeActions', () => {
        it('retrieves and triggers all plugin-specific normalization functions to normalize the proposal actions', () => {
            const dao = generateDao({ id: 'test' });
            const actions = [generateProposalAction()];
            const normalizationFunctionOne = jest.fn(() => actions);
            const normalizationFunctionTwo = jest.fn(() => actions);
            getSlotFunctionsSpy.mockReturnValue([
                normalizationFunctionOne,
                normalizationFunctionTwo,
            ]);
            proposalActionUtils.normalizeActions(actions, dao);
            const expectedParams = { actions, daoId: dao.id };
            expect(normalizationFunctionOne).toHaveBeenCalledWith(
                expectedParams,
            );
            expect(normalizationFunctionTwo).toHaveBeenCalledWith(
                expectedParams,
            );
        });

        it('returns the result of the plugin-specific normalization functions', () => {
            const normalizedActions = [
                generateProposalAction({ type: '1' }),
                generateProposalAction({ type: '2' }),
            ];
            const pluginNormalizationFunction = () => normalizedActions;
            getSlotFunctionsSpy.mockReturnValue([pluginNormalizationFunction]);
            expect(
                proposalActionUtils.normalizeActions([], generateDao()),
            ).toEqual(normalizedActions);
        });
    });

    describe('resolveNestedActions', () => {
        const rawTuple = [
            {
                to: '0xE5e5f0c2e1B5F1b8f2C0a1D3a4B5c6D7e8F90123',
                value: '1000',
                data: '0xDEADBEEF',
            },
        ];

        const matchingAction = generateProposalAction({
            to: rawTuple[0].to.toLowerCase(),
            value: rawTuple[0].value,
            data: rawTuple[0].data.toLowerCase(),
            type: ProposalActionType.TRANSFER,
        });

        const expectedStubs = [
            {
                from: '',
                to: rawTuple[0].to,
                value: rawTuple[0].value,
                data: rawTuple[0].data,
                type: 'RAW_CALLDATA',
                inputData: null,
            },
        ];

        it('keeps the decoded actions when they describe the same calls as the tuple', () => {
            expect(
                proposalActionUtils.resolveNestedActions(
                    [matchingAction],
                    rawTuple,
                ),
            ).toEqual([matchingAction]);
        });

        it('keeps the decoded actions when only the notation of the value differs', () => {
            const action = generateProposalAction({
                ...matchingAction,
                value: '0x3e8',
            });

            expect(
                proposalActionUtils.resolveNestedActions([action], rawTuple),
            ).toEqual([action]);
        });

        it('falls back to raw stubs when the decoded actions are missing', () => {
            expect(
                proposalActionUtils.resolveNestedActions(undefined, rawTuple),
            ).toEqual(expectedStubs);
        });

        it('falls back to raw stubs when the counts disagree', () => {
            expect(
                proposalActionUtils.resolveNestedActions(
                    [matchingAction, matchingAction],
                    rawTuple,
                ),
            ).toEqual(expectedStubs);
        });

        it.each([
            {
                field: 'to',
                value: '0x1111111111111111111111111111111111111111',
            },
            { field: 'value', value: '999' },
            { field: 'data', value: '0xfeedface' },
        ])(
            'falls back to raw stubs when the decoded $field disagrees with the tuple',
            ({ field, value }) => {
                const action = generateProposalAction({
                    ...matchingAction,
                    [field]: value,
                });

                expect(
                    proposalActionUtils.resolveNestedActions(
                        [action],
                        rawTuple,
                    ),
                ).toEqual(expectedStubs);
            },
        );
    });
    describe('actionToFunctionSelector', () => {
        const grantInputData = {
            function: 'grant',
            contract: 'DAO',
            parameters: [
                { name: '_where', type: 'address', value: '' },
                { name: '_who', type: 'address', value: '' },
                { name: '_permissionId', type: 'bytes32', value: '' },
            ],
        };

        it('derives the selector from the ABI even when the calldata is not encoded yet', () => {
            // A freshly composed call starts with empty calldata; the action view registry
            // still has to resolve it by selector before anything is filled in.
            const action = generateProposalAction({
                data: '0x',
                inputData: grantInputData,
            });

            expect(proposalActionUtils.actionToFunctionSelector(action)).toBe(
                toFunctionSelector('function grant(address,address,bytes32)'),
            );
        });

        it('returns undefined for a native transfer, which has no parameters and no selector', () => {
            const action = generateProposalAction({
                data: '0x',
                inputData: {
                    function: 'transfer',
                    contract: 'Ether',
                    parameters: [],
                },
            });

            expect(
                proposalActionUtils.actionToFunctionSelector(action),
            ).toBeUndefined();
        });

        it('returns undefined when the action has no ABI', () => {
            const action = generateProposalAction({
                data: '0x1234',
                inputData: undefined,
            });

            expect(
                proposalActionUtils.actionToFunctionSelector(action),
            ).toBeUndefined();
        });
    });
});
