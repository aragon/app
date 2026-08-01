import { addressUtils, Dialog, GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import type { IDialogLocation } from '@/shared/components/dialogProvider';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDaoPermission } from '@/shared/testUtils';
import { ALLOW_FLAG } from '../../constants/permissionSentinels';
import { initialiseConditionRegistry } from '../../initConditionRegistry';
import {
    type IPermissionDetailsDialogParams,
    PermissionDetailsDialog,
} from './permissionDetailsDialog';

jest.mock('@/shared/components/dialogProvider', () => ({
    useDialogContext: jest.fn(),
}));

const whoAddress = '0x1111111111111111111111111111111111111111';
const whereAddress = '0x2222222222222222222222222222222222222222';
const conditionAddress = '0xC0Ffee254729296a45a3885639AC7E10F9d54979';

describe('<PermissionDetailsDialog /> component', () => {
    const useDialogContextMock =
        dialogProvider.useDialogContext as unknown as jest.Mock;

    beforeAll(() => {
        initialiseConditionRegistry();
    });

    beforeEach(() => {
        useDialogContextMock.mockReturnValue({
            open: jest.fn(),
            close: jest.fn(),
        });
    });

    const createLocation = (
        params: Partial<IPermissionDetailsDialogParams>,
    ): IDialogLocation<IPermissionDetailsDialogParams> => ({
        id: 'PERMISSION_DETAILS',
        params: {
            row: generateDaoPermission({
                whoAddress,
                whereAddress,
                conditionAddress: ALLOW_FLAG,
                condition: undefined,
                conditionEntity: undefined,
                network: undefined,
                who: undefined,
                where: undefined,
            }),
            who: { address: whoAddress, label: 'Who Body' },
            where: { address: whereAddress, label: 'Where Plugin' },
            view: 'details',
            ...params,
        } as IPermissionDetailsDialogParams,
    });

    const createTestComponent = (
        params: Partial<IPermissionDetailsDialogParams>,
    ) => (
        <GukModulesProvider>
            <Dialog.Root open={true}>
                <PermissionDetailsDialog location={createLocation(params)} />
            </Dialog.Root>
        </GukModulesProvider>
    );

    it('renders the shared details list with the empty-condition dash for the details view', () => {
        render(createTestComponent({ view: 'details' }));

        expect(
            screen.getByText(/permissionsList.details.who/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/permissionsList.details.where/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/permissionsList.details.permission/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/permissionsList.details.condition/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(addressUtils.truncateAddress(whoAddress)),
        ).toBeInTheDocument();
        expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('renders the shared condition slot content for the condition view', () => {
        const row = generateDaoPermission({
            whoAddress,
            whereAddress,
            conditionAddress,
            condition: undefined,
            conditionEntity: undefined,
            network: undefined,
            who: undefined,
            where: undefined,
        });

        render(createTestComponent({ row, view: 'condition' }));

        expect(
            screen.getByTestId('unrecognized-condition'),
        ).toBeInTheDocument();
    });
});
