import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFormContext } from 'react-hook-form';
import * as daoService from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import {
    generateDao,
    generateDialogContext,
    generateReactQueryResultSuccessWithData,
} from '@/shared/testUtils';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import type { IProposalActionData } from '../../components/createProposalForm';
import type { IProposalActionsEditorProps } from '../../components/proposalActionsEditor';
import * as proposalActionsEditorModule from '../../components/proposalActionsEditor';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
import { generateProposalAction } from '../../testUtils';
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
    const { getValues } = useFormContext<{ actions: IProposalActionData[] }>();

    return (
        <div
            data-action-dao-ids={JSON.stringify(
                getValues('actions').map((action) => action.daoId),
            )}
            data-dao-id={props.daoId}
            data-exclude-action-types={JSON.stringify(props.excludeActionTypes)}
            data-testid="actions-editor"
        >
            {getValues('actions').map((action) => (
                <span key={action.to}>{action.to}</span>
            ))}
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

    beforeEach(() => {
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
        useDialogContextSpy.mockReset();
        useDaoSpy.mockReset();
        prepareActionsSpy.mockReset();
        decodeActionsSpy.mockReset();
        proposalActionsEditorSpy.mockReset();
        logErrorSpy.mockReset();
    });

    const createTestComponent = (
        params?: Partial<INestedActionsDialogParams>,
    ) => {
        const completeParams: INestedActionsDialogParams = {
            daoId: DAO_ID,
            initialActions: [],
            onSubmit: jest.fn(),
            ...params,
        };

        // The dialog provider keeps the location in state, so its identity is stable across
        // re-renders. Returned to let the tests re-render with the very same params.
        const location = { id: 'NESTED_ACTIONS', params: completeParams };

        return {
            ...render(<NestedActionsDialog location={location} />),
            location,
        };
    };

    it('seeds the isolated form with the initial actions and forwards the editor properties', () => {
        const initialActions = [
            generateActionData({ to: '0xfirst' }),
            generateActionData({ to: '0xsecond' }),
        ];
        const excludeActionTypes = ['EXECUTE'];
        createTestComponent({ initialActions, excludeActionTypes });

        const editor = screen.getByTestId('actions-editor');
        expect(editor.dataset.daoId).toEqual(DAO_ID);
        expect(editor.dataset.excludeActionTypes).toEqual(
            JSON.stringify(excludeActionTypes),
        );
        expect(screen.getByText('0xfirst')).toBeInTheDocument();
        expect(screen.getByText('0xsecond')).toBeInTheDocument();
        expect(decodeActionsSpy).not.toHaveBeenCalled();
    });

    it('decodes the initial actions before seeding the form when none of them carry input data', async () => {
        const rawAction = generateRawActionData({
            to: '0xraw',
            value: '10',
            data: '0xcalldata',
        });
        // The decoder resolves to the backend action shape, which carries no `daoId`.
        decodeActionsSpy.mockResolvedValue([
            generateProposalAction({ to: '0xdecoded' }),
        ]);

        createTestComponent({ initialActions: [rawAction] });

        expect(
            screen.getByText('app.governance.nestedActionsDialog.decoding'),
        ).toBeInTheDocument();
        expect(decodeActionsSpy).toHaveBeenCalledWith(
            [{ to: '0xraw', value: '10', data: '0xcalldata' }],
            DAO,
        );

        await waitFor(() =>
            expect(screen.getByText('0xdecoded')).toBeInTheDocument(),
        );
        expect(
            screen.getByTestId('actions-editor').dataset.actionDaoIds,
        ).toEqual(JSON.stringify([DAO_ID]));
    });

    it('keeps the raw actions and displays an error when the decoding fails', async () => {
        decodeActionsSpy.mockRejectedValue(new Error('decode-error'));

        createTestComponent({
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

    it('prepares the actions, submits them and closes itself on save', async () => {
        const dialogContext = generateDialogContext();
        useDialogContextSpy.mockReturnValue(dialogContext);

        const initialActions = [generateActionData({ to: '0xfirst' })];
        const preparedActions = [
            generateActionData({ to: '0xfirst', data: '0xprepared' }),
        ];
        prepareActionsSpy.mockResolvedValue(preparedActions as PreparedActions);

        const onSubmit = jest.fn();
        createTestComponent({ initialActions, onSubmit });

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.governance.nestedActionsDialog.save',
            }),
        );

        expect(prepareActionsSpy).toHaveBeenCalledWith({
            actions: initialActions,
            prepareActions: {},
        });
        expect(onSubmit).toHaveBeenCalledWith(preparedActions);
        expect(dialogContext.close).toHaveBeenCalledWith(
            GovernanceDialogId.NESTED_ACTIONS,
        );
    });

    it('discards the actions and closes itself on cancel', async () => {
        const dialogContext = generateDialogContext();
        useDialogContextSpy.mockReturnValue(dialogContext);

        const onSubmit = jest.fn();
        createTestComponent({
            initialActions: [generateActionData()],
            onSubmit,
        });

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.governance.nestedActionsDialog.cancel',
            }),
        );

        expect(prepareActionsSpy).not.toHaveBeenCalled();
        expect(onSubmit).not.toHaveBeenCalled();
        expect(dialogContext.close).toHaveBeenCalledWith(
            GovernanceDialogId.NESTED_ACTIONS,
        );
    });

    it('keeps itself open and displays an error when the action preparation fails', async () => {
        const dialogContext = generateDialogContext();
        useDialogContextSpy.mockReturnValue(dialogContext);
        prepareActionsSpy.mockRejectedValue(new Error('pin-error'));

        const onSubmit = jest.fn();
        createTestComponent({
            initialActions: [generateActionData()],
            onSubmit,
        });

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.governance.nestedActionsDialog.save',
            }),
        );

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
