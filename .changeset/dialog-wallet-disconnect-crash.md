---
"@aragon/app": patch
---

Fix the application crashing when the wallet disconnects while a transaction dialog is open. Wallet-requiring dialogs assert a connected address during render, so a disconnect made them throw with no error boundary above the dialog layer, unmounting the whole application. Dialog definitions now carry a `requiresWallet` flag and `DialogRoot` unmounts and closes flagged dialogs on disconnect before they can re-render without an address. Connector switches are unaffected: while reconnecting, dialogs are only hidden and restored once the address returns.
