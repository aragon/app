import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { encodeFunctionData } from 'viem';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import { PermissionActionCreate } from './permissionActionCreate';

describe('<PermissionActionCreate /> component', () => {
    const whereAddress = '0x0150627b84a0C8257AB28cD0E1F71E81c7aafe3d';
    const whoAddress = '0xC8da4C1d9BB59DD32ac39A925933188b7c66c311';
    const executeId = permissionNameUtils.getPermissionId('EXECUTE_PERMISSION');

    const grantParameters = [
        { name: '_where', type: 'address', value: whereAddress },
        { name: '_who', type: 'address', value: whoAddress },
        { name: '_permissionId', type: 'bytes32', value: executeId },
    ];

    const createTestAction = () =>
        ({
            daoId: 'test-dao',
            type: 'unknown',
            data: '0x',
            value: '0',
            inputData: {
                function: 'grant',
                contract: 'DAO',
                parameters: grantParameters,
            },
        }) as unknown as IProposalActionData;

    let formValues: Record<string, unknown> = {};

    const TestForm = (props: { action: IProposalActionData }) => {
        const methods = useForm({
            defaultValues: { actions: [props.action] },
        });
        formValues = methods.watch() as Record<string, unknown>;

        return (
            <GukModulesProvider>
                <ReactQueryWrapper>
                    <FormProvider {...methods}>
                        <PermissionActionCreate
                            action={props.action}
                            index={0}
                        />
                    </FormProvider>
                </ReactQueryWrapper>
            </GukModulesProvider>
        );
    };

    const createTestComponent = () => <TestForm action={createTestAction()} />;

    it('encodes the calldata from the entered parameters', async () => {
        render(createTestComponent());

        const expectedData = encodeFunctionData({
            abi: [{ type: 'function', name: 'grant', inputs: grantParameters }],
            args: [whereAddress, whoAddress, executeId],
        });

        await waitFor(() => {
            const actions = formValues.actions as Array<{ data?: string }>;
            expect(actions[0].data).toEqual(expectedData);
        });
    });

    it('renders the resolved name of a known permission alongside its id', () => {
        render(createTestComponent());

        expect(screen.getByText('EXECUTE_PERMISSION')).toBeInTheDocument();
        expect(screen.getByText(executeId)).toBeInTheDocument();
    });

    it('hashes a typed permission name instead of rejecting it', async () => {
        const user = userEvent.setup();
        render(createTestComponent());

        // Clear the current selection to get back to the picker.
        await user.click(
            screen.getByRole('button', { name: /changePermission/ }),
        );

        const input = screen.getByRole('combobox');
        await user.type(input, 'GAUGE_REGISTRAR_ROLE');

        await waitFor(() =>
            expect(screen.getByText(/customItem/)).toBeInTheDocument(),
        );
        await user.click(screen.getByText(/customItem/));

        const expectedId = permissionNameUtils.getPermissionId(
            'GAUGE_REGISTRAR_ROLE',
        );

        await waitFor(() =>
            expect(screen.getByText(expectedId)).toBeInTheDocument(),
        );
        // Typed by the user or not, the dictionary does not know it, so say so.
        expect(
            screen.getByText(/permissionActionCreate.unknownPermission/),
        ).toBeInTheDocument();
    });

    it('does not flag a permission from the dictionary', () => {
        render(createTestComponent());

        expect(
            screen.queryByText(/permissionActionCreate.unknownPermission/),
        ).not.toBeInTheDocument();
    });
});
