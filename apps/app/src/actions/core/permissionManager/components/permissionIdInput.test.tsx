import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, type UseFormReturn, useForm } from 'react-hook-form';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import { PermissionIdInput } from './permissionIdInput';

describe('<PermissionIdInput /> component', () => {
    let form: UseFormReturn<{ action: { permissionId: string } }>;
    const path = 'action.permissionId';
    const TestForm = () => {
        form = useForm({ defaultValues: { action: { permissionId: '' } } });
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
        'explains why %s is not a valid permission',
        async (input) => {
            const user = userEvent.setup();
            render(<TestForm />);
            await user.type(screen.getByRole('combobox'), input);
            await user.click(screen.getByText(/customItem/));
            expect(form.getValues(path)).toBe('');
            expect(
                screen.getByText(/invalidPermissionName/),
            ).toBeInTheDocument();
            await act(async () => {
                await form.trigger(path);
            });
            expect(form.getFieldState(path).error).toBeDefined();
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        },
    );
});
