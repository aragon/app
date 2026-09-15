import {
    act,
    render,
    renderHook,
    screen,
    within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, useState } from 'react';
import {
    FormProvider,
    type UseFormReturn,
    useFieldArray,
    useForm,
    useFormContext,
} from 'react-hook-form';
import { FormWrapper } from '@/shared/testUtils';
import { plausibleAnalyticsUtils } from '@/shared/utils/plausibleAnalyticsUtils';
import type { IProposalActionData } from '../../components/createProposalForm';
import { useProposalActionsField } from './useProposalActionsField';

describe('useProposalActionsField hook', () => {
    const trackAnalyticsSpy = jest.spyOn(plausibleAnalyticsUtils, 'track');

    beforeEach(() => {
        trackAnalyticsSpy.mockImplementation(() => undefined);
    });

    afterEach(() => {
        trackAnalyticsSpy.mockReset();
    });

    const generateAction = (
        action?: Partial<IProposalActionData>,
    ): IProposalActionData =>
        ({
            type: 'transfer',
            daoId: 'test',
            meta: undefined,
            ...action,
        }) as IProposalActionData;

    it('starts with an empty action list', () => {
        const { result } = renderHook(() => useProposalActionsField(), {
            wrapper: FormWrapper,
        });

        expect(result.current.actionsMerged).toHaveLength(0);
    });

    it('appends actions and exposes them through actionsMerged', () => {
        const { result } = renderHook(() => useProposalActionsField(), {
            wrapper: FormWrapper,
        });

        act(() => {
            result.current.handleAddAction([
                generateAction(),
                generateAction(),
            ]);
        });

        expect(result.current.actionsMerged).toHaveLength(2);
        expect(trackAnalyticsSpy).toHaveBeenCalledWith('action_added_batch', {
            source: 'form',
            count: 2,
            actionCategory: 'unknown_native',
        });
    });

    it('tracks a single native withdrawal action', () => {
        const { result } = renderHook(() => useProposalActionsField(), {
            wrapper: FormWrapper,
        });

        act(() => {
            result.current.handleAddAction([
                generateAction({ type: 'withdraw' }),
            ]);
        });

        expect(trackAnalyticsSpy).toHaveBeenCalledWith('action_added', {
            source: 'form',
            actionCategory: 'native_withdraw',
        });
    });
    it('removes all actions', () => {
        const { result } = renderHook(() => useProposalActionsField(), {
            wrapper: FormWrapper,
        });

        act(() => {
            result.current.handleAddAction([generateAction()]);
        });
        expect(result.current.actionsMerged).toHaveLength(1);

        act(() => {
            result.current.handleRemoveAllActions();
        });
        expect(result.current.actionsMerged).toHaveLength(0);
    });

    it('disables moveUp on the first action and moveDown on the last action', () => {
        const { result } = renderHook(() => useProposalActionsField(), {
            wrapper: FormWrapper,
        });

        act(() => {
            result.current.handleAddAction([
                generateAction(),
                generateAction(),
            ]);
        });

        const first = result.current.getArrayControls(0);
        const last = result.current.getArrayControls(1);

        expect(first.moveUp?.disabled).toBe(true);
        expect(first.moveDown?.disabled).toBe(false);
        expect(last.moveUp?.disabled).toBe(false);
        expect(last.moveDown?.disabled).toBe(true);
        expect(first.remove?.disabled).toBe(false);
    });

    it('disables both move controls when there is a single action', () => {
        const { result } = renderHook(() => useProposalActionsField(), {
            wrapper: FormWrapper,
        });

        act(() => {
            result.current.handleAddAction([generateAction()]);
        });

        const controls = result.current.getArrayControls(0);

        expect(controls.moveUp?.disabled).toBe(true);
        expect(controls.moveDown?.disabled).toBe(true);
    });

    describe('reordering', () => {
        let formApi: UseFormReturn<Record<string, unknown>>;

        const addressAction = (type: string, address: string) =>
            ({
                fieldId: `field-${type}`,
                type,
                daoId: 'test',
                meta: undefined,
                addresses: [{ address }],
            }) as unknown as IProposalActionData;

        const AddressRows: React.FC<{ prefix: string }> = (props) => {
            const { prefix } = props;
            const { register } = useFormContext();
            const { fields } = useFieldArray({ name: `${prefix}.addresses` });

            return fields.map((field, index) => (
                <label key={field.id}>
                    address
                    <input
                        {...register(
                            `${prefix}.addresses.${index.toString()}.address`,
                            {
                                validate: (value: string) =>
                                    value === '' ||
                                    value.startsWith('0x') ||
                                    'INVALID',
                            },
                        )}
                    />
                </label>
            ));
        };

        // Stands in for a rendered action: reads its error by index the way the action
        // components do, while the surrounding list keys the item by its stable fieldId.
        const ActionItem: React.FC<{ index: number; type: string }> = (
            props,
        ) => {
            const { index, type } = props;
            const { getFieldState } = useFormContext();
            const prefix = `actions.${index.toString()}`;
            const { error } = getFieldState(`${prefix}.addresses.0.address`);

            return (
                <fieldset aria-label={type}>
                    {error && <p role="alert">{error.message}</p>}
                    <AddressRows prefix={prefix} />
                </fieldset>
            );
        };

        const ActionList: React.FC = () => {
            const { actionsMerged, getArrayControls } =
                useProposalActionsField();

            return (
                <div>
                    {actionsMerged.map((item, index) => (
                        <ActionItem
                            index={index}
                            key={item.fieldId}
                            type={item.type}
                        />
                    ))}
                    <button
                        onClick={() => getArrayControls(1).moveUp?.onClick?.(1)}
                        type="button"
                    >
                        move second action up
                    </button>
                </div>
            );
        };

        // Mimics leaving the action builder for the metadata step and returning to it.
        const ActionBuilder: React.FC = () => {
            const [showActions, setShowActions] = useState(true);

            return (
                <div>
                    <button
                        onClick={() => setShowActions((show) => !show)}
                        type="button"
                    >
                        toggle step
                    </button>
                    {showActions ? <ActionList /> : <p>metadata step</p>}
                </div>
            );
        };

        const TestWrapper: React.FC<{ children?: ReactNode }> = (props) => {
            const { children } = props;
            const formMethods = useForm({
                mode: 'all',
                defaultValues: {
                    actions: [
                        addressAction('removeAddresses', '0xREMOVE'),
                        addressAction('addAddresses', ''),
                    ],
                },
            });
            formApi = formMethods as unknown as UseFormReturn<
                Record<string, unknown>
            >;

            return <FormProvider {...formMethods}>{children}</FormProvider>;
        };

        const renderActionBuilder = () =>
            render(
                <TestWrapper>
                    <ActionBuilder />
                </TestWrapper>,
            );

        const expectOrder = (...types: string[]) => {
            const items = screen.getAllByRole('group');
            expect(items).toHaveLength(types.length);
            types.forEach((type, index) =>
                expect(items[index]).toHaveAccessibleName(type),
            );
        };

        const actionItem = (type: string) =>
            within(screen.getByRole('group', { name: type }));

        it('keeps a validation error on the action that owns it after a move', async () => {
            const user = userEvent.setup();
            renderActionBuilder();
            expectOrder('removeAddresses', 'addAddresses');

            await user.type(
                actionItem('addAddresses').getByLabelText('address'),
                'ASDF',
            );
            await act(async () => {
                await formApi.trigger();
            });
            expect(
                actionItem('addAddresses').getByRole('alert'),
            ).toHaveTextContent('INVALID');
            expect(
                actionItem('removeAddresses').queryByRole('alert'),
            ).toBeNull();

            await user.click(
                screen.getByRole('button', { name: 'move second action up' }),
            );

            expectOrder('addAddresses', 'removeAddresses');
            expect(
                actionItem('addAddresses').getByRole('alert'),
            ).toHaveTextContent('INVALID');
            expect(
                actionItem('removeAddresses').queryByRole('alert'),
            ).toBeNull();
        });

        it('keeps action values intact when leaving and re-entering the step after a move', async () => {
            const user = userEvent.setup();
            renderActionBuilder();

            await user.click(
                screen.getByRole('button', { name: 'move second action up' }),
            );
            await user.type(
                actionItem('addAddresses').getByLabelText('address'),
                '0xBEEF',
            );

            const toggle = screen.getByRole('button', { name: 'toggle step' });
            await user.click(toggle);
            await user.click(toggle);

            expectOrder('addAddresses', 'removeAddresses');
            expect(formApi.getValues('actions')).toEqual([
                expect.objectContaining({
                    type: 'addAddresses',
                    addresses: [{ address: '0xBEEF' }],
                }),
                expect.objectContaining({
                    type: 'removeAddresses',
                    addresses: [{ address: '0xREMOVE' }],
                }),
            ]);
        });
    });
});
