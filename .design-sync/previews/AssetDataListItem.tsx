import { AssetDataListItem, GukModulesProvider } from '@aragon/gov-ui-kit';

const usdcLogo =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%232775CA'/><text x='32' y='42' font-family='Arial' font-size='28' font-weight='bold' fill='white' text-anchor='middle'>$</text></svg>";

export const Default = () => (
    <GukModulesProvider>
        <AssetDataListItem.Structure
            amount={250_000}
            fiatPrice={1}
            name="USD Coin"
            symbol="USDC"
        />
    </GukModulesProvider>
);

export const TreasuryList = () => (
    <GukModulesProvider>
        <div className="flex w-full flex-col gap-3">
            <AssetDataListItem.Structure
                amount={250_000}
                fiatPrice={1}
                logoSrc={usdcLogo}
                name="USD Coin"
                symbol="USDC"
            />
            <AssetDataListItem.Structure
                amount={86.4}
                fiatPrice={3421.55}
                name="Ethereum"
                symbol="ETH"
            />
            <AssetDataListItem.Structure
                amount={1_200_000}
                fiatPrice={0.82}
                name="Aragon"
                symbol="ANT"
            />
        </div>
    </GukModulesProvider>
);

export const HiddenValue = () => (
    <GukModulesProvider>
        <AssetDataListItem.Structure
            amount={512}
            hideValue={true}
            name="Governance NFT"
            symbol="GOV"
        />
    </GukModulesProvider>
);

export const Loading = () => (
    <GukModulesProvider>
        <AssetDataListItem.Skeleton />
    </GukModulesProvider>
);
