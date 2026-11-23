import { addressUtils, GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Network } from '@/shared/api/daoService';
import { generateDao } from '@/shared/testUtils';
import {
    WorkspaceAccountInfoStatus,
    WorkspaceAccountInfoType,
} from '../../api/workspaceQueryService';
import { WorkspaceAccountType } from '../../api/workspaceService';
import {
    type IWorkspaceSelectAccountDialogItemProps,
    WorkspaceSelectAccountDialogItem,
} from './workspaceSelectAccountDialogItem';

describe('<WorkspaceSelectAccountDialogItem /> component', () => {
    const address = '0x1F01e6fe406295c9fe42189A2ef999636a04132a';
    const account = {
        id: `${Network.ETHEREUM_SEPOLIA}-${address}`,
        type: WorkspaceAccountType.SAFE,
        address,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const createTestComponent = (
        props?: Partial<IWorkspaceSelectAccountDialogItemProps>,
    ) => {
        const completeProps: IWorkspaceSelectAccountDialogItemProps = {
            account,
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceSelectAccountDialogItem {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('displays the type of the account when not in multi-select mode', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceSelectAccountDialogItem.type.safe/),
        ).toBeInTheDocument();
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('displays the name the accounts API resolved', () => {
        render(
            createTestComponent({
                accountInfo: {
                    network: Network.ETHEREUM_SEPOLIA,
                    address,
                    type: WorkspaceAccountInfoType.SAFE,
                    status: WorkspaceAccountInfoStatus.AVAILABLE,
                    indexed: true,
                    name: 'Treasury',
                },
            }),
        );

        expect(screen.getByText('Treasury')).toBeInTheDocument();
    });

    describe('multi-select mode', () => {
        it('displays a checkbox reflecting the selection and the note', () => {
            render(
                createTestComponent({
                    isMultiSelect: true,
                    isActive: true,
                    note: 'Member',
                }),
            );

            expect(screen.getByRole('checkbox')).toBeChecked();
            expect(screen.getByText('Member')).toBeInTheDocument();
            expect(
                screen.queryByText(/workspaceSelectAccountDialogItem.type/),
            ).not.toBeInTheDocument();
        });

        it('labels the checkbox with the account', () => {
            render(createTestComponent({ isMultiSelect: true }));

            expect(screen.getByRole('checkbox')).toHaveAccessibleName(
                new RegExp(addressUtils.truncateAddress(address)),
            );
        });

        it('toggles the selection from the checkbox', async () => {
            const onClick = jest.fn();
            render(createTestComponent({ isMultiSelect: true, onClick }));

            await userEvent.click(screen.getByRole('checkbox'));

            expect(onClick).toHaveBeenCalledTimes(1);
        });

        it('disables the checkbox of a disabled account', () => {
            render(
                createTestComponent({ isMultiSelect: true, isDisabled: true }),
            );

            expect(screen.getByRole('checkbox')).toBeDisabled();
        });
    });

    it('does not select an account already in the workspace', async () => {
        const onClick = jest.fn();
        render(
            createTestComponent({
                isMultiSelect: true,
                isInWorkspace: true,
                onClick,
            }),
        );

        expect(screen.getByRole('checkbox')).toBeDisabled();
        await userEvent.click(screen.getByText('Ethereum Sepolia'));

        expect(onClick).not.toHaveBeenCalled();
    });

    it('shows the full address in a tooltip on its truncated form', async () => {
        render(createTestComponent());

        await userEvent.hover(
            screen.getAllByText(addressUtils.truncateAddress(address))[0],
        );

        expect(await screen.findByRole('tooltip')).toHaveTextContent(address);
    });

    it('names a DAO without a name by its address, like any other account', () => {
        render(createTestComponent({ dao: generateDao({ name: '' }) }));

        const truncated = addressUtils.truncateAddress(address);
        expect(screen.getAllByText(truncated)).toHaveLength(1);
        expect(screen.getByText('Ethereum Sepolia')).toBeInTheDocument();
    });
});
