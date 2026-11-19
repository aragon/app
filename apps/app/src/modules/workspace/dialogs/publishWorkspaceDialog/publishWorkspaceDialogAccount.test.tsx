import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import {
    type IWorkspaceAccountInfo,
    WorkspaceAccountInfoStatus,
    WorkspaceAccountInfoType,
} from '../../api/workspaceQueryService';
import {
    type IPublishWorkspaceDialogAccountProps,
    PublishWorkspaceDialogAccount,
} from './publishWorkspaceDialogAccount';

describe('<PublishWorkspaceDialogAccount /> component', () => {
    const network = Network.ETHEREUM_SEPOLIA;
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

    const buildAccountInfo = (
        accountInfo?: Partial<IWorkspaceAccountInfo>,
    ): IWorkspaceAccountInfo => ({
        network,
        address,
        type: WorkspaceAccountInfoType.DAO,
        status: WorkspaceAccountInfoStatus.AVAILABLE,
        indexed: true,
        name: 'Demo DAO',
        ...accountInfo,
    });

    const createTestComponent = (
        props?: Partial<IPublishWorkspaceDialogAccountProps>,
    ) => {
        const completeProps: IPublishWorkspaceDialogAccountProps = {
            account: { network, address },
            accountInfo: buildAccountInfo(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <PublishWorkspaceDialogAccount {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('names a DAO by its indexed name, with its network, address and type', () => {
        render(createTestComponent());

        expect(screen.getByText('Demo DAO')).toBeInTheDocument();
        expect(screen.getByText(/· 0xE8fd…0De5$/)).toBeInTheDocument();
        expect(screen.getByText(/account\.type\.dao$/)).toBeInTheDocument();
    });

    it('prefers the name the user gave the account', () => {
        render(
            createTestComponent({
                account: {
                    network,
                    address,
                    metadata: { name: ' Treasury ', description: '' },
                },
            }),
        );

        expect(screen.getByText('Treasury')).toBeInTheDocument();
        expect(screen.queryByText('Demo DAO')).not.toBeInTheDocument();
    });

    it('calls an unnamed Safe a Safe', () => {
        render(
            createTestComponent({
                accountInfo: buildAccountInfo({
                    type: WorkspaceAccountInfoType.SAFE,
                    name: null,
                }),
            }),
        );

        expect(screen.getByText(/account\.safe$/)).toBeInTheDocument();
        expect(screen.getByText(/account\.type\.safe$/)).toBeInTheDocument();
    });

    it('shows the address alone, with no type, until the account resolves', () => {
        render(createTestComponent({ accountInfo: undefined }));

        expect(screen.getByText('0xE8fd…0De5')).toBeInTheDocument();
        expect(screen.queryByText(/account\.type\./)).not.toBeInTheDocument();
    });
});
