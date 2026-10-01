import { render, screen } from '@testing-library/react';
import * as daoService from '@/shared/api/daoService';
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import * as translationsProvider from '@/shared/components/translationsProvider';
import * as useDaoPluginsHook from '@/shared/hooks/useDaoPlugins';
import {
    generateDao,
    generateDaoPlugin,
    generateFilterComponentPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import * as safeDaoProposalsHook from '../../hooks/useSafeDaoProposals';
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

    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useDaoPluginsSpy = jest.spyOn(useDaoPluginsHook, 'useDaoPlugins');
    const useSafeDaoProposalSpy = jest.spyOn(
        safeDaoProposalsHook,
        'useSafeDaoProposal',
    );
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
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: dao }),
        );
        useDaoPluginsSpy.mockReturnValue([
            generateFilterComponentPlugin({ meta: safePlugin }),
        ]);
        useTranslationsSpy.mockReturnValue({
            t: (key) => key,
        });
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useDaoPluginsSpy.mockReset();
        useSafeDaoProposalSpy.mockReset();
        useTranslationsSpy.mockReset();
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
});
