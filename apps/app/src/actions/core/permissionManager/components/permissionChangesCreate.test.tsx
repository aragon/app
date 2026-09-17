import { addressUtils, GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, type UseFormReturn, useForm } from 'react-hook-form';
import { encodeFunctionData, zeroAddress } from 'viem';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import { PermissionChangesCreate } from './permissionChangesCreate';

describe('<PermissionChangesCreate /> component', () => {
    const whereAddress = '0x0150627b84a0C8257AB28cD0E1F71E81c7aafe3d';
    const whoAddress = '0xC8da4C1d9BB59DD32ac39A925933188b7c66c311';
    const executeId = permissionNameUtils.getPermissionId('EXECUTE_PERMISSION');

    const multiComponents = [
        { name: 'operation', type: 'uint8' },
        { name: 'where', type: 'address' },
        { name: 'who', type: 'address' },
        { name: 'condition', type: 'address' },
        { name: 'permissionId', type: 'bytes32' },
    ];

    const createTestAction = (rows: string[][]) =>
        ({
            daoId: 'test-dao',
            type: 'unknown',
            data: '0x',
            value: '0',
            inputData: {
                function: 'applyMultiTargetPermissions',
                contract: 'DAO',
                parameters: [
                    {
                        name: '_items',
                        type: 'tuple[]',
                        components: multiComponents,
                        value: rows,
                    },
                ],
            },
        }) as unknown as IProposalActionData;

    let formValues: Record<string, unknown> = {};
    let formMethods: UseFormReturn | undefined;

    const createSingleTargetAction = (rows: string[][]) =>
        ({
            daoId: 'test-dao',
            type: 'unknown',
            data: '0x',
            value: '0',
            inputData: {
                function: 'applySingleTargetPermissions',
                contract: 'DAO',
                parameters: [
                    { name: '_where', type: 'address', value: whereAddress },
                    {
                        name: 'items',
                        type: 'tuple[]',
                        components: [
                            { name: 'operation', type: 'uint8' },
                            { name: 'who', type: 'address' },
                            { name: 'permissionId', type: 'bytes32' },
                        ],
                        value: rows,
                    },
                ],
            },
        }) as unknown as IProposalActionData;

    const TestForm = (props: { action: IProposalActionData }) => {
        const methods = useForm({ defaultValues: { actions: [props.action] } });
        formValues = methods.watch() as Record<string, unknown>;
        formMethods = methods as unknown as UseFormReturn;

        return (
            <GukModulesProvider>
                <ReactQueryWrapper>
                    <FormProvider {...methods}>
                        <PermissionChangesCreate
                            action={props.action}
                            index={0}
                        />
                    </FormProvider>
                </ReactQueryWrapper>
            </GukModulesProvider>
        );
    };

    const getRows = () => {
        const actions = formValues.actions as Array<{
            inputData: { parameters: Array<{ value: string[][] }> };
        }>;

        return actions[0].inputData.parameters[0].value;
    };

    const revokeRow = ['1', whereAddress, whoAddress, zeroAddress, executeId];

    const createTestComponent = (rows: string[][]) => (
        <TestForm action={createTestAction(rows)} />
    );

    it('keeps the operation when the active toggle option is clicked again', async () => {
        const user = userEvent.setup();
        render(createTestComponent([revokeRow]));

        // Clicking the selected option makes the ToggleGroup emit an empty value;
        // Number('') is 0, which would silently turn this revoke into a grant.
        await user.click(
            screen.getByRole('radio', { name: /operation.revoke/ }),
        );

        await waitFor(() => expect(getRows()[0][0]).toEqual('1'));
    });

    it('changes the operation when a different option is picked', async () => {
        const user = userEvent.setup();
        render(createTestComponent([revokeRow]));

        await user.click(
            screen.getByRole('radio', { name: /operation.grant$/ }),
        );

        await waitFor(() => expect(getRows()[0][0]).toEqual('0'));
    });

    it('appends a new row serialised by ABI component name, not position', async () => {
        const user = userEvent.setup();
        render(createTestComponent([revokeRow]));

        await user.click(screen.getByText(/permissionChangesCreate.addChange/));

        await waitFor(() => expect(getRows()).toHaveLength(2));

        const [operation, where, who, condition, permissionId] = getRows()[1];
        expect(operation).toEqual('0');
        expect(where).toEqual('');
        expect(who).toEqual('');
        // The zero address is the OSx "no condition" sentinel, not an empty string.
        expect(condition).toEqual(zeroAddress);
        expect(permissionId).toEqual('');
    });

    it('removes the row the remove control belongs to', async () => {
        const user = userEvent.setup();
        const secondRow = [
            '0',
            whereAddress,
            whoAddress,
            zeroAddress,
            executeId,
        ];
        render(createTestComponent([revokeRow, secondRow]));

        const removeControls = screen.getAllByRole('button', {
            name: /permissionChangesCreate.removeChange/,
        });
        await user.click(removeControls[0]);

        await waitFor(() => expect(getRows()).toHaveLength(1));
        expect(getRows()[0][0]).toEqual('0');
    });

    it('keeps the remaining row showing its own addresses after the row above is removed', async () => {
        const user = userEvent.setup();
        const otherWho = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
        const secondRow = ['0', whereAddress, otherWho, zeroAddress, executeId];
        render(createTestComponent([revokeRow, secondRow]));

        const [firstRemove] = screen.getAllByRole('button', {
            name: /permissionChangesCreate.removeChange/,
        });
        await user.click(firstRemove);

        await waitFor(() => expect(getRows()).toHaveLength(1));

        // The address inputs hold local state, so the surviving row must be the same
        // React element it was, not the removed row's inputs re-pointed at new data.
        // AddressInput shows addresses truncated, so match what it renders.
        expect(
            screen.getByDisplayValue(addressUtils.truncateAddress(otherWho)),
        ).toBeInTheDocument();
        expect(
            screen.queryByDisplayValue(
                addressUtils.truncateAddress(whoAddress),
            ),
        ).not.toBeInTheDocument();
    });

    it('hoists the single target above the rows and reads it from the parameter before the tuple', () => {
        render(
            <TestForm
                action={createSingleTargetAction([
                    ['0', whoAddress, executeId],
                ])}
            />,
        );

        // One Where for the action, none inside the row.
        expect(
            screen.getAllByText(/permissionActionDetails.whereTerm/),
        ).toHaveLength(1);
        expect(
            screen.getAllByText(/permissionActionDetails.whoTerm/),
        ).toHaveLength(1);
    });

    it("does not hand the removed row's errors to the row that slides into its place", async () => {
        const user = userEvent.setup();
        const incompleteRow = ['1', whereAddress, '', zeroAddress, executeId];
        const completeRow = [
            '0',
            whereAddress,
            whoAddress,
            zeroAddress,
            executeId,
        ];
        render(createTestComponent([incompleteRow, completeRow]));

        const whoOfFirstRow = 'actions.0.inputData.parameters.0.value.0.2';

        await formMethods?.trigger(whoOfFirstRow);
        expect(formMethods?.getFieldState(whoOfFirstRow).error).toBeDefined();

        const [firstRemove] = screen.getAllByRole('button', {
            name: /permissionChangesCreate.removeChange/,
        });
        await user.click(firstRemove);

        await waitFor(() => expect(getRows()).toHaveLength(1));
        // The surviving row now lives at index 0 and must not carry the old row's error.
        expect(getRows()[0][2]).toEqual(whoAddress);
        expect(formMethods?.getFieldState(whoOfFirstRow).error).toBeUndefined();
    });

    it('re-encodes the calldata from the rows', async () => {
        render(createTestComponent([revokeRow]));

        const expectedData = encodeFunctionData({
            abi: [
                {
                    type: 'function',
                    name: 'applyMultiTargetPermissions',
                    inputs: [
                        {
                            name: '_items',
                            type: 'tuple[]',
                            components: multiComponents,
                        },
                    ],
                },
            ],
            args: [[revokeRow]],
        });

        await waitFor(() => {
            const actions = formValues.actions as Array<{ data?: string }>;
            expect(actions[0].data).toEqual(expectedData);
        });
    });
});
