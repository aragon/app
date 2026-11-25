import { renderHook, waitFor } from '@testing-library/react';
import * as ReactHookForm from 'react-hook-form';
import { Network } from '@/shared/api/daoService';
import * as DialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext, generateFormContext } from '@/shared/testUtils';
import * as CreateProposalProvider from '../../components/createProposalForm/createProposalFormProvider';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
import { proposalActionPreparationUtils } from '../../utils/proposalActionPreparationUtils';
import {
    type IUseSimulateActionsDropdownParams,
    useSimulateActionsDropdown,
} from './useSimulateActionsDropdown';

describe('useSimulateActionsDropdown hook', () => {
    const action = { to: '0xto', data: '0xdata', value: '0' };

    const useFormContextSpy = jest.spyOn(ReactHookForm, 'useFormContext');
    const useWatchSpy = jest.spyOn(ReactHookForm, 'useWatch');
    const useDialogContextSpy = jest.spyOn(DialogProvider, 'useDialogContext');
    const useCreateProposalFormContextSpy = jest.spyOn(
        CreateProposalProvider,
        'useCreateProposalFormContext',
    );
    const prepareActionsSpy = jest.spyOn(
        proposalActionPreparationUtils,
        'prepareActions',
    );

    beforeEach(() => {
        useFormContextSpy.mockReturnValue(
            generateFormContext({
                getValues: jest.fn().mockReturnValue([action]),
            }),
        );
        useWatchSpy.mockReturnValue([action]);
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        useCreateProposalFormContextSpy.mockReturnValue({
            prepareActions: {},
            addPrepareAction: jest.fn(),
        });
    });

    afterEach(() => {
        useFormContextSpy.mockReset();
        useWatchSpy.mockReset();
        useDialogContextSpy.mockReset();
        useCreateProposalFormContextSpy.mockReset();
        prepareActionsSpy.mockReset();
    });

    const renderTestHook = (
        params?: Partial<IUseSimulateActionsDropdownParams>,
    ) =>
        renderHook(() =>
            useSimulateActionsDropdown({
                network: Network.ETHEREUM_MAINNET,
                target: { type: 'plugin', pluginAddress: '0xplugin' },
                formId: 'wizardId',
                ...params,
            }),
        );

    it('returns undefined when there are no actions', () => {
        useWatchSpy.mockReturnValue([]);
        const { result } = renderTestHook();
        expect(result.current).toBeUndefined();
    });

    it('returns undefined when there is no target', () => {
        const { result } = renderTestHook({ target: undefined });
        expect(result.current).toBeUndefined();
    });

    it('returns undefined when the network is not supported by Tenderly', () => {
        const { result } = renderTestHook({ network: Network.CITREA_MAINNET });
        expect(result.current).toBeUndefined();
    });

    it('returns the simulate and skip-simulation items when watched actions exist on a supported network', () => {
        useFormContextSpy.mockReturnValue(
            generateFormContext({
                getValues: jest.fn().mockReturnValue([]),
            }),
        );
        const { result } = renderTestHook({ formId: 'wizardId' });
        expect(result.current).toHaveLength(2);
        expect(result.current?.[0].onClick).toBeDefined();
        expect(result.current?.[1].formId).toEqual('wizardId');
    });

    it('does not open the dialog when the form is invalid', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
        useFormContextSpy.mockReturnValue(
            generateFormContext({
                getValues: jest.fn().mockReturnValue([action]),
                trigger: jest.fn().mockResolvedValue(false),
            }),
        );
        const { result } = renderTestHook();
        await result.current?.[0].onClick?.();
        expect(open).not.toHaveBeenCalled();
    });

    it.each([
        { type: 'plugin' as const, pluginAddress: '0xplugin' },
        { type: 'dao' as const, daoAddress: '0xdao', from: '0xwallet' },
        { type: 'safe' as const, safeAddress: '0xsafe' },
    ])(
        'opens the simulate dialog with the prepared actions for the $type target on a valid form',
        async (target) => {
            const open = jest.fn();
            const preparedActions = [
                { to: '0xto', data: '0xdata' as const, value: '0' },
            ];
            useDialogContextSpy.mockReturnValue(
                generateDialogContext({ open }),
            );
            useFormContextSpy.mockReturnValue(
                generateFormContext({
                    getValues: jest.fn().mockReturnValue([action]),
                    trigger: jest.fn().mockResolvedValue(true),
                }),
            );
            prepareActionsSpy.mockResolvedValue(preparedActions);

            const { result } = renderTestHook({ target, formId: 'execId' });
            await result.current?.[0].onClick?.();

            await waitFor(() =>
                expect(open).toHaveBeenCalledWith(
                    GovernanceDialogId.SIMULATE_ACTIONS,
                    {
                        params: {
                            network: Network.ETHEREUM_MAINNET,
                            target,
                            actions: preparedActions,
                            formId: 'execId',
                        },
                    },
                ),
            );
        },
    );
});
