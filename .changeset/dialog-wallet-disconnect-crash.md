---
"@aragon/app": patch
---

Fix the application crashing when the wallet disconnects while a transaction dialog is open. Wallet-requiring dialogs read a connected address during render, so a disconnect made them throw with no error boundary above the dialog layer, unmounting the whole application. Dialog definitions now carry a `requiresWallet` flag and `DialogRoot` unmounts and closes flagged dialogs on disconnect before they can re-render without an address. Connector switches do not close dialogs: while the wallet is connecting or reconnecting the dialog is only hidden, and it reappears once the address returns. It does remount, so state held inside the dialog (form inputs, transaction step) is reset.
