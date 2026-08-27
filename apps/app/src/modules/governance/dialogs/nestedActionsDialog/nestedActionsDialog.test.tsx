import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import en from '@/assets/locales/en.json';
import * as daoService from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import * as translationsProvider from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    generateDao,
    generateDialogContext,
    generateReactQueryResultSuccessWithData,
} from '@/shared/testUtils';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { translationUtils } from '@/shared/utils/translationsUtils';
import type { IAllowedAction } from '../../api/executeSelectorsService';
import * as executeSelectorsService from '../../api/executeSelectorsService';
import type { IProposalActionData } from '../../components/createProposalForm';
import type { IProposalActionsEditorProps } from '../../components/proposalActionsEditor';
import * as proposalActionsEditorModule from '../../components/proposalActionsEditor';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
import { generateAllowedAction, generateProposalAction } from '../../testUtils';
import { proposalActionPreparationUtils } from '../../utils/proposalActionPreparationUtils';
import { proposalActionsImportExportUtils } from '../../utils/proposalActionsImportExportUtils';
import { NestedActionsDialog } from './nestedActionsDialog';
import type { INestedActionsDialogParams } from './nestedActionsDialog.api';

// Dialog.* primitives need a Radix Dialog.Root context which the dialogProvider supplies in
// production. In unit tests we render the component directly, so mock the Dialog namespace to
// side-step that context error. Mirrors the pattern in delegateStatementDialog.test.tsx.
jest.mock('@aragon/gov-ui-kit', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@aragon/gov-ui-kit');
    const Dialog = {
        Header: (props: {
            title: string;
            description?: string;
            onClose?: () => void;
        }) => (
            <div>
                <h2>{props.title}</h2>
                <p>{props.description}</p>
                <button onClick={props.onClose} type="button">
                    close
                </button>
            </div>
        ),
        Content: (props: { children: React.ReactNode }) => (
            <div>{props.children}</div>
        ),
        Footer: (props: {
            primaryAction: {
                label: string;
                disabled?: boolean;
                isLoading?: boolean;
                onClick?: () => void;
            };
            secondaryAction?: { label: string; onClick?: () => void };
        }) => (
            <div>
                {props.secondaryAction != null && (
                    <button
                        onClick={props.secondaryAction.onClick}
                        type="button"
                    >
                        {props.secondaryAction.label}
                    </button>
                )}
                <button
                    data-loading={props.primaryAction.isLoading}
                    disabled={props.primaryAction.disabled}
                    onClick={props.primaryAction.onClick}
                    type="button"
                >
                    {props.primaryAction.label}
                </button>
            </div>
        ),
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return { ...actual, Dialog };
});

const DAO_ID = 'ethereum-0xdao';
const DAO = generateDao({ address: '0xdao' });

// The utility narrows `data` to `Hex` on its return type, the generated actions type it as `string`.
type PreparedActions = Awaited<
    ReturnType<typeof proposalActionPreparationUtils.prepareActions>
>;
type DecodedActions = Awaited<
    ReturnType<typeof proposalActionsImportExportUtils.decodeActions>
>;

// Raw action: no `inputData`, therefore in need of decoding before it can seed the form.
const generateRawActionData = (
    action?: Partial<IProposalActionData>,
): IProposalActionData => ({
    ...generateProposalAction(),
    daoId: DAO_ID,
    meta: undefined,
    ...action,
});

const generateActionData = (
    action?: Partial<IProposalActionData>,
): IProposalActionData =>
    generateRawActionData({
        inputData: { function: 'transfer', contract: 'Token', parameters: [] },
        ...action,
    });

