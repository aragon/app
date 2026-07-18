import { GukModulesProvider, ProposalActionWithdrawToken, ProposalActionType } from '@aragon/gov-ui-kit';

const baseAction = {
    from: '0x25716fB10298638eD386A5A5dD2E9233D213F442',
    to: '0xC8da4C1d9BB59DD32ac39A925933188b7c66c311',
    data: '',
    value: '0',
    inputData: null,
};

const usdcLogo =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='32' fill='%232775CA'/%3E%3Ctext x='32' y='42' font-family='Arial' font-size='30' font-weight='bold' fill='white' text-anchor='middle'%3E%24%3C/text%3E%3C/svg%3E";
const ethLogo =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='32' fill='%23627EEA'/%3E%3Cpath d='M32 10 L32 34 L46 32 Z' fill='white' opacity='0.8'/%3E%3Cpath d='M32 10 L18 32 L32 34 Z' fill='white'/%3E%3Cpath d='M32 38 L18 35 L32 54 L46 35 Z' fill='white' opacity='0.9'/%3E%3C/svg%3E";

export const StablecoinTransfer = () => (
    <GukModulesProvider>
        <ProposalActionWithdrawToken
            action={{
                ...baseAction,
                type: ProposalActionType.WITHDRAW_TOKEN,
                sender: { address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', name: 'Patito DAO Treasury' },
                receiver: { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', name: 'grants.patito.eth' },
                token: {
                    name: 'USD Coin',
                    symbol: 'USDC',
                    logo: usdcLogo,
                    priceUsd: '1.00',
                    decimals: 6,
                    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                },
                amount: '50000',
            }}
            index={0}
        />
    </GukModulesProvider>
);

export const EthTransfer = () => (
    <GukModulesProvider>
        <ProposalActionWithdrawToken
            action={{
                ...baseAction,
                type: ProposalActionType.WITHDRAW_TOKEN,
                sender: { address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
                receiver: { address: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936F0bE' },
                token: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    logo: ethLogo,
                    priceUsd: '3421.55',
                    decimals: 18,
                    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
                },
                amount: '12.5',
            }}
            index={1}
        />
    </GukModulesProvider>
);
