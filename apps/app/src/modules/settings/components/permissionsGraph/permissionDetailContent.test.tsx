import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { fireEvent, render, screen } from '@testing-library/react';
import type { IDaoPermission } from '@/shared/api/daoService';
import { ALLOW_FLAG, ANY_ADDR } from '../../constants/permissionSentinels';
import { initialiseConditionRegistry } from '../../initConditionRegistry';
import { PermissionDetailContent } from './permissionDetailContent';

const EXECUTE_PERMISSION_ID =
    '0xbf04b4486c9663d805744005c3da000eda93de6e3308a4a7a812eb565327b78d';

describe('<PermissionDetailContent /> component', () => {
    beforeAll(() => {
        initialiseConditionRegistry();
    });

    it('switches to the condition breakdown for present-but-unregistered types', () => {
        const row: IDaoPermission = {
            permissionId: EXECUTE_PERMISSION_ID,
            whoAddress: ANY_ADDR,
            whereAddress: ALLOW_FLAG,
            conditionAddress: '0xC0Ffee254729296a45a3885639AC7E10F9d54979',
            condition: { conditionType: 'merkle-claim' },
        };

        render(
            <GukModulesProvider>
                <PermissionDetailContent chainId={1} row={row} />
            </GukModulesProvider>,
        );

        fireEvent.click(
            screen.getByRole('radio', {
                name: /permissionsList.details.condition/,
            }),
        );

        expect(
            screen.getByTestId('unrecognized-condition'),
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('no-condition-placeholder'),
        ).not.toBeInTheDocument();
    });

    it('hides the condition toggle for unrecognized condition payloads', () => {
        const row: IDaoPermission = {
            permissionId: EXECUTE_PERMISSION_ID,
            whoAddress: ANY_ADDR,
            whereAddress: ALLOW_FLAG,
            conditionAddress: '0xC0Ffee254729296a45a3885639AC7E10F9d54979',
        };

        render(
            <GukModulesProvider>
                <PermissionDetailContent chainId={1} row={row} />
            </GukModulesProvider>,
        );

        expect(screen.queryAllByRole('radio')).toHaveLength(0);
        expect(
            screen.queryByTestId('unrecognized-condition'),
        ).not.toBeInTheDocument();
    });
});
