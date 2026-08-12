import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { FormProvider, type UseFormReturn, useForm } from 'react-hook-form';
import * as createProposalForm from '@/modules/governance/components/createProposalForm';
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import * as useDaoChainHook from '@/shared/hooks/useDaoChain';
import * as useTokenHook from '@/shared/hooks/useToken';
import {
    generateDaoPlugin,
    generateDialogContext,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import {
    crossChainControllerService,
    GasLimitEstimationStatus,
    type IGasLimitEstimation,
} from '../../../api/crossChainControllerService';
import type { ICrossChainControllerPluginSettings } from '../../../types';
import {
    CrossChainControllerForwardMessageAction,
    type ICrossChainControllerForwardMessageActionProps,
} from './crossChainControllerForwardMessageAction';

describe('<CrossChainControllerForwardMessageAction /> component', () => {
    const useDaoChainSpy = jest.spyOn(useDaoChainHook, 'useDaoChain');
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useTokenSpy = jest.spyOn(useTokenHook, 'useToken');
    const useCreateProposalFormContextSpy = jest.spyOn(
        createProposalForm,
        'useCreateProposalFormContext',
    );
    const estimateGasLimitSpy = jest.spyOn(
        crossChainControllerService,
        'estimateGasLimit',
    );

    const controllerAddress = '0x1111111111111111111111111111111111111111';
    const destinationChainId = 8453;
    const otherDestinationChainId = 42_161;

    const nestedAction = {
        to: '0x4444444444444444444444444444444444444444',
        value: '0',
        data: '0xdeadbeef',
    };

    // The component drives every value through the form, so tests need a handle on it to simulate
    // the nested-actions dialog writing a new action list.
    let form: UseFormReturn | undefined;

    const FormHarness: React.FC<{
        children?: ReactNode;
        defaultValues: Record<string, unknown>;
    }> = (props) => {
        const { children, defaultValues } = props;
        const methods = useForm({ defaultValues });
        form = methods;

        return <FormProvider {...methods}>{children}</FormProvider>;
    };

    const generateEstimation = (
        estimation?: Partial<IGasLimitEstimation>,
    ): IGasLimitEstimation => ({
        status: GasLimitEstimationStatus.SUCCESS,
        requiredGas: '228100',
        runAt: 0,
        ...estimation,
    });

    beforeEach(() => {
        useDaoChainSpy.mockReturnValue({
            chainId: 1,
            network: Network.ETHEREUM_MAINNET,
        } as unknown as ReturnType<typeof useDaoChainHook.useDaoChain>);
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        useTokenSpy.mockReturnValue({
            data: null,
            isError: false,
            isLoading: false,
        });
        useCreateProposalFormContextSpy.mockReturnValue(
            {} as ReturnType<
                typeof createProposalForm.useCreateProposalFormContext
            >,
        );
        estimateGasLimitSpy.mockResolvedValue(generateEstimation());
    });

    afterEach(() => {
        form = undefined;
        useDaoChainSpy.mockReset();
        useDialogContextSpy.mockReset();
        useTokenSpy.mockReset();
        useCreateProposalFormContextSpy.mockReset();
        estimateGasLimitSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ICrossChainControllerForwardMessageActionProps>,
        formValues?: Record<string, unknown>,
    ) => {
        const meta = generateDaoPlugin<ICrossChainControllerPluginSettings>({
            address: controllerAddress,
            interfaceType: PluginInterfaceType.CROSS_CHAIN_CONTROLLER,
            settings: {
                pluginAddress: controllerAddress,
                crossChain: {
                    executor: '0x2222222222222222222222222222222222222222',
                    lanes: [
                        {
                            chainId: destinationChainId,
                            localAdapter:
                                '0x3333333333333333333333333333333333333333',
                            remoteAdapter:
                                '0x5555555555555555555555555555555555555555',
                        },
                        {
                            chainId: otherDestinationChainId,
                            localAdapter:
                                '0x6666666666666666666666666666666666666666',
                            remoteAdapter:
                                '0x7777777777777777777777777777777777777777',
                        },
                    ],
                },
            } as ICrossChainControllerPluginSettings,
        });

        const completeProps = {
            index: 0,
            action: { daoId: 'dao-id', meta },
            ...props,
        } as unknown as ICrossChainControllerForwardMessageActionProps;

        const defaultValues = {
            actions: [
                {
                    destinationChainId,
                    nestedActions: [nestedAction],
                    ...formValues,
                },
            ],
        };

        return (
            <ReactQueryWrapper>
                <GukModulesProvider>
                    <FormHarness defaultValues={defaultValues}>
                        <CrossChainControllerForwardMessageAction
                            {...completeProps}
                        />
                    </FormHarness>
                </GukModulesProvider>
            </ReactQueryWrapper>
        );
    };

    const getGasLimitInput = () =>
        screen.getByRole('textbox', {
            name: /crossChainControllerForwardMessageAction.gas.label/,
        });

    const clickCalculate = () =>
        userEvent.click(
            screen.getByRole('button', {
                name: /crossChainControllerForwardMessageAction.gas.calculate/,
            }),
        );

    it('leaves the gas limit empty until it is calculated, instead of defaulting it to the minimum', () => {
        render(createTestComponent());

        expect(getGasLimitInput()).toHaveValue('');
    });

    it('applies the safety margin locally to the gas the backend measured', async () => {
        render(createTestComponent());

        await clickCalculate();

        // The backend reports 228,100 with no margin; the 30% margin is this client's decision.
        await waitFor(() => expect(getGasLimitInput()).toHaveValue('296,530'));
        expect(estimateGasLimitSpy).toHaveBeenCalledWith({
            urlParams: {
                network: Network.ETHEREUM_MAINNET,
                controllerAddress,
            },
            body: { destinationChainId, actions: [nestedAction] },
        });
    });

    it('clamps to the cap and warns when the full margin does not fit under it', async () => {
        estimateGasLimitSpy.mockResolvedValue(
            generateEstimation({ requiredGas: '2500000' }),
        );

        render(createTestComponent());

        await clickCalculate();

        // 2,500,000 x 1.3 = 3,250,000, above the cap, but the requirement itself still fits.
        await waitFor(() =>
            expect(getGasLimitInput()).toHaveValue('3,000,000'),
        );
        expect(
            screen.getByText(
                /crossChainControllerForwardMessageAction.gas.marginReduced/,
            ),
        ).toBeInTheDocument();
    });

    it('keeps the gas limit empty and reports the batch cannot be delivered when the requirement alone exceeds the cap', async () => {
        // The backend never checks the requirement against the cap, so this is the client's own
        // verdict - no choice of margin fixes it.
        estimateGasLimitSpy.mockResolvedValue(
            generateEstimation({ requiredGas: '3500000' }),
        );

        render(createTestComponent());

        await clickCalculate();

        await waitFor(() =>
            expect(
                screen.getByText(
                    /crossChainControllerForwardMessageAction.gas.exceedsMax/,
                ),
            ).toBeInTheDocument(),
        );
        expect(getGasLimitInput()).toHaveValue('');
    });

    it('keeps the gas limit empty and reports the reason when the actions revert', async () => {
        estimateGasLimitSpy.mockResolvedValue(
            generateEstimation({
                status: GasLimitEstimationStatus.REVERTED,
                requiredGas: undefined,
                revertReason: 'ERC20: insufficient balance',
            }),
        );

        render(createTestComponent());

        await clickCalculate();

        await waitFor(() =>
            expect(
                screen.getByText(
                    /crossChainControllerForwardMessageAction.gas.reverted/,
                ),
            ).toBeInTheDocument(),
        );
        expect(getGasLimitInput()).toHaveValue('');
    });

    it('clears a calculated gas limit when the actions change, so a stale value cannot reach the proposal', async () => {
        render(createTestComponent());

        await clickCalculate();
        await waitFor(() => expect(getGasLimitInput()).toHaveValue('296,530'));

        act(() =>
            form?.setValue('actions.[0].nestedActions', [
                nestedAction,
                { ...nestedAction, data: '0xfeedface' },
            ]),
        );

        await waitFor(() => expect(getGasLimitInput()).toHaveValue(''));
    });

    it('clears a calculated gas limit when the destination chain changes', async () => {
        render(createTestComponent());

        await clickCalculate();
        await waitFor(() => expect(getGasLimitInput()).toHaveValue('296,530'));

        act(() => form?.setValue('actions.[0].destinationChainId', 42_161));

        await waitFor(() => expect(getGasLimitInput()).toHaveValue(''));
    });

    it('keeps a restored gas limit on mount', () => {
        render(createTestComponent(undefined, { gasLimit: '500000' }));

        expect(getGasLimitInput()).toHaveValue('500,000');
    });

    it('clears the nested actions when the destination chain changes, as they target the previous chain', async () => {
        render(createTestComponent());

        await userEvent.click(screen.getByRole('radio', { name: 'Arbitrum' }));

        await waitFor(() =>
            expect(form?.getValues('actions.[0].nestedActions')).toEqual([]),
        );
        expect(form?.getValues('actions.[0].destinationChainId')).toBe(
            otherDestinationChainId,
        );
        expect(
            screen.getByText(
                /crossChainControllerForwardMessageAction.actions.emptyHeading/,
            ),
        ).toBeInTheDocument();
    });

    it('keeps the nested actions when the already selected destination chain is selected again', async () => {
        render(createTestComponent());

        await userEvent.click(screen.getByRole('radio', { name: 'Base' }));

        expect(form?.getValues('actions.[0].nestedActions')).toEqual([
            nestedAction,
        ]);
    });
});
