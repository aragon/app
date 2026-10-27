import { addressUtils } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import * as NextNavigation from 'next/navigation';
import type { ReactNode } from 'react';
import { getAddress } from 'viem';
import { queryClientConfig } from '@/modules/application/constants/reactQuery';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import {
    type IWorkspaceAccountInfo,
    WorkspaceAccountInfoStatus,
    WorkspaceAccountInfoType,
    workspaceQueryService,
} from '../../api/workspaceQueryService';
import {
    type IWorkspace,
    type IWorkspaceAccount,
    WorkspaceAccountType,
    workspaceService,
} from '../../api/workspaceService';
import { WorkspaceAccountState } from '../../constants/workspaceAccountState';
import { useWorkspaceAccountOptions } from './useWorkspaceAccountOptions';

describe('useWorkspaceAccountOptions hook', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const safeAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');
    const getAccountsSpy = jest.spyOn(workspaceQueryService, 'getAccounts');
    const useParamsSpy = jest.spyOn(NextNavigation, 'useParams');

    const daoAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${daoAddress}`,
        type: WorkspaceAccountType.DAO,
        address: daoAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const safeAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${safeAddress}`,
        type: WorkspaceAccountType.SAFE,
        address: safeAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const buildWorkspace = (workspace?: Partial<IWorkspace>): IWorkspace => ({
        id: 'demo',
        name: 'Test Workspace',
        description: '',
        avatar: null,
        links: [],
        accounts: [daoAccount, safeAccount],
        targets: [],
        ...workspace,
    });

    beforeEach(() => {
        useParamsSpy.mockReturnValue({ workspaceId: 'demo', accountId: 'all' });
        getWorkspaceSpy.mockResolvedValue(buildWorkspace());
        getAccountsSpy.mockResolvedValue([
            {
                network: Network.ETHEREUM_SEPOLIA,
                address: daoAddress,
                type: WorkspaceAccountInfoType.DAO,
                status: WorkspaceAccountInfoStatus.AVAILABLE,
                indexed: true,
                name: 'Demo DAO',
            },
        ]);
    });

    afterEach(() => {
        useParamsSpy.mockReset();
        getWorkspaceSpy.mockReset();
        getAccountsSpy.mockReset();
    });

    const renderTestHook = () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
            // The app config, so a failed lookup settles without retries as it does in the app.
            <ReactQueryWrapper client={new QueryClient(queryClientConfig)}>
                {children}
            </ReactQueryWrapper>
        );

        return renderHook(() => useWorkspaceAccountOptions(), { wrapper });
    };

    it('offers the aggregated option first, followed by every account of the workspace', async () => {
        const { result } = renderTestHook();

        await waitFor(() => expect(result.current.options).toHaveLength(3));
        const [allOption, daoOption, safeOption] = result.current.options;
        expect(allOption.isAllAccounts).toBeTruthy();
        expect(daoOption.id).toEqual(daoAccount.id);
        expect(safeOption.id).toEqual(safeAccount.id);
    });

    it('builds an option for a Safe account', async () => {
        const { result } = renderTestHook();

        await waitFor(() => expect(result.current.options).toHaveLength(3));
        const safeOption = result.current.options.find(
            (option) => option.id === safeAccount.id,
        );
        expect(safeOption?.account?.type).toEqual(WorkspaceAccountType.SAFE);
        expect(safeOption?.isAllAccounts).toBeFalsy();
    });

    it('labels a Safe by its registry name', async () => {
        getWorkspaceSpy.mockResolvedValue(
            buildWorkspace({
                accounts: [
                    daoAccount,
                    { ...safeAccount, metadata: { name: 'Treasury Safe' } },
                ],
            }),
        );
        const { result } = renderTestHook();

        await waitFor(() =>
            expect(result.current.options[2]?.label).toEqual('Treasury Safe'),
        );
    });

    it('labels an unnamed Safe by its truncated address', async () => {
        const { result } = renderTestHook();

        await waitFor(() => expect(result.current.options).toHaveLength(3));
        expect(result.current.options[2].label).toEqual(
            addressUtils.truncateAddress(safeAddress),
        );
    });

    it('labels a DAO account with the name resolved by the accounts API', async () => {
        const { result } = renderTestHook();

        await waitFor(() =>
            expect(result.current.options[1]?.label).toEqual('Demo DAO'),
        );
    });

    it('reads the aggregated segment of the route as every account', async () => {
        const { result } = renderTestHook();

        await waitFor(() => expect(result.current.options).toHaveLength(3));
        expect(result.current.accountId).toEqual('all');
        expect(result.current.isAllAccounts).toBeTruthy();
        expect(result.current.activeOption?.isAllAccounts).toBeTruthy();
    });

    it('reads the account of the route as the active option', async () => {
        useParamsSpy.mockReturnValue({
            workspaceId: 'demo',
            accountId: daoAccount.id,
        });
        const { result } = renderTestHook();

        await waitFor(() =>
            expect(result.current.activeOption?.id).toEqual(daoAccount.id),
        );
        expect(result.current.isAllAccounts).toBeFalsy();
    });

    it('resolves the aggregated option for the all-accounts segment', async () => {
        const { result } = renderTestHook();

        await waitFor(() => expect(result.current.options).toHaveLength(3));
        expect(result.current.activeOption?.isAllAccounts).toBeTruthy();
        expect(result.current.activeOption?.account).toBeUndefined();
    });

    it('resolves the active option of a Safe account', async () => {
        useParamsSpy.mockReturnValue({
            workspaceId: 'demo',
            accountId: safeAccount.id,
        });
        const { result } = renderTestHook();

        await waitFor(() =>
            expect(result.current.activeOption?.id).toEqual(safeAccount.id),
        );
    });

    // `LayoutWorkspaceAccount` accepts any casing while stored IDs are checksummed, so this must not widen to "none".
    it('resolves the active option for a lowercased account segment', async () => {
        const lowercased = `${Network.ETHEREUM_SEPOLIA}-${safeAddress.toLowerCase()}`;
        useParamsSpy.mockReturnValue({
            workspaceId: 'demo',
            accountId: lowercased,
        });
        const { result } = renderTestHook();

        await waitFor(() =>
            expect(result.current.activeOption?.id).toEqual(safeAccount.id),
        );
        expect(result.current.accountId).toEqual(lowercased);
    });

    it('aggregates on a route with no account segment', async () => {
        useParamsSpy.mockReturnValue({ workspaceId: 'demo' });
        const { result } = renderTestHook();

        await waitFor(() => expect(result.current.options).toHaveLength(3));
        expect(result.current.accountId).toEqual('all');
        expect(result.current.isAllAccounts).toBeTruthy();
    });

    describe('external account', () => {
        // Lowercased, as a shared link may carry it: the synthesized account is still checksummed.
        const externalAddress = '0x1111111111111111111111111111111111111111';
        const externalAccountId = `${Network.ETHEREUM_SEPOLIA}-${externalAddress}`;

        const buildExternalInfo = (
            info?: Partial<IWorkspaceAccountInfo>,
        ): IWorkspaceAccountInfo => ({
            network: Network.ETHEREUM_SEPOLIA,
            address: externalAddress,
            type: WorkspaceAccountInfoType.DAO,
            status: WorkspaceAccountInfoStatus.AVAILABLE,
            indexed: true,
            name: 'External DAO',
            ...info,
        });

        // Resolves the workspace accounts as the outer `beforeEach` does, and the external one as given.
        // Takes a factory so that a rejected lookup is only created once the hook asks for it.
        const mockExternalLookup = (
            lookup?: () => Promise<IWorkspaceAccountInfo[]>,
        ) =>
            getAccountsSpy.mockImplementation((params) =>
                params.body.accounts.some(
                    ({ address }) => address === externalAddress,
                )
                    ? (lookup?.() ?? new Promise(() => undefined))
                    : Promise.resolve([]),
            );

        beforeEach(() => {
            useParamsSpy.mockReturnValue({
                workspaceId: 'demo',
                accountId: externalAccountId,
            });
        });

        // What is being looked at is not the same question as what can be switched to: an account the workspace
        // does not hold becomes an option of its own instead of silently reading as the aggregated one.
        it('adds an external option for an account the workspace does not hold, last', async () => {
            mockExternalLookup(() => Promise.resolve([buildExternalInfo()]));
            const { result } = renderTestHook();

            await waitFor(() => expect(result.current.options).toHaveLength(4));
            expect(result.current.options[3]).toEqual(
                expect.objectContaining({
                    id: externalAccountId,
                    isExternal: true,
                    isAllAccounts: false,
                }),
            );
            expect(result.current.activeOption?.isExternal).toBeTruthy();
            expect(result.current.accountId).toEqual(externalAccountId);
            expect(result.current.isAllAccounts).toBeFalsy();
        });

        it('resolves the external account with a single-account lookup', async () => {
            mockExternalLookup(() => Promise.resolve([buildExternalInfo()]));
            renderTestHook();

            await waitFor(() =>
                expect(getAccountsSpy).toHaveBeenCalledWith({
                    body: {
                        accounts: [
                            {
                                network: Network.ETHEREUM_SEPOLIA,
                                address: externalAddress,
                            },
                        ],
                    },
                }),
            );
        });

        it('scopes to nothing, labelled by the truncated address, while the lookup is pending', async () => {
            mockExternalLookup();
            const { result } = renderTestHook();

            await waitFor(() =>
                expect(result.current.activeOption?.isExternal).toBeTruthy(),
            );
            expect(result.current.activeOption?.label).toEqual(
                addressUtils.truncateAddress(externalAddress),
            );
            expect(result.current.activeOption?.account).toBeUndefined();
            expect(result.current.scopedAccounts).toEqual([]);
            expect(result.current.isPending).toBeTruthy();
        });

        it('synthesizes a checksummed DAO account named by the lookup', async () => {
            mockExternalLookup(() => Promise.resolve([buildExternalInfo()]));
            const { result } = renderTestHook();

            await waitFor(() => expect(result.current.isPending).toBeFalsy());
            const expectedAccount: IWorkspaceAccount = {
                id: `${Network.ETHEREUM_SEPOLIA}-${getAddress(externalAddress)}`,
                type: WorkspaceAccountType.DAO,
                network: Network.ETHEREUM_SEPOLIA,
                address: externalAddress,
            };
            expect(result.current.activeOption?.account).toEqual(
                expectedAccount,
            );
            expect(result.current.activeOption?.label).toEqual('External DAO');
            expect(result.current.scopedAccounts).toEqual([expectedAccount]);
        });

        it('synthesizes a Safe account', async () => {
            mockExternalLookup(() =>
                Promise.resolve([
                    buildExternalInfo({
                        type: WorkspaceAccountInfoType.SAFE,
                        indexed: false,
                        name: null,
                    }),
                ]),
            );
            const { result } = renderTestHook();

            await waitFor(() => expect(result.current.isPending).toBeFalsy());
            expect(result.current.activeOption?.account?.type).toEqual(
                WorkspaceAccountType.SAFE,
            );
        });

        it.each([
            {
                outcome: 'an unsupported address',
                lookup: () =>
                    Promise.resolve([
                        buildExternalInfo({
                            type: WorkspaceAccountInfoType.UNKNOWN,
                            status: WorkspaceAccountInfoStatus.UNSUPPORTED,
                        }),
                    ]),
                expected: WorkspaceAccountState.NOT_FOUND,
            },
            {
                // The endpoint 404s the whole request for an address that is neither a DAO nor a Safe.
                outcome: 'a not-found lookup',
                lookup: () =>
                    Promise.reject(
                        new AragonBackendServiceError(
                            AragonBackendServiceError.notFoundCode,
                            'Resource not found',
                            404,
                        ),
                    ),
                expected: WorkspaceAccountState.NOT_FOUND,
            },
            {
                outcome: 'an unavailable source',
                lookup: () =>
                    Promise.resolve([
                        buildExternalInfo({
                            type: WorkspaceAccountInfoType.UNKNOWN,
                            status: WorkspaceAccountInfoStatus.UNAVAILABLE,
                        }),
                    ]),
                expected: WorkspaceAccountState.UNAVAILABLE,
            },
            {
                outcome: 'a failed lookup',
                lookup: () =>
                    Promise.reject(new Error('Internal server error')),
                expected: WorkspaceAccountState.UNAVAILABLE,
            },
        ])(
            'scopes to nothing rather than to every account for $outcome, in the $expected state',
            async ({ lookup, expected }) => {
                mockExternalLookup(lookup);
                const { result } = renderTestHook();

                await waitFor(() =>
                    expect(result.current.isPending).toBeFalsy(),
                );
                expect(result.current.activeOption?.isExternal).toBeTruthy();
                expect(result.current.activeOption?.accountState).toEqual(
                    expected,
                );
                expect(result.current.activeOption?.account).toBeUndefined();
                expect(result.current.scopedAccounts).toEqual([]);
            },
        );

        it('reads the state of a resolved account', async () => {
            mockExternalLookup(() => Promise.resolve([buildExternalInfo()]));
            const { result } = renderTestHook();

            await waitFor(() => expect(result.current.isPending).toBeFalsy());
            expect(result.current.activeOption?.accountState).toEqual(
                WorkspaceAccountState.DAO,
            );
        });

        it('looks the external account up again on refetch', async () => {
            mockExternalLookup(() =>
                Promise.resolve([
                    buildExternalInfo({
                        type: WorkspaceAccountInfoType.UNKNOWN,
                        status: WorkspaceAccountInfoStatus.UNAVAILABLE,
                    }),
                ]),
            );
            const { result } = renderTestHook();

            await waitFor(() => expect(result.current.isPending).toBeFalsy());
            const lookupCount = getAccountsSpy.mock.calls.length;
            mockExternalLookup(() => Promise.resolve([buildExternalInfo()]));
            act(() => result.current.refetchExternalAccount());

            await waitFor(() =>
                expect(result.current.activeOption?.accountState).toEqual(
                    WorkspaceAccountState.DAO,
                ),
            );
            expect(getAccountsSpy.mock.calls.length).toBeGreaterThan(
                lookupCount,
            );
        });
    });

    describe('scopedAccounts', () => {
        it('holds every account of the workspace on the aggregated scope', async () => {
            const { result } = renderTestHook();

            await waitFor(() => expect(result.current.isPending).toBeFalsy());
            expect(result.current.scopedAccounts).toEqual([
                daoAccount,
                safeAccount,
            ]);
        });

        it('holds the account of the route for an account the workspace holds', async () => {
            useParamsSpy.mockReturnValue({
                workspaceId: 'demo',
                accountId: safeAccount.id,
            });
            const { result } = renderTestHook();

            await waitFor(() => expect(result.current.isPending).toBeFalsy());
            expect(result.current.scopedAccounts).toEqual([safeAccount]);
            expect(result.current.activeOption?.isExternal).toBeFalsy();
        });

        it('is pending while the workspace loads', () => {
            getWorkspaceSpy.mockReturnValue(new Promise(() => undefined));
            const { result } = renderTestHook();

            expect(result.current.isPending).toBeTruthy();
            expect(result.current.scopedAccounts).toEqual([]);
        });
    });

    it('does not resolve account names for a workspace that has none', async () => {
        getWorkspaceSpy.mockResolvedValue(buildWorkspace({ accounts: [] }));
        const { result } = renderTestHook();

        await waitFor(() => expect(result.current.options).toHaveLength(1));
        expect(getAccountsSpy).not.toHaveBeenCalled();
    });
});
