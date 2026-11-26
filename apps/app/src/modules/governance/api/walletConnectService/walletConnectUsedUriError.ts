/**
 * The connection URI was already paired, so its dApp will not send another session proposal and a new URI is needed.
 */
export class WalletConnectUsedUriError extends Error {
    constructor() {
        super('WalletConnect URI was already used');
    }
}
