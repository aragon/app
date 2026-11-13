import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateDaoDialogId } from '@/modules/createDao/constants/createDaoDialogId';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext } from '@/shared/testUtils';
import * as useCreateSafeAccountHook from '../../hooks/useCreateSafeAccount';
import { WorkspaceCreateAccountDropdown } from './workspaceCreateAccountDropdown';

describe('<WorkspaceCreateAccountDropdown /> component', () => {
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useCreateSafeAccountSpy = jest.spyOn(
        useCreateSafeAccountHook,
        'useCreateSafeAccount',
    );

    afterEach(() => {
        useDialogContextSpy.mockReset();
        useCreateSafeAccountSpy.mockReset();
    });

    const renderDropdown = async () => {
        const open = jest.fn();
        const createSafe = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
        useCreateSafeAccountSpy.mockReturnValue({ createSafe });

        render(<WorkspaceCreateAccountDropdown />);
        await userEvent.click(
            screen.getByRole('button', {
                name: /workspaceCreateAccountDropdown.label/,
            }),
        );

        return { open, createSafe };
    };

    it('opens DAO creation from the DAO option', async () => {
        const { open, createSafe } = await renderDropdown();

        await userEvent.click(
            screen.getByRole('menuitem', {
                name: /workspaceCreateAccountDropdown.dao/,
            }),
        );

        expect(open).toHaveBeenCalledWith(CreateDaoDialogId.CREATE_DAO_DETAILS);
        expect(createSafe).not.toHaveBeenCalled();
    });

    it('starts the Safe creation from the Safe option', async () => {
        const { open, createSafe } = await renderDropdown();

        await userEvent.click(
            screen.getByRole('menuitem', {
                name: /workspaceCreateAccountDropdown.safe/,
            }),
        );

        expect(createSafe).toHaveBeenCalled();
        expect(open).not.toHaveBeenCalled();
    });
});
