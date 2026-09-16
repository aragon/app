# Treasury

Inspect an account's holdings and activity, prepare a direct transaction when authorized, or claim a reward allocation. The [account](../accounts/account.md) itself is [the vault](./vault.md): assets live on the DAO contract, whose execution capability lets it put those assets to use.

- [Vault](./vault.md) — why the account itself holds the assets.
- [Assets](./assets.md) — what shows as held (ERC-20s, tokenized DeFi positions), how the indexer knows, and where balances surface.
- [Transactions](./transactions.md) — deposits, withdrawals, and executions.
- [Create transaction](./create-transaction.md) — executing directly on the account, bypassing the governance processes, when the connected wallet holds execute permission.

- [Capital Distributor](./capital-distributor.md) — reward campaigns, recipient claims, and campaign management.

Cross-cutting: [linked accounts](../accounts/linked-account.md) — accounts whose treasuries sum into the dashboard total, and whose [assets](./assets.md) and [transactions](./transactions.md) can partition per account.
