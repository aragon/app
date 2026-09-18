import { render, screen } from '@testing-library/react';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import { PermissionActionDetails } from './permissionActionDetails';

jest.mock('@/shared/api/daoService', () => ({
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
            screen.getByText(/permissionActionDetails.permissionTerm/),
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
            screen.getByText(/permissionActionDetails.whoTerm/),
        ).toBeInTheDocument();
    });

    it('renders who and where as resolved entities', () => {
        const permissionId =
            permissionNameUtils.getPermissionId('EXECUTE_PERMISSION');
        render(createTestComponent(createTestAction(permissionId)));

        expect(
            screen.getByText(/permissionActionDetails.whoTerm/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/permissionActionDetails.whereTerm/),
        ).toBeInTheDocument();
        expect(screen.getByText('Token Voting')).toBeInTheDocument();
    });
});
