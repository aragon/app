import { Network } from '@/shared/api/daoService';
import {
    generateWorkspaceQueryResponse,
    generateWorkspaceTransaction,
} from '../../testUtils';
import type { IWorkspaceAssetListResponse } from './domain';
import { WorkspaceAccountInfoStatus, WorkspaceAccountInfoType } from './domain';
import { workspaceQueryService } from './workspaceQueryService';
import type { IGetWorkspaceAssetListParams } from './workspaceQueryService.api';

describe('workspaceQuery service', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const account = { network: Network.ETHEREUM_SEPOLIA, address };

    const requestSpy = jest.spyOn(workspaceQueryService, 'request');

    afterEach(() => {
        requestSpy.mockReset();
    });

    describe('getAccounts', () => {
        it('posts the accounts to the v2 workspace accounts endpoint and unwraps the response', async () => {
            const accountInfo = {
                ...account,
                type: WorkspaceAccountInfoType.DAO,
                status: WorkspaceAccountInfoStatus.AVAILABLE,
                indexed: true,
                name: 'Demo DAO',
            };
            requestSpy.mockResolvedValue({ data: [accountInfo] });

            const params = { body: { accounts: [account] } };
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

    describe('getAssetList', () => {
        it('posts the accounts to the v2 workspace assets endpoint', async () => {
            const response = { data: [], metadata: {}, coverage: [] };
            requestSpy.mockResolvedValue(response);

            const params: IGetWorkspaceAssetListParams = {
                body: { accounts: [account], pagination: { pageSize: 20 } },
            };
            const result = await workspaceQueryService.getAssetList(params);

            expect(requestSpy).toHaveBeenCalledWith(
                '/v2/workspaces/query/assets',
                params,
                { method: 'POST' },
            );
            expect(result).toEqual(response);
        });
    });

    describe('getNextBodyPageParams', () => {
        const params: IGetWorkspaceAssetListParams = {
            body: { accounts: [account], pagination: { pageSize: 20 } },
        };

        const buildResponse = (
            metadata?: Partial<IWorkspaceAssetListResponse['metadata']>,
        ): IWorkspaceAssetListResponse => ({
            data: [],
            metadata: {
                page: 1,
                pageSize: 20,
                totalPages: 3,
                totalRecords: 45,
                ...metadata,
            },
            coverage: [],
            partial: false,
        });

        it('increments the page inside the request body, not the query string', () => {
            const result = workspaceQueryService.getNextBodyPageParams(
                buildResponse({ page: 1 }),
                [],
                params,
            );

            expect(result).toEqual({
                body: {
                    ...params.body,
                    pagination: { pageSize: 20, page: 2 },
                },
            });
        });

        it('returns undefined on the last page', () => {
            const result = workspaceQueryService.getNextBodyPageParams(
                buildResponse({ page: 3, totalPages: 3 }),
                [],
                params,
            );

            expect(result).toBeUndefined();
        });

        it('returns undefined when the page has no metadata', () => {
            const result = workspaceQueryService.getNextBodyPageParams(
                null,
                [],
                params,
            );

            expect(result).toBeUndefined();
        });
    });
});
