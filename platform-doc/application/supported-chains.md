---
type: reference
title: Supported chains
tags: [cross-cutting, accounts]
status: draft
source: product-owner supported-chain inventory commission (2026-09-10, see log.md)
chain_source: "https://github.com/aragon/app/blob/adad67873c8f9dd75e3ed340b70df3e985ae3557/apps/app/src/shared/constants/networkDefinitions.ts"
chain_release: "@aragon/app@1.39.0"
chain_viem: "2.55.19"
---

# Supported chains

Supported chains are the blockchain networks available in the Aragon platform. Each [account](../accounts/account.md) belongs to one chain; [account creation](../accounts/account-creation.md) selects that deployment network before its metadata and governance are configured.

Mainnets host production accounts. Testnets support trial accounts; the account-creation flow recommends Ethereum Sepolia before a first production launch.

<!-- supported-chains:start -->
| Chain | Chain ID | Network type | Account creation | Action simulation | Explorer |
| --- | --- | --- | --- | --- | --- |
| Arbitrum | 42161 | Mainnet | Available | Available | [Arbiscan](<https://arbiscan.io>) |
| Avalanche | 43114 | Mainnet | Available | Available | [SnowTrace](<https://snowtrace.io>) |
| Base | 8453 | Mainnet | Available | Available | [Basescan](<https://basescan.org>) |
| Chiliz | 88888 | Mainnet | Available | Unavailable | [Chiliz Explorer](<https://scan.chiliz.com>) |
| Citrea | 4114 | Mainnet | Available | Unavailable | [Citrea Explorer](<https://explorer.mainnet.citrea.xyz>) |
| Ethereum | 1 | Mainnet | Available | Available | [Etherscan](<https://etherscan.io>) |
| Hemi | 43111 | Mainnet | Available | Unavailable | [blockscout](<https://explorer.hemi.xyz>) |
| Katana | 747474 | Mainnet | Available | Available | [katana explorer](<https://katanascan.com>) |
| Monad | 143 | Mainnet | Available | Available | [Monadscan](<https://monadscan.com>) |
| Optimism | 10 | Mainnet | Available | Available | [Optimism Explorer](<https://optimistic.etherscan.io>) |
| Polygon | 137 | Mainnet | Available | Available | [PolygonScan](<https://polygonscan.com>) |
| Robinhood Chain | 4663 | Mainnet | Available | Available | [Blockscout](<https://robinhoodchain.blockscout.com>) |
| zkSync | 324 | Mainnet | Available | Available | [ZKsync Explorer](<https://explorer.zksync.io/>) |
| Ethereum Sepolia | 11155111 | Testnet | Available | Available | [Etherscan](<https://sepolia.etherscan.io>) |
<!-- supported-chains:end -->

Account creation and [action simulation](./action-simulation.md) have separate availability. Simulation uses Tenderly and requires the app's simulation support for the selected chain.

[Explore](./explore-page.md) shows mainnet accounts in **All accounts** and includes testnet accounts in **Member** when the connected wallet has a qualifying [membership](../governance/member.md#membership-and-participation). [Cross-chain execution](../governance/cross-chain-execution.md) requires a compatible controller and a configured route for the account's deployment; the destination picker follows those routes.
