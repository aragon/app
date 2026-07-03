import { ALLOW_FLAG } from '../../constants/permissionSentinels';
import { conditionTypeUtils } from './conditionTypeUtils';

describe('conditionType Utils', () => {
    describe('resolveConditionType', () => {
        const someAddress = '0x000000000000000000000000000000000000dead';

        it.each([
            {
                description: 'resolves ALLOW_FLAG to "none"',
                conditionAddress: ALLOW_FLAG,
                conditionData: undefined,
                expected: 'none',
            },
            {
                description:
                    'returns the payload conditionType when it is a non-empty string',
                conditionAddress: someAddress,
                conditionData: { conditionType: 'voting-power' },
                expected: 'voting-power',
            },
            {
                description:
                    'resolves to "unknown" when condition data is absent',
                conditionAddress: someAddress,
                conditionData: undefined,
                expected: 'unknown',
            },
            {
                description:
                    'resolves to "unknown" when conditionType is an empty string',
                conditionAddress: someAddress,
                conditionData: { conditionType: '' },
                expected: 'unknown',
            },
        ])('$description', ({ conditionAddress, conditionData, expected }) => {
            expect(
                conditionTypeUtils.resolveConditionType(
                    conditionAddress,
                    conditionData,
                ),
            ).toBe(expected);
        });
    });

    describe('getConditionLabel', () => {
        it.each([
            {
                description: 'maps voting-power to VotingPower',
                conditionType: 'voting-power',
                expected: 'VotingPower',
            },
            {
                description: 'maps execute-selector to ExecuteSelector',
                conditionType: 'execute-selector',
                expected: 'ExecuteSelector',
            },
            {
                description: 'maps "none" to the empty placeholder',
                conditionType: 'none',
                expected: '-',
            },
            {
                description: 'maps "unknown" to the empty placeholder',
                conditionType: 'unknown',
                expected: '-',
            },
            {
                description: 'maps an empty string to the empty placeholder',
                conditionType: '',
                expected: '-',
            },
            {
                description:
                    'Pascal-cases an unrecognised but present condition type',
                conditionType: 'merkle-claim',
                expected: 'MerkleClaim',
            },
        ])('$description', ({ conditionType, expected }) => {
            expect(conditionTypeUtils.getConditionLabel(conditionType)).toBe(
                expected,
            );
        });
    });
});
