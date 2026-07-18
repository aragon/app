import { AssetTransfer, GukModulesProvider } from '@aragon/gov-ui-kit';

export const Default = () => (
    <GukModulesProvider>
        <AssetTransfer
            assetAddress="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
            assetAmount={50000}
            assetFiatPrice={1}
            assetName="USD Coin"
            assetSymbol="USDC"
            recipient={{ address: '0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786', name: 'grants.eth' }}
            sender={{ address: '0x17C6808fA04DC9de98eaCfeb4c66B352067c1cDD', name: 'treasury.dao.eth' }}
        />
    </GukModulesProvider>
);

export const NativeTransfer = () => (
    <GukModulesProvider>
        <AssetTransfer
            assetAddress="0x0000000000000000000000000000000000000000"
            assetAmount={12.5}
            assetFiatPrice={3421.55}
            assetName="Ethereum"
            assetSymbol="ETH"
            recipient={{ address: '0xd5fb864ACfD6BB2f72939f122e89fF7F475924f5' }}
            sender={{ address: '0x02782C0b47DcCd8b74a5f0Cc4dA6a68e00a4e0a8' }}
        />
    </GukModulesProvider>
);

export const TokenPayout = () => (
    <GukModulesProvider>
        <AssetTransfer
            assetAddress="0xa117000000f279D81A1D3cc75430fAA017FA5A2e"
            assetAmount={75000}
            assetFiatPrice={0.82}
            assetName="Aragon"
            assetSymbol="ANT"
            recipient={{ address: '0x17366cae2b9c6C3055e9e3C78936a69006BE5409', name: 'builder.eth' }}
            sender={{ address: '0x02782C0b47DcCd8b74a5f0Cc4dA6a68e00a4e0a8', name: 'patito.dao.eth' }}
        />
    </GukModulesProvider>
);
