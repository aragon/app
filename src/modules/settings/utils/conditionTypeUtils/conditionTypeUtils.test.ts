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
});
