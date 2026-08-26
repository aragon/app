import {
    addressUtils,
    ChainEntityType,
    GukModulesProvider,
    IconType,
} from '@aragon/gov-ui-kit';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { FormProvider, type UseFormReturn, useForm } from 'react-hook-form';
import en from '@/assets/locales/en.json';
import { generateToken } from '@/modules/finance/testUtils';
import * as createProposalForm from '@/modules/governance/components/createProposalForm';
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import * as translationsProvider from '@/shared/components/translationsProvider';
import * as useDaoChainHook from '@/shared/hooks/useDaoChain';
import {
    generateDaoPlugin,
    generateDialogContext,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import { translationUtils } from '@/shared/utils/translationsUtils';
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
    const useCreateProposalFormContextSpy = jest.spyOn(
        createProposalForm,
        'useCreateProposalFormContext',
    );
    const estimateGasLimitSpy = jest.spyOn(
        crossChainControllerService,
        'estimateGasLimit',
    );

    const controllerAddress = '0x1111111111111111111111111111111111111111';
    const feeTokenAddress = '0x8888888888888888888888888888888888888888';
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
    let englishTranslationsSpy: jest.SpyInstance | undefined;

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
        useCreateProposalFormContextSpy.mockReturnValue(
            {} as ReturnType<
                typeof createProposalForm.useCreateProposalFormContext
            >,
        );
        estimateGasLimitSpy.mockResolvedValue(generateEstimation());
    });

    afterEach(() => {
        englishTranslationsSpy?.mockRestore();
        englishTranslationsSpy = undefined;
        form = undefined;
        useDaoChainSpy.mockReset();
        useDialogContextSpy.mockReset();
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
                            feeToken: feeTokenAddress,
                            token: generateToken({
                                address: feeTokenAddress,
                                symbol: 'LINK',
                            }),
                        },
                        // The backend leaves the token off the lane when the fee token is unknown.
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

    const useEnglishTranslations = () => {
        englishTranslationsSpy = jest
            .spyOn(translationsProvider, 'useTranslations')
            .mockReturnValue({
                t: translationUtils.t(en),
            });
    };

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

    it('accepts and encodes a restored gas limit above 999,999', async () => {
        render(createTestComponent(undefined, { gasLimit: '1000000' }));

        await act(async () => {
            await form?.trigger();
        });

        expect(getGasLimitInput()).toHaveValue('1,000,000');
        expect(
            screen.queryByText(/app.shared.formField.error.max/),
        ).not.toBeInTheDocument();
        expect(
            form?.getValues('actions.[0].inputData.parameters[1].value'),
        ).toBe('1000000');
    });

    it('accepts the exact cap and keeps over-cap keystrokes safe', async () => {
        render(createTestComponent());

        const gasLimitInput = getGasLimitInput();
        await userEvent.type(gasLimitInput, '3000000');

        await act(async () => {
            expect(await form?.trigger()).toBe(true);
        });

        expect(gasLimitInput).toHaveValue('3,000,000');
        expect(
            form?.getValues('actions.[0].inputData.parameters[1].value'),
        ).toBe('3000000');

        await userEvent.clear(gasLimitInput);
        await userEvent.type(gasLimitInput, '3000001');

        await act(async () => {
            expect(await form?.trigger()).toBe(true);
        });

        const encodedKeystrokeValue = form?.getValues(
            'actions.[0].inputData.parameters[1].value',
        );
        expect(BigInt(encodedKeystrokeValue)).toBeLessThanOrEqual(
            BigInt(3_000_000),
        );
    });

    it('keeps pasted over-cap values safe', async () => {
        render(createTestComponent());

        const gasLimitInput = getGasLimitInput();
        await userEvent.click(gasLimitInput);
        await userEvent.paste('3000001');

        await act(async () => {
            expect(await form?.trigger()).toBe(true);
        });

        expect(
            BigInt(
                form?.getValues('actions.[0].inputData.parameters[1].value'),
            ),
        ).toBeLessThanOrEqual(BigInt(3_000_000));
    });

    it('blocks an over-cap restored or programmatic form value through max validation', async () => {
        render(createTestComponent());

        await act(async () => {
            form?.setValue('actions.[0].gasLimit', '3000001', {
                shouldValidate: true,
            });
            expect(await form?.trigger()).toBe(false);
        });

        expect(form?.getFieldState('actions.[0].gasLimit').error).toMatchObject(
            { type: 'max' },
        );
    });

    it('rejects a fractional gas limit instead of failing to encode it', async () => {
        // The masked input accepts the radix character, so a manually typed fraction gets this far.
        render(createTestComponent(undefined, { gasLimit: '250000.5' }));

        await act(async () => {
            await form?.trigger();
        });

        expect(
            screen.getByText(
                /crossChainControllerForwardMessageAction.gas.notWholeNumber/,
            ),
        ).toBeInTheDocument();
        // The action stays encodable, with a zero limit the required rule keeps out of a proposal.
        expect(
            form?.getValues('actions.[0].inputData.parameters[1].value'),
        ).toBe('0');
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

    it('presents and validates forwarded actions with the required empty and populated affordances', async () => {
        useEnglishTranslations();
        render(createTestComponent());

        expect(screen.getByText('Forwarded actions')).toBeInTheDocument();
        expect(
            screen.getByText('1 forwarded action added'),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'Edit forwarded actions',
            }),
        ).toContainElement(screen.getByTestId(IconType.PEN));

        act(() =>
            form?.setValue('actions.[0].nestedActions', [
                nestedAction,
                { ...nestedAction, data: '0xfeedface' },
            ]),
        );
        expect(
            screen.getByText('2 forwarded actions added'),
        ).toBeInTheDocument();

        act(() => form?.setValue('actions.[0].nestedActions', []));
        expect(
            screen.getByText('No forwarded actions added'),
        ).toBeInTheDocument();
        expect(screen.getByTestId('SMART_CONTRACT')).toBeInTheDocument();
        expect(
            screen.queryByText(
                'Compose the actions the destination chain executes when the message is delivered.',
            ),
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'Forwarded actions',
            }),
        ).toContainElement(screen.getByTestId(IconType.PLUS));

        await act(async () => {
            await form?.trigger();
        });
        expect(
            screen.getByText('Forwarded actions are mandatory.'),
        ).toBeInTheDocument();
    });

    it('links the controller fee notice to the origin explorer and names the configured fee asset', () => {
        const controllerExplorerUrl = `https://origin.example/address/${controllerAddress}`;
        const buildEntityUrl = jest.fn(() => controllerExplorerUrl);

        useEnglishTranslations();
        useDaoChainSpy.mockReturnValue({
            buildEntityUrl,
            chainId: 1,
            network: Network.ETHEREUM_MAINNET,
        } as unknown as ReturnType<typeof useDaoChainHook.useDaoChain>);
        render(createTestComponent());

        const controllerLink = screen.getByRole('link', {
            name: addressUtils.truncateAddress(controllerAddress),
        });
        expect(useDaoChainSpy).toHaveBeenCalledWith({ daoId: 'dao-id' });
        expect(buildEntityUrl).toHaveBeenCalledWith({
            type: ChainEntityType.ADDRESS,
            id: controllerAddress,
        });
        expect(screen.getByRole('alert')).toHaveTextContent(
            `The controller contract ${addressUtils.truncateAddress(controllerAddress)} pays the fee to send the message. For this proposal execution to succeed, it will need to have enough LINK.`,
        );
        expect(controllerLink).toHaveAttribute('href', controllerExplorerUrl);
        expect(controllerLink).toHaveAttribute('target', '_blank');
        expect(controllerLink).toContainElement(
            screen.getByTestId(IconType.LINK_EXTERNAL),
        );
    });

    it('presents an accessible manual gas input and a separate estimate action', async () => {
        useEnglishTranslations();

        render(createTestComponent());

        const gasLimitInput = screen.getByRole('textbox', {
            name: /^Destination gas limit/,
        });
        const estimateGas = screen.getByRole('button', {
            name: 'Estimate gas',
        });

        expect(
            screen.getByText(
                'Set the amount of gas the destination chain will be able to spend to execute the forwarded actions on this proposal. You can estimate it by simulating the actions or enter it manually.',
            ),
        ).toBeInTheDocument();
        expect(gasLimitInput).toHaveAttribute(
            'placeholder',
            'Enter a gas limit',
        );
        expect(estimateGas).toContainElement(
            screen.getByTestId(IconType.RELOAD),
        );

        await userEvent.click(estimateGas);

        expect(estimateGasLimitSpy).toHaveBeenCalled();
    });

    it('names the fee token of the selected lane, as indexed by the backend', () => {
        render(createTestComponent());

        expect(
            screen.getByText(
                /crossChainControllerForwardMessageAction.fee.description.*token=LINK/,
            ),
        ).toBeInTheDocument();
    });

    it('falls back to a generic fee token label when the lane has no indexed token', async () => {
        render(createTestComponent());

        await userEvent.click(screen.getByRole('radio', { name: 'Arbitrum' }));

        await waitFor(() =>
            expect(
                screen.getByText(
                    /crossChainControllerForwardMessageAction.fee.description.*token=app.plugins.crossChainController.crossChainControllerForwardMessageAction.fee.defaultToken/,
                ),
            ).toBeInTheDocument(),
        );
    });
});
