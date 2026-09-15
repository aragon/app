import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Network } from '@/shared/api/daoService';
import { FormWrapper, ReactQueryWrapper } from '@/shared/testUtils';
import { workspaceQueryService } from '../../../api/workspaceQueryService';
import { createWorkspaceFormDefaultValues } from '../createWorkspaceFormDefinitions';
import {
    CreateWorkspaceFormAccounts,
    type ICreateWorkspaceFormAccountsProps,
} from './createWorkspaceFormAccounts';

describe('<CreateWorkspaceFormAccounts /> component', () => {
    const getAccountsSpy = jest.spyOn(workspaceQueryService, 'getAccounts');

    beforeEach(() => {
        getAccountsSpy.mockResolvedValue([]);
    });

    afterEach(() => {
        getAccountsSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ICreateWorkspaceFormAccountsProps>,
        defaultValues: Record<
            string,
            unknown
        > = createWorkspaceFormDefaultValues,
    ) => {
        const completeProps: ICreateWorkspaceFormAccountsProps = { ...props };

        return (
            <ReactQueryWrapper>
                <GukModulesProvider>
                    <FormWrapper defaultValues={defaultValues}>
                        <CreateWorkspaceFormAccounts {...completeProps} />
                    </FormWrapper>
                </GukModulesProvider>
            </ReactQueryWrapper>
        );
    };

    it('renders one account row by default', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/createWorkspaceForm.accounts.label/),
        ).toBeInTheDocument();
        expect(
            screen.getAllByPlaceholderText(
                /createWorkspaceForm.address.placeholder/,
            ),
        ).toHaveLength(1);
    });

    it('appends an account row on add', async () => {
        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: /createWorkspaceForm.accounts.add/,
            }),
        );

        expect(
            screen.getAllByPlaceholderText(
                /createWorkspaceForm.address.placeholder/,
            ),
        ).toHaveLength(2);
    });

    it('resolves a filled in account address through the workspace accounts API', async () => {
        const account = {
            network: Network.ETHEREUM_SEPOLIA,
            address: '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
        };

        render(createTestComponent(undefined, { accounts: [account] }));

        await waitFor(() =>
            expect(getAccountsSpy).toHaveBeenCalledWith({
                body: { accounts: [account] },
            }),
        );
    });

    it('does not resolve an empty account address', () => {
        render(createTestComponent());

        expect(getAccountsSpy).not.toHaveBeenCalled();
    });

    it('hides the account metadata fields until the metadata section is opened', async () => {
        render(createTestComponent());

        expect(
            screen.queryByText(/accounts.metadata.title/),
        ).not.toBeInTheDocument();

        await userEvent.click(
            screen.getByRole('button', {
                name: /accounts.metadata.show/,
            }),
        );

        expect(screen.getByText(/accounts.metadata.title/)).toBeInTheDocument();
        expect(
            screen.getByText(/accounts.metadata.name.label/),
        ).toBeInTheDocument();
    });

    it('closes the account metadata section again', async () => {
        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', { name: /accounts.metadata.show/ }),
        );
        await userEvent.click(
            screen.getByRole('button', { name: /accounts.metadata.hide/ }),
        );

        expect(
            screen.queryByText(/accounts.metadata.title/),
        ).not.toBeInTheDocument();
    });
});
