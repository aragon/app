import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import * as ReactHookForm from 'react-hook-form';
import * as DialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext, generateFormContext } from '@/shared/testUtils';
import { CreateProposalFormProvider } from '../../components/createProposalForm';
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
    const prepareActionsSpy = jest.spyOn(
        proposalActionPreparationUtils,
        'prepareActions',
    );
    const createWrapper = (props: PropsWithChildren) => (
        <CreateProposalFormProvider
            value={{ prepareActions: {}, addPrepareAction: jest.fn() }}
        >
            {props.children}
        </CreateProposalFormProvider>
    );

    beforeEach(() => {
        useFormContextSpy.mockReturnValue(
            generateFormContext({
                getValues: jest.fn().mockReturnValue([action]),
            }),
        );
        useWatchSpy.mockReturnValue([action]);
        useDialogContextSpy.mockReturnValue(generateDialogContext());
    });

    afterEach(() => {
        useFormContextSpy.mockReset();
        useWatchSpy.mockReset();
        useDialogContextSpy.mockReset();
        prepareActionsSpy.mockReset();
    });

    const renderTestHook = (
        params?: Partial<IUseSimulateActionsDropdownParams>,
    ) =>
        renderHook(
            () =>
                useSimulateActionsDropdown({
                    daoId: 'ethereum-mainnet-0xdao',
                    from: '0xfrom',
                    formId: 'wizardId',
                    ...params,
                }),
            { wrapper: createWrapper },
        );

    it('returns undefined when there are no actions', () => {
        useWatchSpy.mockReturnValue([]);
        const { result } = renderTestHook();
        expect(result.current).toBeUndefined();
    });

    it('returns undefined when the from address is missing', () => {
        const { result } = renderTestHook({ from: undefined });
        expect(result.current).toBeUndefined();
    });

    it('returns undefined when the network is not supported by Tenderly', () => {
        const { result } = renderTestHook({ daoId: 'citrea-mainnet-0xdao' });
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

    it('opens the simulate dialog with the prepared actions and from address on a valid form', async () => {
        const open = jest.fn();
        const preparedActions = [
            { to: '0xto', data: '0xdata' as const, value: '0' },
        ];
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
        useFormContextSpy.mockReturnValue(
            generateFormContext({
                getValues: jest.fn().mockReturnValue([action]),
                trigger: jest.fn().mockResolvedValue(true),
            }),
        );
        prepareActionsSpy.mockResolvedValue(preparedActions);

        const { result } = renderTestHook({ from: '0xfrom', formId: 'execId' });
        await result.current?.[0].onClick?.();

        await waitFor(() =>
            expect(open).toHaveBeenCalledWith(
                GovernanceDialogId.SIMULATE_ACTIONS,
                {
                    params: {
                        network: 'ethereum-mainnet',
                        from: '0xfrom',
                        actions: preparedActions,
                        formId: 'execId',
                    },
                },
            ),
        );
    });

    it('opens the simulate dialog with the DAO address for direct execution', async () => {
        const open = jest.fn();
        const preparedActions = [
            { to: '0xto', data: '0xdata' as const, value: '0' },
        ];
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
        useFormContextSpy.mockReturnValue(
            generateFormContext({
                getValues: jest.fn().mockReturnValue([action]),
                trigger: jest.fn().mockResolvedValue(true),
            }),
        );
        prepareActionsSpy.mockResolvedValue(preparedActions);

        const { result } = renderTestHook({
            from: '0xwallet',
            isDirectExecute: true,
            formId: 'execId',
        });
        await result.current?.[0].onClick?.();

        await waitFor(() =>
            expect(open).toHaveBeenCalledWith(
                GovernanceDialogId.SIMULATE_ACTIONS,
                {
                    params: {
                        network: 'ethereum-mainnet',
                        from: '0xwallet',
                        daoAddress: '0xdao',
                        actions: preparedActions,
                        formId: 'execId',
                    },
                },
            ),
        );
    });
});
