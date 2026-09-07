import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { FormWrapper, ReactQueryWrapper } from '@/shared/testUtils';
import { createWorkspaceFormDefaultValues } from '../createWorkspaceFormDefinitions';
import {
    CreateWorkspaceFormAccounts,
    type ICreateWorkspaceFormAccountsProps,
} from './createWorkspaceFormAccounts';

describe('<CreateWorkspaceFormAccounts /> component', () => {
    const createTestComponent = (
        props?: Partial<ICreateWorkspaceFormAccountsProps>,
    ) => {
        const completeProps: ICreateWorkspaceFormAccountsProps = { ...props };

        return (
            <ReactQueryWrapper>
                <GukModulesProvider>
                    <FormWrapper
                        defaultValues={createWorkspaceFormDefaultValues}
                    >
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
