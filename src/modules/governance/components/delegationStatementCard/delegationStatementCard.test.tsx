import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as wagmi from 'wagmi';
import * as ensModule from '@/modules/ens';
import { generateToken } from '@/modules/finance/testUtils';
import { generateTokenPluginSettings } from '@/plugins/tokenPlugin/testUtils';
import * as daoService from '@/shared/api/daoService';
import { Network } from '@/shared/api/daoService';
import * as delegateStatementService from '@/shared/api/delegateStatementService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import {
    generateDao,
    generateDaoPlugin,
    generateDialogContext,
    generateReactQueryResultSuccess,
    generateReactQueryResultSuccessWithData,
} from '@/shared/testUtils';
import {
    DelegationStatementCard,
    type IDelegationStatementCardProps,
} from './delegationStatementCard';

const TOKEN_ADDRESS = '0x1111111111111111111111111111111111111111';
const MEMBER_ADDRESS = '0x2222222222222222222222222222222222222222';
const OTHER_ADDRESS = '0x3333333333333333333333333333333333333333';
const DAO_ID = 'dao-test';
const ENS_NAME = 'whomst.eth';
const CID = 'bafyTest';

const buildPlugin = () =>
    generateDaoPlugin({
        settings: generateTokenPluginSettings({
            token: {
                ...generateToken({ address: TOKEN_ADDRESS, symbol: 'TKN' }),
                hasDelegate: true,
                underlying: null,
            },
        }),
    });

describe('<DelegationStatementCard />', () => {
    const useConnectionSpy = jest.spyOn(wagmi, 'useConnection');
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useEnsNameSpy = jest.spyOn(ensModule, 'useEnsName');
    const useDelegateStatementCidSpy = jest.spyOn(
        ensModule,
        'useDelegateStatementCid',
    );
    const useDelegateStatementSpy = jest.spyOn(
        delegateStatementService,
        'useDelegateStatement',
    );
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');

    const setHooks = (overrides?: {
        ensName?: string | null;
        cid?: string | null;
        statement?: { content: string } | null;
        connectedAddress?: string | null;
        dialogContext?: ReturnType<typeof generateDialogContext>;
    }) => {
        const {
            ensName = ENS_NAME,
            cid = null,
            statement = null,
            connectedAddress = null,
            dialogContext = generateDialogContext(),
        } = overrides ?? {};
        useConnectionSpy.mockReturnValue({
            address: connectedAddress ?? undefined,
            isConnected: connectedAddress != null,
        } as ReturnType<typeof wagmi.useConnection>);
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );
        useEnsNameSpy.mockReturnValue(
            generateReactQueryResultSuccessWithData(ensName),
        );
        useDelegateStatementCidSpy.mockReturnValue(
            generateReactQueryResultSuccessWithData(cid),
        );
        useDelegateStatementSpy.mockReturnValue(
            generateReactQueryResultSuccessWithData(
                statement,
            ) as unknown as ReturnType<
                typeof delegateStatementService.useDelegateStatement
            >,
        );
        useDialogContextSpy.mockReturnValue(dialogContext);
    };

    afterEach(() => {
        useConnectionSpy.mockReset();
        useDaoSpy.mockReset();
        useEnsNameSpy.mockReset();
        useDelegateStatementCidSpy.mockReset();
        useDelegateStatementSpy.mockReset();
        useDialogContextSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IDelegationStatementCardProps>,
    ) => {
        const completeProps: IDelegationStatementCardProps = {
            plugin: buildPlugin(),
            memberAddress: MEMBER_ADDRESS,
            daoId: DAO_ID,
            ...props,
        };
        return <DelegationStatementCard {...completeProps} />;
    };

    it('renders nothing when the profile address has no primary ENS', () => {
        setHooks({ ensName: null });
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the statement content when a CID resolves to a valid statement', () => {
        const content = 'I will vote for long-term protocol health.';
        setHooks({
            cid: CID,
            statement: { content },
        });
        render(createTestComponent());
        expect(screen.getByText(content)).toBeInTheDocument();
    });

    it('shows the empty-state CTA only when the connected wallet matches the profile address', () => {
        setHooks({ connectedAddress: MEMBER_ADDRESS });
        render(createTestComponent());
        expect(
            screen.getByRole('button', {
                name: 'app.governance.delegationStatementCard.emptyState.action',
            }),
        ).toBeInTheDocument();
    });

    it('renders nothing in the empty case when the connected wallet is a different address', () => {
        setHooks({ connectedAddress: OTHER_ADDRESS });
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
        expect(
            screen.queryByRole('button', {
                name: 'app.governance.delegationStatementCard.emptyState.action',
            }),
        ).not.toBeInTheDocument();
    });

    it('shows the edit affordance on an existing statement only for the profile owner', () => {
        const content = 'Existing statement.';
        setHooks({
            cid: CID,
            statement: { content },
            connectedAddress: MEMBER_ADDRESS,
        });
        render(createTestComponent());
        expect(
            screen.getByRole('button', {
                name: 'app.governance.delegationStatementCard.editAction',
            }),
        ).toBeInTheDocument();
    });

    it('hides the edit affordance on an existing statement for non-owners', () => {
        const content = 'Existing statement.';
        setHooks({
            cid: CID,
            statement: { content },
            connectedAddress: OTHER_ADDRESS,
        });
        render(createTestComponent());
        expect(screen.getByText(content)).toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: 'app.governance.delegationStatementCard.editAction',
            }),
        ).not.toBeInTheDocument();
    });

    it('opens the delegate statement form from the empty state CTA', async () => {
        const dialogContext = generateDialogContext();
        setHooks({
            connectedAddress: MEMBER_ADDRESS,
            dialogContext,
        });
        render(createTestComponent());
        const cta = screen.getByRole('button', {
            name: 'app.governance.delegationStatementCard.emptyState.action',
        });
        await userEvent.click(cta);
        expect(dialogContext.open).toHaveBeenCalledWith(
            'DELEGATE_STATEMENT_FORM',
            {
                params: {
                    tokenAddress: TOKEN_ADDRESS,
                    memberAddress: MEMBER_ADDRESS,
                    daoId: DAO_ID,
                    ensName: ENS_NAME,
                    network: Network.ETHEREUM_MAINNET,
                    existingCid: null,
                },
            },
        );
    });
});
