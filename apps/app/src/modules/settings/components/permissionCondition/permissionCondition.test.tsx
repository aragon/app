import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import type { IDaoPermission } from '@/shared/api/daoService';
import { generateDaoPermission } from '@/shared/testUtils';
import { ALLOW_FLAG } from '../../constants/permissionSentinels';
import { initialiseConditionRegistry } from '../../initConditionRegistry';
import { PermissionCondition } from './permissionCondition';

const conditionAddress = '0xC0Ffee254729296a45a3885639AC7E10F9d54979';

const buildRow = (partial?: Partial<IDaoPermission>): IDaoPermission =>
    generateDaoPermission({
        conditionAddress: ALLOW_FLAG,
        condition: undefined,
        conditionEntity: undefined,
        network: undefined,
        who: undefined,
        where: undefined,
        ...partial,
    });

describe('<PermissionCondition /> component', () => {
    beforeAll(() => {
        initialiseConditionRegistry();
    });

    // The registry is the sole dispatch authority; these four cases pin every outcome of the
    // resolved condition type: sentinel, registered, unresolvable, and present-but-unregistered.
    it.each([
        {
            name: 'no condition (ALLOW_FLAG) to the no-condition slot',
            row: buildRow(),
            expectedTestId: 'no-condition-placeholder',
        },
        {
            name: 'a registered condition type to its slot',
            row: buildRow({
                conditionAddress,
                condition: {
                    conditionType: 'voting-power',
                    token: '0x0bA45A8b5d5575935B8158a88C631E9F9C95a2e5',
                    minVotingPower: '1000000000000000000',
                },
            }),
            expectedText: /votingPowerConditionSlot.token/,
        },
        {
            name: 'an unresolvable payload to the unrecognized slot',
            row: buildRow({ conditionAddress }),
            expectedTestId: 'unrecognized-condition',
        },
        {
            name: 'a present-but-unregistered type to the unrecognized fallback',
            row: buildRow({
                conditionAddress,
                condition: { conditionType: 'merkle-claim' },
            }),
            expectedTestId: 'unrecognized-condition',
        },
    ])('dispatches $name', async ({ row, expectedTestId, expectedText }) => {
        render(
            <GukModulesProvider>
                <PermissionCondition chainId={1} row={row} />
            </GukModulesProvider>,
        );

        if (expectedTestId != null) {
            expect(
                await screen.findByTestId(expectedTestId),
            ).toBeInTheDocument();
        }
        if (expectedText != null) {
            expect(await screen.findByText(expectedText)).toBeInTheDocument();
        }
    });
});
