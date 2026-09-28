import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import type { IProposalActionData } from '../../components/createProposalForm/createProposalFormDefinitions';
import { CreateProposalFormProvider } from '../../components/createProposalForm/createProposalFormProvider';
import type { PrepareProposalActionMap } from '../../dialogs/publishProposalDialog';
import { proposalActionPreparationUtils } from '../../utils/proposalActionPreparationUtils';
import { proposalActionsImportExportUtils } from '../../utils/proposalActionsImportExportUtils';
import { useDownloadProposalActions } from './useDownloadProposalActions';

describe('useDownloadProposalActions hook', () => {
    const prepareActionsSpy = jest.spyOn(
        proposalActionPreparationUtils,
        'prepareActions',
    );
    const downloadActionsSpy = jest.spyOn(
        proposalActionsImportExportUtils,
        'downloadActionsAsJSON',
    );
    const logErrorSpy = jest.spyOn(monitoringUtils, 'logError');

    beforeEach(() => {
        prepareActionsSpy.mockImplementation(({ actions }) =>
            Promise.resolve(
                actions.map((action) => ({ ...action, data: '0x' as const })),
            ),
        );
        downloadActionsSpy.mockImplementation(() => undefined);
        logErrorSpy.mockImplementation(() => undefined);
    });

    afterEach(() => {
        prepareActionsSpy.mockReset();
        downloadActionsSpy.mockReset();
        logErrorSpy.mockReset();
    });

    const generateAction = (
        action?: Partial<IProposalActionData>,
    ): IProposalActionData =>
        ({
            type: 'transfer',
            meta: undefined,
            ...action,
        }) as IProposalActionData;

    const createWrapper = (
        actions: IProposalActionData[] = [],
        prepareActions: PrepareProposalActionMap = {},
    ) => {
        const Wrapper: React.FC<{ children?: ReactNode }> = (props) => {
            const { children } = props;

            const formMethods = useForm({ defaultValues: { actions } });
            const contextValues = {
                prepareActions,
                addPrepareAction: jest.fn(),
            };

            return (
                <FormProvider {...formMethods}>
                    <CreateProposalFormProvider value={contextValues}>
                        {children}
                    </CreateProposalFormProvider>
                </FormProvider>
            );
        };

        return Wrapper;
    };

    it('returns an idle state on mount', () => {
        const { result } = renderHook(() => useDownloadProposalActions(), {
            wrapper: createWrapper(),
        });

        expect(result.current.isPinning).toBeFalsy();
        expect(result.current.hasPinErrors).toBeFalsy();
    });

    it('prepares the form actions and downloads them into a DAO-scoped file', async () => {
        const actions = [
            generateAction(),
            generateAction({ type: 'withdraw' }),
        ];
        const prepareActions: PrepareProposalActionMap = {};
        const { result } = renderHook(
            () => useDownloadProposalActions({ daoId: 'ethereum-0x123' }),
            { wrapper: createWrapper(actions, prepareActions) },
        );

        await act(() => result.current.handleDownloadActions());

        expect(prepareActionsSpy).toHaveBeenCalledWith({
            actions: expect.arrayContaining([
                expect.objectContaining({ type: 'transfer' }),
                expect.objectContaining({ type: 'withdraw' }),
            ]),
            prepareActions,
        });
        expect(downloadActionsSpy).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ type: 'transfer' }),
            ]),
            'dao-ethereum-0x123-actions.json',
        );
        expect(result.current.isPinning).toBeFalsy();
        expect(result.current.hasPinErrors).toBeFalsy();
    });

    it('falls back to a generic file name when the actions are composed outside a DAO context', async () => {
        const { result } = renderHook(() => useDownloadProposalActions(), {
            wrapper: createWrapper([generateAction()]),
        });

        await act(() => result.current.handleDownloadActions());

        expect(downloadActionsSpy).toHaveBeenCalledWith(
            expect.anything(),
            'actions.json',
        );
    });

    it('sets the pinning flag while the actions are being prepared', async () => {
        prepareActionsSpy.mockReturnValue(new Promise(() => undefined));
        const { result } = renderHook(() => useDownloadProposalActions(), {
            wrapper: createWrapper([generateAction()]),
        });

        act(() => {
            void result.current.handleDownloadActions();
        });

        await waitFor(() => expect(result.current.isPinning).toBeTruthy());
        expect(downloadActionsSpy).not.toHaveBeenCalled();
    });

    it('flags the error and logs it when the action preparation fails', async () => {
        const error = new Error('prepare-error');
        prepareActionsSpy.mockRejectedValue(error);
        const { result } = renderHook(
            () => useDownloadProposalActions({ daoId: 'ethereum-0x123' }),
            { wrapper: createWrapper([generateAction()]) },
        );

        await act(() => result.current.handleDownloadActions());

        expect(downloadActionsSpy).not.toHaveBeenCalled();
        expect(logErrorSpy).toHaveBeenCalledWith(
            error,
            expect.objectContaining({
                context: expect.objectContaining({ daoId: 'ethereum-0x123' }),
            }),
        );
        expect(result.current.hasPinErrors).toBeTruthy();
        expect(result.current.isPinning).toBeFalsy();
    });
});
