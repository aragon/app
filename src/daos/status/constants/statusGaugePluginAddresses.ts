import { statusTest } from '../statusTest/constants/statusTest';

// TODO: Replace with actual Status gauge voter plugin address once deployed.
// Currently using Cryptex test DAO's token voting plugin address to prove UI flow.
export const statusGaugePluginAddressByDaoId = {
    [statusTest.id]:
        '0xCCBe12eC0B50E14e62870BE41e6D9258b5D609c9' as `0x${string}`,
} satisfies Record<string, `0x${string}`>;