// Stub editor reading the isolated form context, so the tests can assert both the props forwarded
// to the editor and the actions the dialog seeded its form with.
const ProposalActionsEditorStub: React.FC<IProposalActionsEditorProps> = (
    props,
) => {
    const { register, setValue } = useFormContext<{
        actions: IProposalActionData[];
    }>();
    const actions =
        (useWatch({ name: 'actions' }) as IProposalActionData[] | undefined) ??
        [];
    const initialActionsRef = useRef(actions);

    // The actual editor registers and validates every action. This focused stub supplies the same
    // form-level signal, including an intentionally invalid action, while exposing draft edits.
    register('actions', {
        validate: (actions) =>
            actions.every((action) => action.inputData != null),
    });

    const setDraftActions = (draftActions: IProposalActionData[]) =>
        setValue('actions', draftActions, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    const draftActions = {
        empty: [],
        initial: initialActionsRef.current,
        invalid: [generateRawActionData({ to: '0xinvalid' })],
        valid: [generateActionData({ to: '0xchanged' })],
    } satisfies Record<string, IProposalActionData[]>;

    return (
        <div
            data-action-dao-ids={JSON.stringify(
                actions.map((action) => action.daoId),
            )}
            data-allowed-action-targets={JSON.stringify(
                props.allowedActions?.map((action) => action.target),
            )}
            data-dao-id={props.daoId}
            data-exclude-action-types={JSON.stringify(props.excludeActionTypes)}
            data-initial-only-show-authorized-actions={JSON.stringify(
                props.initialOnlyShowAuthorizedActions,
            )}
            data-testid="actions-editor"
        >
            {actions.map((action) => (
                <span key={action.to}>{action.to}</span>
            ))}
            <select
                aria-label="draft action state"
                onChange={(event) =>
                    setDraftActions(
                        draftActions[
                            event.target.value as keyof typeof draftActions
                        ],
                    )
                }
            >
                <option value="initial">initial</option>
                <option value="valid">valid</option>
                <option value="invalid">invalid</option>
                <option value="empty">empty</option>
            </select>
        </div>
    );
};

describe('<NestedActionsDialog /> component', () => {
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const prepareActionsSpy = jest.spyOn(
        proposalActionPreparationUtils,
        'prepareActions',
    );
    const proposalActionsEditorSpy = jest.spyOn(
        proposalActionsEditorModule,
        'ProposalActionsEditor',
    );
    const decodeActionsSpy = jest.spyOn(
        proposalActionsImportExportUtils,
        'decodeActions',
    );
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const logErrorSpy = jest.spyOn(monitoringUtils, 'logError');
    const useAllAllowedActionsSpy = jest.spyOn(
        executeSelectorsService,
        'useAllAllowedActions',
    );
    let useTranslationsSpy: jest.SpyInstance | undefined;

    // The hook keeps its data undefined until the full allowlist is known, which is also what a
    // disabled query resolves to.
    const mockAllowedActions = (data?: IAllowedAction[]) =>
        useAllAllowedActionsSpy.mockReturnValue(
            generateReactQueryResultSuccessWithData(
                data,
            ) as unknown as ReturnType<
                typeof executeSelectorsService.useAllAllowedActions
            >,
        );

    beforeEach(() => {
        mockAllowedActions();
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccessWithData(
                DAO,
            ) as unknown as ReturnType<typeof daoService.useDao>,
        );
        prepareActionsSpy.mockImplementation(({ actions }) =>
            Promise.resolve(actions as PreparedActions),
        );
        decodeActionsSpy.mockResolvedValue([]);
        proposalActionsEditorSpy.mockImplementation(ProposalActionsEditorStub);
        logErrorSpy.mockImplementation(jest.fn());
    });

    afterEach(() => {
        useTranslationsSpy?.mockRestore();
        useTranslationsSpy = undefined;
        useDialogContextSpy.mockReset();
        useDaoSpy.mockReset();
        prepareActionsSpy.mockReset();
        decodeActionsSpy.mockReset();
        proposalActionsEditorSpy.mockReset();
        logErrorSpy.mockReset();
        useAllAllowedActionsSpy.mockReset();
    });

    const createTestComponent = async (
        params?: Partial<INestedActionsDialogParams>,
    ) => {
        const completeParams: INestedActionsDialogParams = {
            hostDaoId: DAO_ID,
            initialActions: [],
            onSubmit: jest.fn(),
            ...params,
        };

        // The dialog provider keeps the location in state, so its identity is stable across
        // re-renders. Returned to let the tests re-render with the very same params.
        const location = { id: 'NESTED_ACTIONS', params: completeParams };

        let renderedComponent: ReturnType<typeof render> | undefined;
        await act(() => {
            renderedComponent = render(
                <NestedActionsDialog location={location} />,
            );
            return Promise.resolve();
        });

        return {
            ...renderedComponent!,
            location,
        };
    };

    const getSaveButton = () =>
        screen.getByRole<HTMLButtonElement>('button', {
            name: 'app.governance.nestedActionsDialog.save',
        });
    const setDraftState = (state: 'empty' | 'initial' | 'invalid' | 'valid') =>
        userEvent.selectOptions(
            screen.getByRole('combobox', { name: 'draft action state' }),
            state,
        );

    it('uses forwarded-actions copy and only header close discards the draft', async () => {
        const dialogContext = generateDialogContext();
        const onSubmit = jest.fn();
        useDialogContextSpy.mockReturnValue(dialogContext);
        useTranslationsSpy = jest
            .spyOn(translationsProvider, 'useTranslations')
            .mockReturnValue({
                t: translationUtils.t(en),
            });

        await createTestComponent({ onSubmit });

        expect(
            screen.getByRole('heading', { name: 'Forwarded actions' }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'These forwarded actions are executed as a batch on the destination chain.',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Save forwarded actions' }),
        ).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
        await setDraftState('valid');
        await userEvent.click(screen.getByRole('button', { name: 'close' }));
        expect(onSubmit).not.toHaveBeenCalled();
        expect(dialogContext.close).toHaveBeenCalledWith(
            GovernanceDialogId.NESTED_ACTIONS,
        );
    });

    it('seeds the isolated form with the initial actions and forwards the editor properties', async () => {
        const initialActions = [
            generateActionData({ to: '0xfirst' }),
            generateActionData({ to: '0xsecond' }),
        ];
        const excludeActionTypes = ['EXECUTE'];
        await createTestComponent({ initialActions, excludeActionTypes });

        const editor = screen.getByTestId('actions-editor');
        expect(editor.dataset.daoId).toEqual(DAO_ID);
        expect(editor.dataset.excludeActionTypes).toEqual(
            JSON.stringify(excludeActionTypes),
        );
        expect(screen.getByText('0xfirst')).toBeInTheDocument();
        expect(screen.getByText('0xsecond')).toBeInTheDocument();
        expect(decodeActionsSpy).not.toHaveBeenCalled();
    });

    it('fetches the allowed actions on the plugin network for the chain the actions are composed for', async () => {
        await createTestComponent({
            processPluginAddress: '0xplugin',
            crossChainNetwork: daoService.Network.BASE_MAINNET,
        });

        expect(useAllAllowedActionsSpy).toHaveBeenLastCalledWith(
            {
                urlParams: { network: DAO.network, pluginAddress: '0xplugin' },
                chainId: networkDefinitions[daoService.Network.BASE_MAINNET].id,
            },
            { enabled: true },
        );
    });

    it('forwards the allowed actions of the plugin to the editor', async () => {
        mockAllowedActions([generateAllowedAction({ target: '0xallowed' })]);

        await createTestComponent({ processPluginAddress: '0xplugin' });

        expect(
            screen.getByTestId('actions-editor').dataset.allowedActionTargets,
        ).toEqual(JSON.stringify(['0xallowed']));
    });

    // The composer reads the allowlist on mount and offers every action when it is undefined, so
    // rendering it early would leave the restricted actions unrestricted.
    it('hides the editor until the allowed actions of the plugin are resolved', async () => {
        mockAllowedActions(undefined);

        await createTestComponent({ processPluginAddress: '0xplugin' });

        expect(screen.queryByTestId('actions-editor')).not.toBeInTheDocument();
        expect(
            screen.getByText(
                'app.governance.nestedActionsDialog.loadingAllowedActions',
            ),
        ).toBeInTheDocument();
    });

    it('offers every action when no plugin restricts them', async () => {
        await createTestComponent();

        expect(
            screen.getByTestId('actions-editor').dataset.allowedActionTargets,
        ).toBeUndefined();
    });

    // Forcing the switch on where nothing is authorized would hide the import and WalletConnect
    // buttons too, so the heuristic must not reach past the case it exists for.
    it('leaves the authorized-actions switch at the composer default when no plugin restricts the actions', async () => {
        await createTestComponent({ initialActions: [generateActionData()] });

        expect(
            screen.getByTestId('actions-editor').dataset
                .initialOnlyShowAuthorizedActions,
        ).toBeUndefined();
    });

    it('leaves the authorized-actions switch at the composer default when the plugin authorizes actions', async () => {
        mockAllowedActions([generateAllowedAction({ target: '0xallowed' })]);

        await createTestComponent({
            processPluginAddress: '0xplugin',
            initialActions: [generateActionData()],
        });

        expect(
            screen.getByTestId('actions-editor').dataset
                .initialOnlyShowAuthorizedActions,
        ).toBeUndefined();
    });

    // The composer remounts with the dialog, so an on switch would hide the actions being edited.
    it('starts the authorized-actions switch off when nothing is authorized but there are actions to show', async () => {
        mockAllowedActions([]);

        await createTestComponent({
            processPluginAddress: '0xplugin',
            initialActions: [generateActionData()],
        });

        expect(
            screen.getByTestId('actions-editor').dataset
                .initialOnlyShowAuthorizedActions,
        ).toEqual('false');
    });

    it('leaves the switch at the composer default when nothing is authorized and there is nothing to show', async () => {
        mockAllowedActions([]);

        await createTestComponent({ processPluginAddress: '0xplugin' });

        expect(
            screen.getByTestId('actions-editor').dataset
                .initialOnlyShowAuthorizedActions,
        ).toBeUndefined();
    });

    it('decodes the initial actions before seeding the form when none of them carry input data', async () => {
        const rawAction = generateRawActionData({
            to: '0xraw',
            value: '10',
            data: '0xcalldata',
        });
        // The decoder resolves to the backend action shape, which carries no `daoId`.
        let resolveDecode: (actions: DecodedActions) => void;
        decodeActionsSpy.mockImplementation(
            () =>
                new Promise<DecodedActions>((resolve) => {
                    resolveDecode = resolve;
                }),
        );

        await createTestComponent({ initialActions: [rawAction] });

        expect(
            screen.getByText('app.governance.nestedActionsDialog.decoding'),
        ).toBeInTheDocument();
        expect(getSaveButton()).toBeDisabled();
        expect(decodeActionsSpy).toHaveBeenCalledWith(
            [{ to: '0xraw', value: '10', data: '0xcalldata' }],
            DAO.network,
            DAO,
        );
        await act(() => {
            resolveDecode!([generateProposalAction({ to: '0xdecoded' })]);
            return Promise.resolve();
        });

        await waitFor(() =>
            expect(screen.getByText('0xdecoded')).toBeInTheDocument(),
        );
        expect(
            screen.getByTestId('actions-editor').dataset.actionDaoIds,
        ).toEqual(JSON.stringify([DAO_ID]));
        expect(getSaveButton()).toBeDisabled();
        await setDraftState('valid');
        await waitFor(() => expect(getSaveButton()).not.toBeDisabled());
        await setDraftState('initial');
        expect(getSaveButton()).toBeDisabled();
    });

    it('keeps the raw actions and displays an error when the decoding fails', async () => {
        decodeActionsSpy.mockRejectedValue(new Error('decode-error'));

        await createTestComponent({
            initialActions: [generateRawActionData({ to: '0xraw' })],
        });

        await waitFor(() =>
            expect(
                screen.getByText(
                    'app.governance.nestedActionsDialog.decodeError',
                ),
            ).toBeInTheDocument(),
        );
        expect(screen.getByText('0xraw')).toBeInTheDocument();
    });

    it.each([
        ['unchanged', [], true, [generateActionData({ to: '0xinitial' })]],
        ['initially empty', [], true, []],
        ['empty baseline changed to valid', ['valid'], false, []],
        ['changed valid', ['valid'], false, [generateActionData()]],
        ['changed invalid', ['invalid'], true, [generateActionData()]],
        ['restored', ['valid', 'initial'], true, [generateActionData()]],
    ] as const)(
        'sets Save enabled state correctly when the draft is %s',
        async (_state, edits, isDisabled, initialActions) => {
            await createTestComponent({
                initialActions: [...initialActions],
            });

            for (const edit of edits) {
                await setDraftState(edit);
            }

            expect(getSaveButton().disabled).toBe(isDisabled);
        },
    );

    it('saves a changed empty draft without adding a dialog-level required rule', async () => {
        const dialogContext = generateDialogContext();
        useDialogContextSpy.mockReturnValue(dialogContext);
        const onSubmit = jest.fn();

        await createTestComponent({
            initialActions: [generateActionData({ to: '0xinitial' })],
            onSubmit,
        });
        await setDraftState('empty');
        await waitFor(() => expect(getSaveButton()).not.toBeDisabled());
        await userEvent.click(getSaveButton());

        expect(onSubmit).toHaveBeenCalledWith([]);
        expect(dialogContext.close).toHaveBeenCalledWith(
            GovernanceDialogId.NESTED_ACTIONS,
        );
    });

    it('prepares, submits and closes a changed non-empty draft', async () => {
        const dialogContext = generateDialogContext();
        const preparedActions = [generateActionData({ to: '0xprepared' })];
        const onSubmit = jest.fn();
        useDialogContextSpy.mockReturnValue(dialogContext);
        prepareActionsSpy.mockResolvedValue(preparedActions as PreparedActions);

        await createTestComponent({
            initialActions: [generateActionData({ to: '0xinitial' })],
            onSubmit,
        });
        await setDraftState('valid');
        await userEvent.click(getSaveButton());

        expect(prepareActionsSpy).toHaveBeenCalledWith({
            actions: [generateActionData({ to: '0xchanged' })],
            prepareActions: {},
        });
        expect(onSubmit).toHaveBeenCalledWith(preparedActions);
        expect(dialogContext.close).toHaveBeenCalledWith(
            GovernanceDialogId.NESTED_ACTIONS,
        );
    });

    it('keeps itself open and displays an error when the action preparation fails', async () => {
        const dialogContext = generateDialogContext();
        useDialogContextSpy.mockReturnValue(dialogContext);
        let rejectPreparation: (error: Error) => void;
        prepareActionsSpy.mockImplementation(
            () =>
                new Promise<PreparedActions>((_resolve, reject) => {
                    rejectPreparation = reject;
                }),
        );

        const onSubmit = jest.fn();
        await createTestComponent({
            initialActions: [generateActionData()],
            onSubmit,
        });

        await setDraftState('valid');
        await waitFor(() => expect(getSaveButton()).not.toBeDisabled());
        await userEvent.click(getSaveButton());
        await waitFor(() => expect(prepareActionsSpy).toHaveBeenCalled());
        expect(getSaveButton()).toBeDisabled();
        rejectPreparation!(new Error('pin-error'));

        await waitFor(() =>
            expect(
                screen.getByText(
                    'app.governance.nestedActionsDialog.prepareError',
                ),
            ).toBeInTheDocument(),
        );
        expect(onSubmit).not.toHaveBeenCalled();
        expect(dialogContext.close).not.toHaveBeenCalled();
    });
});
