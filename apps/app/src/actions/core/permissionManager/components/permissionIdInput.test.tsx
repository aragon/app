import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, type UseFormReturn, useForm } from 'react-hook-form';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import { PermissionIdInput } from './permissionIdInput';

describe('<PermissionIdInput /> component', () => {
    let form: UseFormReturn<{ action: { permissionId: string } }>;
    const path = 'action.permissionId';
    const TestForm = (props: { permissionId?: string }) => {
        // Same validation mode as the proposal wizard.
        form = useForm({
            mode: 'onTouched',
            defaultValues: {
                action: { permissionId: props.permissionId ?? '' },
            },
        });
        return (
            <FormProvider {...form}>
                <PermissionIdInput fieldPrefix="action" name="permissionId" />
            </FormProvider>
        );
    };

    it('stores the selected dictionary permission and clears it on request', async () => {
        const user = userEvent.setup();
        render(<TestForm />);
        await user.type(screen.getByRole('combobox'), 'EXECUTE_PERMISSION');
        await user.click(screen.getByText('EXECUTE_PERMISSION'));
        expect(form.getValues(path)).toBe(
            permissionNameUtils.getPermissionId('EXECUTE_PERMISSION'),
        );
        expect(screen.queryByText(/unknownPermission/)).not.toBeInTheDocument();
        await user.click(
            screen.getByRole('button', { name: /changePermission/ }),
        );
        expect(form.getValues(path)).toBe('');
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it.each([
        [
            'CUSTOM_PERMISSION',
            permissionNameUtils.getPermissionId('CUSTOM_PERMISSION'),
        ],
        [`0x${'ab'.repeat(32)}`, `0x${'ab'.repeat(32)}`],
    ])(
        'stores a custom permission entered as %s',
        async (input, expectedId) => {
            const user = userEvent.setup();
            render(<TestForm />);
            await user.type(screen.getByRole('combobox'), input);
            await user.click(screen.getByText(/customItem/));
            expect(form.getValues(path)).toBe(expectedId);
            expect(screen.getByText(expectedId)).toBeInTheDocument();
            expect(screen.getByText(/unknownPermission/)).toBeInTheDocument();
        },
    );

    it.each(['lowercase_permission', '0x1234', 'INVALID NAME'])(
        'keeps %s next to the error explaining why it is not a valid permission',
        async (input) => {
            const user = userEvent.setup();
            render(<TestForm />);
            await user.type(screen.getByRole('combobox'), input);
            await user.click(screen.getByText(/customItem/));
            expect(form.getValues(path)).toBe(input);
            expect(screen.getByRole('combobox')).toHaveDisplayValue(input);
            expect(
                await screen.findByText(/invalidPermissionName/),
            ).toBeInTheDocument();
        },
    );

    it('shows rejected text again when the field mounts with it in the form', () => {
        render(<TestForm permissionId="lowercase_permission" />);
        expect(screen.getByRole('combobox')).toHaveDisplayValue(
            'lowercase_permission',
        );
    });

    it('replaces rejected text once a valid permission is picked', async () => {
        const user = userEvent.setup();
        render(<TestForm />);
        const input = screen.getByRole('combobox');
        await user.type(input, 'lowercase_permission');
        await user.click(screen.getByText(/customItem/));
        expect(
            await screen.findByText(/invalidPermissionName/),
        ).toBeInTheDocument();

        // The menu closes on select and reopens on focus.
        await user.tab();
        await user.clear(input);
        await user.type(input, 'EXECUTE_PERMISSION');
        await user.click(screen.getByText('EXECUTE_PERMISSION'));

        expect(form.getValues(path)).toBe(
            permissionNameUtils.getPermissionId('EXECUTE_PERMISSION'),
        );
        await waitFor(() => {
            expect(form.getFieldState(path).error).toBeUndefined();
        });
        expect(
            screen.queryByText(/invalidPermissionName/),
        ).not.toBeInTheDocument();
    });

    it('clears a shown error once a permission is picked', async () => {
        const user = userEvent.setup();
        render(<TestForm />);

        await act(async () => {
            await form.trigger(path);
        });
        expect(form.getFieldState(path).error).toBeDefined();

        await user.type(screen.getByRole('combobox'), 'EXECUTE_PERMISSION');
        await user.click(screen.getByText('EXECUTE_PERMISSION'));

        await waitFor(() => {
            expect(form.getFieldState(path).error).toBeUndefined();
        });
    });
});
