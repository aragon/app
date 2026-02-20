---
"@aragon/app": minor
---

Upgrade wagmi from v2.19.5 to v3.4.2, update viem to 2.45.2, and remove all v3 deprecations

- **wagmi v3**: Connector dependencies are now optional peer dependencies, giving more control over the dependency tree
- **Removed overrides**: Eliminated `@reown/appkit` version override and `@wagmi/connectors` pin that are no longer needed
- **useBalance migration**: Replaced deprecated `useBalance({ token })` with `useReadContract({ abi: erc20Abi, functionName: 'balanceOf' })` for ERC20 token balance fetching
- **Import path optimization**: Moved chain definitions from `wagmi/chains` to `viem/chains` (the canonical source)
- **useAccount → useConnection**: Migrated all `useAccount` hook usage to the new `useConnection` hook across ~60 files
- **mutateFn rename**: Replaced deprecated `sendTransaction`/`switchChain` destructured names with `mutate` in `useSendTransaction` and `useSwitchChain` hooks
- **Test updates**: Updated all test mocks and type references to use `useConnection` and `UseConnectionReturnType`
