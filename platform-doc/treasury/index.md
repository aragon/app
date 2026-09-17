# Treasury

What the account holds and how the app shows it. The load-bearing fact: the [account](../accounts/account.md) itself is [the vault](./vault.md) — assets live on the DAO contract, and its ability to execute arbitrary actions is what makes the treasury actionable.

- [Vault](./vault.md) — why the account itself holds the assets.
- [Assets](./assets.md) — what shows as held (ERC-20s, tokenized DeFi positions), how the indexer knows, and where balances surface.
- [Transactions](./transactions.md) — deposits, withdrawals, and executions.
- [Create transaction](./create-transaction.md) — executing directly on the account, bypassing the governance processes, when the connected wallet holds execute permission.

Cross-cutting: [linked accounts](../accounts/linked-account.md) — accounts whose treasuries sum into the dashboard total, and whose [assets](./assets.md) and [transactions](./transactions.md) can partition per account.
