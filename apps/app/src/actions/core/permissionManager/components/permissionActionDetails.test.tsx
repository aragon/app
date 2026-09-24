import { addressUtils } from '@aragon/gov-ui-kit';
import { render, screen, within } from '@testing-library/react';
import * as ensModule from '@/modules/ens';
import * as smartContractService from '@/modules/governance/api/smartContractService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { generateReactQueryResultError } from '@/shared/testUtils';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import { PermissionActionDetails } from './permissionActionDetails';

jest.mock('@/shared/api/daoService', () => ({
    ...jest.requireActual('@/shared/api/daoService'),
    useDao: () => ({
        data: {
            address: '0xdao',
            name: 'Test DAO',
            network: 'ethereum-mainnet',
        },
    }),
}));

jest.mock('@/shared/hooks/useDaoChain', () => ({
    useDaoChain: () => ({
        buildEntityUrl: () => 'https://explorer.test/address',
    }),
}));

jest.mock('../hooks/usePermissionConditionResolver', () => ({
    usePermissionConditionResolver: () => (address: string) =>
        address === '0x80CB2f4f9B403C4C418C597d96c95FE14FD344a6'
            ? 'VotingPower'
            : undefined,
}));

jest.mock('../hooks/usePermissionEntityResolver', () => ({
    usePermissionEntityResolver: () => (address: string) => ({
        label:
            address === '0x0150627b84a0C8257AB28cD0E1F71E81c7aafe3d'
                ? 'Token Voting'
                : 'Test DAO',
        address,
        isSentinel: false,
        type: 'plugin',
    }),
}));

describe('<PermissionActionDetails /> component', () => {
    const useEnsNameSpy = jest.spyOn(ensModule, 'useEnsName');
    const useSmartContractAbiSpy = jest.spyOn(
        smartContractService,
        'useSmartContractAbi',
    );

    beforeEach(() => {
        useEnsNameSpy.mockReturnValue({
            data: null,
            isLoading: false,
        } as ReturnType<typeof ensModule.useEnsName>);
        useSmartContractAbiSpy.mockReturnValue(
            generateReactQueryResultError({ error: new Error() }),
        );
    });

    afterEach(() => {
        useEnsNameSpy.mockReset();
        useSmartContractAbiSpy.mockReset();
    });

    const pluginAddress = '0x0150627b84a0C8257AB28cD0E1F71E81c7aafe3d';
    const daoAddress = '0xC8da4C1d9BB59DD32ac39A925933188b7c66c311';

    const createTestAction = (permissionId: string) =>
        ({
            daoId: 'test-dao',
            type: 'unknown',
            inputData: {
                function: 'grant',
                contract: 'DAO',
                parameters: [
                    { name: '_where', type: 'address', value: pluginAddress },
                    { name: '_who', type: 'address', value: daoAddress },
                    {
                        name: '_permissionId',
                        type: 'bytes32',
                        value: permissionId,
                    },
                ],
            },
        }) as unknown as IProposalActionData;

    const createTestComponent = (action: IProposalActionData) => (
        <PermissionActionDetails action={action} index={0} />
    );

    it('resolves a known permission id to its name while keeping the hash as the value', () => {
        const permissionId =
            permissionNameUtils.getPermissionId('EXECUTE_PERMISSION');
        render(createTestComponent(createTestAction(permissionId)));

        expect(screen.getByText('EXECUTE_PERMISSION')).toBeInTheDocument();
        expect(
            screen.getByText(/permissionManager.permissionTerm/),
        ).toBeInTheDocument();
        expect(
            screen.queryByText(/permissionActionDetails.unknownPermission/),
        ).not.toBeInTheDocument();
    });

    it('marks a permission id outside the known set instead of hiding it', () => {
        const unknownId = `0x${'ab'.repeat(32)}`;
        render(createTestComponent(createTestAction(unknownId)));

        expect(
            screen.getByText(/permissionActionDetails.unknownPermission/),
        ).toBeInTheDocument();
    });

    it('renders without a daoId, resolving the permission name but not the addresses', () => {
        const permissionId =
            permissionNameUtils.getPermissionId('EXECUTE_PERMISSION');
        const { daoId: _daoId, ...actionWithoutDao } = createTestAction(
            permissionId,
        ) as IProposalActionData & { daoId?: string };

        render(createTestComponent(actionWithoutDao as IProposalActionData));

        expect(screen.getByText('EXECUTE_PERMISSION')).toBeInTheDocument();
        expect(
            screen.getByText(/permissionManager.whoTerm/),
        ).toBeInTheDocument();
    });

    it('renders who and where as resolved entities', () => {
        const permissionId =
            permissionNameUtils.getPermissionId('EXECUTE_PERMISSION');
        render(createTestComponent(createTestAction(permissionId)));

        expect(
            screen.getByText(/permissionManager.whoTerm/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/permissionManager.whereTerm/),
        ).toBeInTheDocument();
        expect(screen.getByText('Token Voting')).toBeInTheDocument();
    });
    it('renders the unknown-permission warning inside the permission row', () => {
        const permissionId = `0x${'ab'.repeat(32)}`;
        render(createTestComponent(createTestAction(permissionId)));

        const permissionRow = screen
            .getAllByRole('definition')
            .find(
                (row) =>
                    within(row).queryByText(
                        addressUtils.truncateHash(permissionId),
                    ) != null,
            );

        expect(permissionRow).toBeDefined();
        expect(
            within(permissionRow as HTMLElement).getByText(/unknownPermission/),
        ).toBeInTheDocument();
    });
});
