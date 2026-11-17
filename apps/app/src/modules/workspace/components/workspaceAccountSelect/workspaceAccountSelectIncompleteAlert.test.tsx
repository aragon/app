import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as useWalletAccountModule from '@/modules/application/hooks/useWalletAccount';
import * as useWorkspaceAccountSuggestionsModule from '../../hooks/useWorkspaceAccountSuggestions';
import { WorkspaceAccountSelectIncompleteAlert } from './workspaceAccountSelectIncompleteAlert';

describe('<WorkspaceAccountSelectIncompleteAlert /> component', () => {
    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountModule,
        'useWalletAccount',
    );
    const useSuggestionsSpy = jest.spyOn(
        useWorkspaceAccountSuggestionsModule,
        'useWorkspaceAccountSuggestions',
    );

    const refetchMock = jest.fn();

    beforeEach(() => {
        useWalletAccountSpy.mockReturnValue({
            address: '0x5dcD623bf6E792bfBDbf8d643f6478153df4A8D2',
        } as unknown as ReturnType<
            typeof useWalletAccountModule.useWalletAccount
        >);
        useSuggestionsSpy.mockReturnValue({
            isPending: false,
            isError: false,
            isIncomplete: true,
            refetch: refetchMock,
            suggestions: [],
        });
    });

    afterEach(() => {
        useWalletAccountSpy.mockReset();
        useSuggestionsSpy.mockReset();
        refetchMock.mockReset();
    });

    const createTestComponent = () => (
        <GukModulesProvider>
            <WorkspaceAccountSelectIncompleteAlert />
        </GukModulesProvider>
    );

    it('warns that accounts are missing and reads them again on retry', async () => {
        render(createTestComponent());

        expect(
            screen.getByText('app.workspace.workspaceAccountSelect.incomplete'),
        ).toBeInTheDocument();
        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.workspace.workspaceAccountSelect.retry',
            }),
        );
        expect(refetchMock).toHaveBeenCalled();
    });

    it('renders nothing while the list is read or once it is complete', () => {
        useSuggestionsSpy.mockReturnValue({
            isPending: true,
            isError: false,
            isIncomplete: true,
            refetch: refetchMock,
            suggestions: [],
        });
        const { container, rerender } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();

        useSuggestionsSpy.mockReturnValue({
            isPending: false,
            isError: false,
            isIncomplete: false,
            refetch: refetchMock,
            suggestions: [],
        });
        rerender(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });
});
