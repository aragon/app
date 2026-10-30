import type * as ReactQuery from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
    daoService,
    Network,
    PluginInterfaceType,
} from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import { memberOptions } from '../../api/governanceService';
import {
    DaoMemberDetailsPage,
    type IDaoMemberDetailsPageProps,
} from './daoMemberDetailsPage';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual<typeof ReactQuery>('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode; state?: unknown }) => (
        <div
            data-state={JSON.stringify(props.state)}
            data-testid="hydration-mock"
        >
            {props.children}
        </div>
    ),
}));

jest.mock('./daoMemberDetailsPageClient', () => ({
    DaoMemberDetailsPageClient: () => <div data-testid="page-client-mock" />,
}));

describe('<DaoMemberDetailsPage /> component', () => {
    const fetchQuerySpy = jest.spyOn(QueryClient.prototype, 'fetchQuery');
    const prefetchQuerySpy = jest.spyOn(QueryClient.prototype, 'prefetchQuery');
    const resolveDaoIdSpy = jest.spyOn(daoUtils, 'resolveDaoId');
    const getDaoSpy = jest.spyOn(daoService, 'getDao');

    beforeEach(() => {
        fetchQuerySpy.mockResolvedValue({});
        prefetchQuerySpy.mockImplementation(jest.fn());
        resolveDaoIdSpy.mockResolvedValue('test-dao-id');
        getDaoSpy.mockResolvedValue(
            generateDao({
                plugins: [
                    generateDaoPlugin({
                        interfaceType: PluginInterfaceType.MULTISIG,
                        isBody: true,
                    }),
                ],
            }),
        );
    });

    afterEach(() => {
        fetchQuerySpy.mockReset();
        prefetchQuerySpy.mockReset();
        resolveDaoIdSpy.mockReset();
        getDaoSpy.mockReset();
    });

    const validAddress = '0x1234567890123456789012345678901234567890';

    const createTestComponent = async (
        props?: Partial<IDaoMemberDetailsPageProps>,
    ) => {
        const completeProps: IDaoMemberDetailsPageProps = {
            params: Promise.resolve({
                address: validAddress,
                addressOrEns: 'test.dao.eth',
                network: Network.ETHEREUM_MAINNET,
            }),
            ...props,
        };
        const Component = await DaoMemberDetailsPage(completeProps);

        return Component;
    };

    it('prefetches the DAO member data from the given address and dao ID', async () => {
        const dao = generateDao({
            plugins: [
                generateDaoPlugin({
                    address: 'test-plugin-address',
                    interfaceType: PluginInterfaceType.MULTISIG,
                    isBody: true,
                }),
            ],
        });
        const params = {
            addressOrEns: 'test.dao.eth',
            network: Network.ETHEREUM_SEPOLIA,
            address: validAddress,
            pluginAddress: dao.plugins[0].address,
        };
        const expectedDaoId = 'test-dao-id';
        const memberParams = {
            urlParams: { address: params.address },
            queryParams: {
                daoId: expectedDaoId,
                pluginAddress: params.pluginAddress,
            },
        };
        resolveDaoIdSpy.mockResolvedValue(expectedDaoId);
        getDaoSpy.mockResolvedValue(dao);

        render(await createTestComponent({ params: Promise.resolve(params) }));
        expect(fetchQuerySpy.mock.calls[1][0].queryKey).toEqual(
            memberOptions(memberParams).queryKey,
        );
    });

    it('renders the page client component', async () => {
        render(await createTestComponent());
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });

    describe('body plugin selection', () => {
        const firstBodyAddress = '0x1111111111111111111111111111111111111111';
        const secondBodyAddress = '0x2222222222222222222222222222222222222222';

        const secondBody = generateDaoPlugin({
            address: secondBodyAddress,
            interfaceType: PluginInterfaceType.MULTISIG,
            isBody: true,
            slug: 'multisig',
        });
        // Mixed casing, as the backend returns checksummed addresses, so that the lowercase match is exercised.
        const safeBodyAddress = '0xAbCdEfAbCdEfAbCdEfAbCdEfAbCdEfAbCdEfAbCd';
        const safeDaoAddress = '0x3333333333333333333333333333333333333333';
        const safeBody = generateDaoPlugin({
            address: safeBodyAddress,
            interfaceType: PluginInterfaceType.SAFE,
            isBody: true,
            slug: 'safe',
        });
        // The tab ID of the Safe: a Safe body is named by its DAO as well, here the root DAO of the page.
        const safeTabId = `${safeBodyAddress}-safe-${safeDaoAddress}`;

        /**
         * Mocks a DAO with three visible bodies and returns the plugin address the member read was made under.
         */
        const renderAndReadPluginAddress = async (
            props?: Partial<IDaoMemberDetailsPageProps>,
        ) => {
            getDaoSpy.mockResolvedValue(
                generateDao({
                    address: safeDaoAddress,
                    plugins: [
                        generateDaoPlugin({
                            address: firstBodyAddress,
                            interfaceType: PluginInterfaceType.MULTISIG,
                            isBody: true,
                        }),
                        secondBody,
                        safeBody,
                    ],
                }),
            );
            render(await createTestComponent(props));

            return (
                fetchQuerySpy.mock.calls[1][0] as unknown as {
                    queryKey: unknown[];
                }
            ).queryKey;
        };

        const expectedQueryKey = (pluginAddress: string) =>
            memberOptions({
                urlParams: { address: validAddress },
                queryParams: { daoId: 'test-dao-id', pluginAddress },
            }).queryKey;

        // The links into this page name the body with the tab ID its own filters carry on the URL, so that one value
        // picks both the body reported here and the body the vote list opens on. A Safe's tab ID names its DAO too.
        it('resolves the body from a tab ID', async () => {
            const queryKey = await renderAndReadPluginAddress({
                searchParams: Promise.resolve({ members: safeTabId }),
            });

            expect(queryKey).toEqual(expectedQueryKey(safeBodyAddress));
        });

        // The workspace falls back to the governance address of the membership when the URL names no body.
        it('resolves the body from a plain address', async () => {
            const queryKey = await renderAndReadPluginAddress({
                searchParams: Promise.resolve({ members: secondBodyAddress }),
            });

            expect(queryKey).toEqual(expectedQueryKey(secondBodyAddress));
        });

        it('matches a lowercased body ID', async () => {
            const queryKey = await renderAndReadPluginAddress({
                searchParams: Promise.resolve({
                    members: safeTabId.toLowerCase(),
                }),
            });

            expect(queryKey).toEqual(expectedQueryKey(safeBodyAddress));
        });

        it('matches the named body plugin regardless of the address casing', async () => {
            const queryKey = await renderAndReadPluginAddress({
                searchParams: Promise.resolve({
                    members: secondBodyAddress.toUpperCase(),
                }),
            });

            expect(queryKey).toEqual(expectedQueryKey(secondBodyAddress));
        });

        // A governance that has since been hidden, or that belongs to another DAO, degrades to the default page.
        it('falls back to the first visible body when the value names none', async () => {
            const queryKey = await renderAndReadPluginAddress({
                searchParams: Promise.resolve({
                    members: '0x3333333333333333333333333333333333333333',
                }),
            });

            expect(queryKey).toEqual(expectedQueryKey(firstBodyAddress));
        });

        // The `/dao/…` route has no way to name a body, so it keeps reading the first one.
        it('falls back to the first visible body when given no body', async () => {
            const queryKey = await renderAndReadPluginAddress();

            expect(queryKey).toEqual(expectedQueryKey(firstBodyAddress));
        });
    });

    it('renders error with a link to the members page when the address is not a valid hex address', async () => {
        const daoEns = 'test.dao.eth';
        const daoNetwork = Network.ETHEREUM_MAINNET;
        const params = {
            addressOrEns: daoEns,
            network: daoNetwork,
            address: 'not-an-address',
        };

        render(await createTestComponent({ params: Promise.resolve(params) }));
        const errorLink = screen.getByRole('link', {
            name: /daoMemberDetailsPage.error.action/,
        });
        expect(errorLink).toBeInTheDocument();
        expect(errorLink.getAttribute('href')).toEqual(
            `/dao/${daoNetwork}/${daoEns}/members`,
        );
    });

    it('still renders the page client component when the member prefetch fails', async () => {
        fetchQuerySpy
            .mockResolvedValueOnce({})
            .mockRejectedValueOnce(new Error('not found'));
        render(await createTestComponent());
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });
});
