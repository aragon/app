import { renderHook, waitFor } from '@testing-library/react';
import * as ReactHookForm from 'react-hook-form';
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
    const useFormContextSpy = jest.spyOn(ReactHookForm, 'useFormContext');
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
        useFormContextSpy.mockReturnValue(generateFormContext());
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        useCreateProposalFormContextSpy.mockReturnValue({
            prepareActions: {},
            addPrepareAction: jest.fn(),
        });
    });

    afterEach(() => {
        useFormContextSpy.mockReset();
        useDialogContextSpy.mockReset();
        useCreateProposalFormContextSpy.mockReset();
        prepareActionsSpy.mockReset();
    });

    const action = { to: '0xto', data: '0xdata', value: '0' };

    const renderTestHook = (
        params?: Partial<IUseSimulateActionsDropdownParams>,
    ) =>
        renderHook(() =>
            useSimulateActionsDropdown({
                daoId: 'ethereum-mainnet-0xdao',
                from: '0xfrom',
                formId: 'wizardId',
                ...params,
            }),
        );

    it('returns undefined when there are no actions', () => {
        useFormContextSpy.mockReturnValue(
            generateFormContext({ getValues: jest.fn().mockReturnValue([]) }),
        );
        const { result } = renderTestHook();
        expect(result.current).toBeUndefined();
    });

    it('returns undefined when the network is not supported by Tenderly', () => {
        useFormContextSpy.mockReturnValue(
            generateFormContext({
                getValues: jest.fn().mockReturnValue([action]),
            }),
        );
        const { result } = renderTestHook({ daoId: 'citrea-mainnet-0xdao' });
        expect(result.current).toBeUndefined();
    });

    it('returns the simulate and skip-simulation items when actions exist on a supported network', () => {
        useFormContextSpy.mockReturnValue(
            generateFormContext({
                getValues: jest.fn().mockReturnValue([action]),
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

        const { result } = renderTestHook({ from: '0xdao', formId: 'execId' });
        await result.current?.[0].onClick?.();

        await waitFor(() =>
            expect(open).toHaveBeenCalledWith(
                GovernanceDialogId.SIMULATE_ACTIONS,
                {
                    params: {
                        network: 'ethereum-mainnet',
                        from: '0xdao',
                        actions: preparedActions,
                        formId: 'execId',
                    },
                },
            ),
        );
    });
});
