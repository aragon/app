import { GukModulesProvider, ProposalStatus } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as walletAccountHook from '@/modules/application/hooks/useWalletAccount';
import * as daoService from '@/shared/api/daoService';
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import * as safeServiceApi from '@/shared/api/safeService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import * as translationsProvider from '@/shared/components/translationsProvider';
import * as useDaoPluginsHook from '@/shared/hooks/useDaoPlugins';
import {
    generateDao,
    generateDaoPlugin,
    generateFilterComponentPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { generateDialogContext } from '@/shared/testUtils/generators/dialogContext';
import * as safeDaoProposalActionsHook from '../../hooks/useSafeDaoProposalActions';
import * as safeDaoProposalsHook from '../../hooks/useSafeDaoProposals';
import {
    generateSafeConfirmation,
    generateSafeInfo,
    generateSafeMultisigTransaction,
} from '../../testUtils';
import { SafeTransactionState } from '../../types';
import { SafeDaoProposalDetails } from './safeDaoProposalDetails';

describe('<SafeDaoProposalDetails />', () => {
    const daoAddress = '0x1111111111111111111111111111111111111111';
    const safeAddress = '0x2222222222222222222222222222222222222222';
    const safeTxHash = `0x${'1'.repeat(64)}`;
    const dao = generateDao({
        address: daoAddress,
        id: 'dao-id',
        network: Network.ETHEREUM_MAINNET,
    });
    const safePlugin = generateDaoPlugin({
        address: safeAddress,
        daoAddress,
        interfaceType: PluginInterfaceType.SAFE,
    });

    const useWalletAccountSpy = jest.spyOn(
        walletAccountHook,
        'useWalletAccount',
    );
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useSafeInfoSpy = jest.spyOn(safeServiceApi, 'useSafeInfo');
    const useDaoPluginsSpy = jest.spyOn(useDaoPluginsHook, 'useDaoPlugins');
    const useSafeDaoProposalSpy = jest.spyOn(
        safeDaoProposalsHook,
        'useSafeDaoProposal',
    );
    const useSafeDaoProposalActionsSpy = jest.spyOn(
        safeDaoProposalActionsHook,
        'useSafeDaoProposalActions',
    );
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useTranslationsSpy = jest.spyOn(
        translationsProvider,
        'useTranslations',
    );

    const createTestComponent = () => (
        <SafeDaoProposalDetails
            daoId={dao.id}
            safeAddress={safeAddress}
            safeTxHash={safeTxHash}
        />
    );

    beforeEach(() => {
        useWalletAccountSpy.mockReturnValue({
            address: undefined,
            chainId: undefined,
            isConnecting: false,
            isReconnecting: false,
        });
        useSafeInfoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateSafeInfo() }),
        );
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: dao }),
        );
        useDaoPluginsSpy.mockReturnValue([
            generateFilterComponentPlugin({ meta: safePlugin }),
        ]);
        useTranslationsSpy.mockReturnValue({
            t: (key) => key,
        });
        useSafeDaoProposalActionsSpy.mockReturnValue({
            actions: [],
            isDecoding: false,
            usingDecoded: false,
        });
        useDialogContextSpy.mockReturnValue(generateDialogContext());
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useSafeInfoSpy.mockReset();
        useDaoPluginsSpy.mockReset();
        useSafeDaoProposalSpy.mockReset();
        useTranslationsSpy.mockReset();
        useSafeDaoProposalActionsSpy.mockReset();
        useDialogContextSpy.mockReset();
        useWalletAccountSpy.mockReset();
    });

    it('does not render a false not-found state while the store is indexing', () => {
        useSafeDaoProposalSpy.mockReturnValue({
            data: undefined,
            error: null,
            isError: false,
            isIndexing: true,
            isLoading: false,
            isNotFound: false,
            isPartial: true,
            isStale: true,
        });

        render(createTestComponent());

        expect(
            screen.getByRole('heading', {
                name: 'app.safe.safeDaoProposalDetails.loadingHeading',
                level: 1,
            }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('heading', {
                name: 'app.safe.safeDaoProposalDetails.notFoundHeading',
                level: 1,
            }),
        ).not.toBeInTheDocument();
    });

    it('renders not-found only after the singular lookup is definitive', () => {
        useSafeDaoProposalSpy.mockReturnValue({
            data: undefined,
            error: null,
            isError: false,
            isIndexing: false,
            isLoading: false,
            isNotFound: true,
            isPartial: false,
            isStale: false,
        });

        render(createTestComponent());

        expect(
            screen.getByRole('heading', {
                name: 'app.safe.safeDaoProposalDetails.notFoundHeading',
                level: 1,
            }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('heading', {
                name: 'app.safe.safeDaoProposalDetails.loadingHeading',
                level: 1,
            }),
        ).not.toBeInTheDocument();
    });
    it('renders native approvals before actions and Safe details', () => {
        const ownerOne = '0x0000000000000000000000000000000000000011';
        const ownerTwo = '0x0000000000000000000000000000000000000012';
        const transaction = generateSafeMultisigTransaction({
            confirmations: [generateSafeConfirmation({ owner: ownerOne })],
            nonce: '7',
            safeTxHash,
        });

        useSafeDaoProposalSpy.mockReturnValue({
            data: {
                meta: {
                    fetchedAt: '2026-01-01T00:00:00.000Z',
                    partial: false,
                    stale: false,
                },
                proposals: [
                    {
                        actions: [],
                        state: SafeTransactionState.LIVE,
                        status: ProposalStatus.ACTIVE,
                        transaction,
                    },
                ],
                safeInfo: generateSafeInfo({
                    address: safeAddress,
                    nonce: '7',
                    owners: [ownerOne, ownerTwo],
                    threshold: 2,
                }),
            },
            error: null,
            isError: false,
            isIndexing: false,
            isLoading: false,
            isNotFound: false,
            isPartial: false,
            isStale: false,
        });

        render(
            <GukModulesProvider>{createTestComponent()}</GukModulesProvider>,
        );
        expect(
            screen.getByRole('link', {
                name: 'app.governance.daoProposalDetailsPage.header.breadcrumb.proposals',
            }),
        ).toHaveAttribute(
            'href',
            `/dao/ethereum-mainnet/${daoAddress}/proposals`,
        );
        expect(
            screen.getByRole('heading', { name: /^SAFE-7 ·/ }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.governance.daoProposalDetailsPage.aside.details.creator',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.governance.daoProposalDetailsPage.aside.details.published',
            ),
        ).toBeInTheDocument();
        expect(screen.queryByText('Confirmations')).not.toBeInTheDocument();

        const approvalsHeading = screen.getByRole('heading', {
            name: 'app.safe.safeDaoProposalDetails.approvalsTitle',
        });
        const actionsHeading = screen.getByRole('heading', {
            name: 'app.safe.safeDaoProposalDetails.actionsTitle',
        });

        expect(
            approvalsHeading.compareDocumentPosition(actionsHeading) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).not.toBe(0);
        expect(
            screen.getByRole('button', {
                name: 'app.safe.safeDaoProposalDetails.sign',
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.governance.daoProposalDetailsPage.aside.details.title',
            ),
        ).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.getByText('Approval')).toBeInTheDocument();
        expect(screen.queryByText(/left to vote/i)).not.toBeInTheDocument();
        expect(
            screen.getByText('Active', { selector: 'main span' }),
        ).toBeInTheDocument();
        expect(screen.queryByText('is pending')).not.toBeInTheDocument();
    });
    it('shows the signed state when the connected owner already confirmed', () => {
        const ownerOne = '0x0000000000000000000000000000000000000011';
        const ownerTwo = '0x0000000000000000000000000000000000000012';
        const transaction = generateSafeMultisigTransaction({
            confirmations: [generateSafeConfirmation({ owner: ownerOne })],
            nonce: '7',
            safeTxHash,
        });

        useWalletAccountSpy.mockReturnValue({
            address: ownerOne,
            chainId: undefined,
            isConnecting: false,
            isReconnecting: false,
        });
        useSafeDaoProposalSpy.mockReturnValue({
            data: {
                meta: {
                    fetchedAt: '2026-01-01T00:00:00.000Z',
                    partial: false,
                    stale: false,
                },
                proposals: [
                    {
                        actions: [],
                        state: SafeTransactionState.LIVE,
                        status: ProposalStatus.ACTIVE,
                        transaction,
                    },
                ],
                safeInfo: generateSafeInfo({
                    address: safeAddress,
                    nonce: '7',
                    owners: [ownerOne, ownerTwo],
                    threshold: 2,
                }),
            },
            error: null,
            isError: false,
            isIndexing: false,
            isLoading: false,
            isNotFound: false,
            isPartial: false,
            isStale: false,
        });

        render(
            <GukModulesProvider>{createTestComponent()}</GukModulesProvider>,
        );

        expect(
            screen.queryByRole('button', {
                name: 'app.safe.safeDaoProposalDetails.sign',
            }),
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'app.safe.safeDaoProposalDetails.signed',
            }),
        ).toBeDisabled();
    });
});
