import { Network } from '@/shared/api/daoService';
import {
    type IWorkspaceAccountInfo,
    WorkspaceAccountInfoStatus,
    WorkspaceAccountInfoType,
    workspaceQueryService,
} from '../../api/workspaceQueryService';
import { workspaceAccountInfoUtils } from './workspaceAccountInfoUtils';

describe('workspaceAccountInfo utils', () => {
    const account = {
        network: Network.ETHEREUM_SEPOLIA,
        address: '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419',
    };

    const buildInfo = (
        info?: Partial<IWorkspaceAccountInfo>,
    ): IWorkspaceAccountInfo => ({
        ...account,
        type: WorkspaceAccountInfoType.SAFE,
        status: WorkspaceAccountInfoStatus.AVAILABLE,
        indexed: false,
        ...info,
    });

    const getAccountsSpy = jest.spyOn(workspaceQueryService, 'getAccounts');

    afterEach(() => {
        getAccountsSpy.mockReset();
    });

    describe('getAccountInfo', () => {
        it('returns the account info of a Safe', async () => {
            getAccountsSpy.mockResolvedValue([buildInfo()]);
            const result =
                await workspaceAccountInfoUtils.getAccountInfo(account);
            expect(result?.type).toBe(WorkspaceAccountInfoType.SAFE);
            expect(getAccountsSpy).toHaveBeenCalledWith({
                body: { accounts: [account] },
            });
        });

        it('returns the account info of a DAO', async () => {
            const info = buildInfo({
                type: WorkspaceAccountInfoType.DAO,
                indexed: true,
            });
            getAccountsSpy.mockResolvedValue([info]);
            const result =
                await workspaceAccountInfoUtils.getAccountInfo(account);
            expect(result).toEqual(info);
        });

        it('returns undefined when the lookup throws', async () => {
            getAccountsSpy.mockRejectedValue(new Error());
            const result =
                await workspaceAccountInfoUtils.getAccountInfo(account);
            expect(result).toBeUndefined();
        });
    });
});
