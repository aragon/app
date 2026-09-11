import { Network } from '@/shared/api/daoService';
import {
    generateWorkspaceQueryResponse,
    generateWorkspaceTransaction,
} from '../../testUtils';
import { WorkspaceAccountInfoStatus, WorkspaceAccountInfoType } from './domain';
import { workspaceQueryService } from './workspaceQueryService';

describe('workspaceQuery service', () => {
    const requestSpy = jest.spyOn(workspaceQueryService, 'request');

    afterEach(() => {
        requestSpy.mockReset();
    });

    describe('getAccounts', () => {
        it('posts the accounts to the v2 workspace accounts endpoint and unwraps the response', async () => {
            const accountInfo = {
                network: Network.ETHEREUM_SEPOLIA,
                address: '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
                type: WorkspaceAccountInfoType.DAO,
                status: WorkspaceAccountInfoStatus.AVAILABLE,
                indexed: true,
                name: 'Demo DAO',
            };
            requestSpy.mockResolvedValue({ data: [accountInfo] });

            const params = {
                body: {
                    accounts: [
                        {
                            network: Network.ETHEREUM_SEPOLIA,
                            address: accountInfo.address,
                        },
                    ],
                },
            };
            const result = await workspaceQueryService.getAccounts(params);

            expect(requestSpy).toHaveBeenCalledWith(
                '/v2/workspaces/query/accounts',
                params,
                { method: 'POST' },
            );
            expect(result).toEqual([accountInfo]);
        });
    });

    describe('getTransactions', () => {
        const accounts = [
            {
                network: Network.ETHEREUM_SEPOLIA,
                address: '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
            },
        ];

        it('posts the accounts to the v2 workspace transactions endpoint and returns the response', async () => {
            const transactions = generateWorkspaceQueryResponse({
                data: [generateWorkspaceTransaction()],
            });
            requestSpy.mockResolvedValue(transactions);

            const result = await workspaceQueryService.getTransactions({
                queryParams: { pageSize: 20 },
                body: { accounts },
            });

            expect(requestSpy).toHaveBeenCalledWith(
                '/v2/workspaces/query/transactions',
                expect.anything(),
                { method: 'POST' },
            );
            expect(result).toEqual(transactions);
        });

        it('moves the pagination into the request body, as the endpoint rejects query parameters', async () => {
            requestSpy.mockResolvedValue(generateWorkspaceQueryResponse());

            await workspaceQueryService.getTransactions({
                queryParams: { page: 2, pageSize: 20 },
                body: { accounts },
            });

            const [, requestParams] = requestSpy.mock.calls[0];

            expect(requestParams).toEqual({
                body: { accounts, pagination: { page: 2, pageSize: 20 } },
            });
        });
    });
});
