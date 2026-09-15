import { ProposalActionsDecoderMode } from '@aragon/gov-ui-kit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { ReactQueryWrapper } from '@/shared/testUtils/reactQueryWrapper';
import { permissionNameUtils } from '@/shared/utils/permissionNameUtils';
import { PermissionChangesEditor } from './permissionChangesEditor';

describe('<PermissionChangesEditor /> component', () => {
    const zeroAddress = `0x${'0'.repeat(40)}`;
    const where = '0xAB98085757BFd1C2718fF3cFa390a3db2e8fd209';
    const who = '0x7bDAE736352aF4d2aa42fF4c828CeF9D92Ed0938';

    const multiTargetParameter = (rows: string[][]) => ({
        name: '_items',
        type: 'tuple[]',
        value: rows,
        components: [
            { name: 'operation', type: 'uint8' },
            { name: 'where', type: 'address' },
            { name: 'who', type: 'address' },
            { name: 'condition', type: 'address' },
            { name: 'permissionId', type: 'bytes32' },
        ],
    });

    let formValues: Record<string, unknown> = {};

    const TestHarness: React.FC<{ rows: string[][] }> = ({ rows }) => {
        const methods = useForm({
            defaultValues: { inputData: { parameters: [{ value: rows }] } },
        });
        formValues = methods.watch() as Record<string, unknown>;

        return (
            <ReactQueryWrapper>
                <FormProvider {...methods}>
                    <button onClick={() => methods.trigger()} type="button">
                        Validate
                    </button>
                    <PermissionChangesEditor
                        fieldName="value"
                        formPrefix="inputData.parameters.0"
                        mode={ProposalActionsDecoderMode.EDIT}
                        parameter={multiTargetParameter(rows)}
                    />
                </FormProvider>
            </ReactQueryWrapper>
        );
    };

    const readRows = () =>
        (
            formValues as {
                inputData: { parameters: Array<{ value: string[][] }> };
            }
        ).inputData.parameters[0].value;

    it('shows errors after form validation and clears them as values are corrected', async () => {
        const user = userEvent.setup({ delay: null });
        render(<TestHarness rows={[]} />);

        expect(
            screen.queryByText(/multiTarget\.required/u),
        ).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Validate' }));
        // trigger() resolves asynchronously, so wait for the messages rather than
        // relying on typing delays to have given it time.
        expect(
            await screen.findAllByText(/multiTarget\.required/u),
        ).toHaveLength(3);
        await user.type(
            screen.getByRole('textbox', { name: 'who (address)' }),
            who,
        );
        await waitFor(() =>
            expect(screen.getAllByText(/multiTarget\.required/u)).toHaveLength(
                2,
            ),
        );
    });

    it('does not show required errors for a newly added row', async () => {
        const user = userEvent.setup({ delay: null });
        const rootId = permissionNameUtils.getPermissionId('ROOT_PERMISSION');
        render(<TestHarness rows={[['0', where, who, zeroAddress, rootId]]} />);
        await user.click(screen.getByText(/multiTarget\.addChange/u));
        expect(
            screen.queryByText(/multiTarget\.required/u),
        ).not.toBeInTheDocument();
    });

    it('renders one editable row per change rather than raw ABI fields', () => {
        const rootId = permissionNameUtils.getPermissionId('ROOT_PERMISSION');

        render(<TestHarness rows={[['0', where, who, zeroAddress, rootId]]} />);

        expect(
            screen.getByText(/permissionManagerAction\.operation\.grant$/u),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/permissionManagerAction\.operation\.revoke/u),
        ).toBeInTheDocument();
    });

    it('seeds one row so a freshly picked action shows every field', () => {
        render(<TestHarness rows={[]} />);

        const rows = readRows();
        expect(rows).toHaveLength(1);
        // Defaults to Grant with an unconditional zero-address condition.
        expect(rows[0][0]).toBe('0');
        // where and who are both on screen without touching Add change.
        expect(screen.getAllByText(/\(address\)/u).length).toBeGreaterThan(1);
    });

    it('keeps a custom permission hash visible instead of a generic placeholder', () => {
        const customId = `0x${'ab'.repeat(32)}`;

        render(
            <TestHarness rows={[['0', where, who, zeroAddress, customId]]} />,
        );

        // An unknown hash has no name to fall back on, so it must be shown verbatim.
        expect(screen.getByText(customId)).toBeInTheDocument();
    });

    it('does not re-seed a blank row when the last imported row is removed', async () => {
        const user = userEvent.setup({ delay: null });
        const rootId = permissionNameUtils.getPermissionId('ROOT_PERMISSION');

        render(<TestHarness rows={[['1', where, who, zeroAddress, rootId]]} />);

        const [removeRow] = screen.getAllByRole('button', {
            name: /multiTarget\.removeChange/u,
        });
        await user.click(removeRow);

        // Deleting the last imported row must leave it deleted, not hand back a blank
        // grant with empty required fields.
        expect(readRows()).toHaveLength(0);
    });

    it('ignores a deselect on the operation toggle', async () => {
        const user = userEvent.setup({ delay: null });
        const rootId = permissionNameUtils.getPermissionId('ROOT_PERMISSION');

        render(<TestHarness rows={[['1', where, who, zeroAddress, rootId]]} />);

        // Clicking the selected toggle deselects and emits ''. Number('') is 0, which
        // would silently turn this Revoke into a Grant.
        await user.click(
            screen.getByText(/permissionManagerAction\.operation\.revoke/u),
        );

        expect(readRows()[0][0]).toBe('1');
    });

    it('clears the condition when leaving conditional mode', async () => {
        const user = userEvent.setup({ delay: null });
        const rootId = permissionNameUtils.getPermissionId('ROOT_PERMISSION');

        render(<TestHarness rows={[['2', where, who, where, rootId]]} />);

        await user.click(
            screen.getByText(/permissionManagerAction\.operation\.grant$/u),
        );

        // A leftover condition breaks encoding when malformed, and OSx rejects an
        // ordinary grant that carries one.
        expect(readRows()[0][3]).toBe(zeroAddress);
    });

    it('validates the permission picker on blur under onTouched', async () => {
        const user = userEvent.setup({ delay: null });

        const TouchedHarness = () => {
            const methods = useForm({
                defaultValues: {
                    inputData: {
                        parameters: [
                            { value: [['0', where, who, zeroAddress, '']] },
                        ],
                    },
                },
                mode: 'onTouched',
            });

            return (
                <ReactQueryWrapper>
                    <FormProvider {...methods}>
                        <PermissionChangesEditor
                            fieldName="value"
                            formPrefix="inputData.parameters.0"
                            mode={ProposalActionsDecoderMode.EDIT}
                            parameter={multiTargetParameter([
                                ['0', where, who, zeroAddress, ''],
                            ])}
                        />
                    </FormProvider>
                </ReactQueryWrapper>
            );
        };

        render(<TouchedHarness />);

        // The wizard runs in onTouched mode, so a field that never reports blur is
        // never marked touched and never validates.
        await user.click(screen.getByLabelText(/permissionId/u));
        await user.tab();

        expect(
            await screen.findByText(/multiTarget\.required/u),
        ).toBeInTheDocument();
    });

    it('renders the row fields in ABI component order', () => {
        const rootId = permissionNameUtils.getPermissionId('ROOT_PERMISSION');

        render(<TestHarness rows={[['2', where, who, where, rootId]]} />);

        const labels = screen
            .getAllByText(/\((address|bytes32|uint8)\)|permission\.label/u)
            .map((node) => node.textContent ?? '');

        // operation, where, who, condition, permissionId — the order of the ABI tuple.
        expect(labels[0]).toMatch(/operation/u);
        expect(labels[1]).toMatch(/where/u);
        expect(labels[2]).toMatch(/who/u);
        expect(labels[3]).toMatch(/condition/u);
    });

    it('appends a row in ABI component order when adding a change', async () => {
        const user = userEvent.setup({ delay: null });
        const rootId = permissionNameUtils.getPermissionId('ROOT_PERMISSION');

        render(<TestHarness rows={[['1', where, who, zeroAddress, rootId]]} />);

        await user.click(screen.getByText(/multiTarget\.addChange/u));

        const rows = readRows();
        expect(rows).toHaveLength(2);
        // Existing row survives untouched, in positional order.
        expect(rows[0]).toEqual(['1', where, who, zeroAddress, rootId]);
        // New row defaults to Grant and an unconditional zero-address condition.
        expect(rows[1][0]).toBe('0');
        expect(rows[1][3]).toBe(zeroAddress);
    });

    it('removes the row that was dismissed, keeping the rest in order', async () => {
        const user = userEvent.setup({ delay: null });
        const rootId = permissionNameUtils.getPermissionId('ROOT_PERMISSION');
        const executeId =
            permissionNameUtils.getPermissionId('EXECUTE_PERMISSION');

        render(
            <TestHarness
                rows={[
                    ['0', where, who, zeroAddress, rootId],
                    ['1', where, who, zeroAddress, executeId],
                ]}
            />,
        );

        const [removeFirst] = screen.getAllByRole('button', {
            name: /multiTarget\.removeChange/u,
        });
        await user.click(removeFirst);

        const rows = readRows();
        expect(rows).toHaveLength(1);
        expect(rows[0][4]).toBe(executeId);
    });
});
