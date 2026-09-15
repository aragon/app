import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { IWorkspaceAccountFilterOption } from '../../hooks/useWorkspaceAccountFilter';
import {
    type IWorkspaceAccountDropdownProps,
    WorkspaceAccountDropdown,
} from './workspaceAccountDropdown';

describe('<WorkspaceAccountDropdown /> component', () => {
    const allOption: IWorkspaceAccountFilterOption = {
        id: 'all',
        label: 'All accounts',
        isAllAccounts: true,
    };

    const daoOption: IWorkspaceAccountFilterOption = {
        id: 'dao-account',
        label: 'Demo DAO',
        isAllAccounts: false,
    };

    const createTestComponent = (
        props?: Partial<IWorkspaceAccountDropdownProps>,
    ) => {
        const completeProps: IWorkspaceAccountDropdownProps = {
            options: [allOption, daoOption],
            value: allOption,
            onSelect: jest.fn(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceAccountDropdown {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('labels the trigger with the selected option', () => {
        render(createTestComponent({ value: daoOption }));

        expect(
            screen.getByRole('button', { name: 'Demo DAO' }),
        ).toBeInTheDocument();
    });

    it('calls onSelect with the option picked from the dropdown', async () => {
        const onSelect = jest.fn();
        render(createTestComponent({ onSelect }));

        await userEvent.click(
            screen.getByRole('button', { name: 'All accounts' }),
        );
        await userEvent.click(await screen.findByText('Demo DAO'));

        expect(onSelect).toHaveBeenCalledWith(daoOption);
    });

    it('renders nothing when there is a single option to choose from', () => {
        const { container } = render(
            createTestComponent({ options: [allOption] }),
        );

        expect(container).toBeEmptyDOMElement();
    });
});
