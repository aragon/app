import { gaugeDistributionsDemo } from '../gaugeDistributionsDemo/constants/gaugeDistributionsDemo';

// Placeholder: points the demo DAO at Cryptex test's token voting plugin to prove the UI flow.
// Swap for a real gauge voter plugin address when a deployed gauge contract is available.
export const gaugeDistributionsPluginAddressByDaoId = {
    [gaugeDistributionsDemo.id]:
        '0xCCBe12eC0B50E14e62870BE41e6D9258b5D609c9' as `0x${string}`,
} satisfies Record<string, `0x${string}`>;
