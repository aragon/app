import { Network } from '@/shared/api/daoService';
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
});
