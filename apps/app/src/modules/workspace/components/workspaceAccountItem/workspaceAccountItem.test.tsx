import { addressUtils, GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    type IWorkspaceAccountInfo,
    WorkspaceAccountInfoStatus,
    WorkspaceAccountInfoType,
} from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import {
    type IWorkspaceAccountItemProps,
    WorkspaceAccountItem,
} from './workspaceAccountItem';

describe('<WorkspaceAccountItem /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

    const buildAccount = (
        account?: Partial<IWorkspaceAccount>,
    ): IWorkspaceAccount => ({
        id: `ethereum-sepolia-${address}`,
        type: WorkspaceAccountType.DAO,
        address,
        network: Network.ETHEREUM_SEPOLIA,
        ...account,
    });

    const buildAccountInfo = (
        accountInfo?: Partial<IWorkspaceAccountInfo>,
    ): IWorkspaceAccountInfo => ({
        network: Network.ETHEREUM_SEPOLIA,
        address,
        type: WorkspaceAccountInfoType.DAO,
        status: WorkspaceAccountInfoStatus.AVAILABLE,
        indexed: true,
        ...accountInfo,
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceAccountItemProps>,
    ) => {
        const completeProps: IWorkspaceAccountItemProps = {
            account: buildAccount(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceAccountItem {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('displays the network and the address of the account', () => {
        render(createTestComponent());

        expect(
            screen.getByText(networkDefinitions[Network.ETHEREUM_SEPOLIA].name),
        ).toBeInTheDocument();
        expect(
            screen.getByText(addressUtils.truncateAddress(address)),
        ).toBeInTheDocument();
    });

    it.each([
        [WorkspaceAccountType.DAO, 'dao'],
        [WorkspaceAccountType.SAFE, 'safe'],
    ])('displays the %s type stored on the registry', (type, expected) => {
        render(createTestComponent({ account: buildAccount({ type }) }));

        expect(
            screen.getByText(
                new RegExp(`workspaceAccountItem.type.${expected}`),
            ),
        ).toBeInTheDocument();
    });

    it('displays the name resolved by the accounts API', () => {
        render(
            createTestComponent({
                accountInfo: buildAccountInfo({ name: 'Demo DAO' }),
            }),
        );

        expect(screen.getByText('Demo DAO')).toBeInTheDocument();
    });

    it('prefers the account metadata name over the resolved one, it is what the owner called the account', () => {
        render(
            createTestComponent({
                account: buildAccount({ metadata: { name: 'Main treasury' } }),
                accountInfo: buildAccountInfo({ name: 'Demo DAO' }),
            }),
        );

        expect(screen.getByText('Main treasury')).toBeInTheDocument();
        expect(screen.queryByText('Demo DAO')).not.toBeInTheDocument();
    });
});
