import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as wagmi from 'wagmi';
import * as ensModule from '@/modules/ens';
import { generateToken } from '@/modules/finance/testUtils';
import { generateTokenPluginSettings } from '@/plugins/tokenPlugin/testUtils';
import * as daoService from '@/shared/api/daoService';
import * as ipfsService from '@/shared/api/ipfsService';
import {
    generateDao,
    generateDaoPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import {
    DelegationStatementCard,
    type IDelegationStatementCardProps,
} from './delegationStatementCard';

// generateReactQueryResultSuccess coerces null data to {} via ?? — bypass that
// for hooks that legitimately resolve to null/undefined (no ENS, no statement, etc.).
const successWith = <TData,>(data: TData) =>
    ({ ...generateReactQueryResultSuccess({}), data }) as never;

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
    const useIpfsJsonSpy = jest.spyOn(ipfsService, 'useIpfsJson');

    const setHooks = (overrides?: {
        ensName?: string | null;
        cid?: string | null;
        statement?: { content: string } | null;
        connectedAddress?: string | null;
    }) => {
        const {
            ensName = ENS_NAME,
            cid = null,
            statement = null,
            connectedAddress = null,
        } = overrides ?? {};
        useConnectionSpy.mockReturnValue({
            address: connectedAddress ?? undefined,
            isConnected: connectedAddress != null,
        } as ReturnType<typeof wagmi.useConnection>);
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );
        useEnsNameSpy.mockReturnValue(successWith(ensName));
        useDelegateStatementCidSpy.mockReturnValue(
            successWith({ [TOKEN_ADDRESS.toLowerCase()]: cid }),
        );
        useIpfsJsonSpy.mockReturnValue(successWith(statement));
    };

    afterEach(() => {
        useConnectionSpy.mockReset();
        useDaoSpy.mockReset();
        useEnsNameSpy.mockReset();
        useDelegateStatementCidSpy.mockReset();
        useIpfsJsonSpy.mockReset();
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

    it('the empty-state CTA is wired to a handler (Wave 3 will open the dialog)', async () => {
        setHooks({ connectedAddress: MEMBER_ADDRESS });
        render(createTestComponent());
        const cta = screen.getByRole('button', {
            name: 'app.governance.delegationStatementCard.emptyState.action',
        });
        // Clicking should not throw — the no-op handler is the Wave 2 stub.
        await userEvent.click(cta);
        expect(cta).toBeInTheDocument();
    });
});
