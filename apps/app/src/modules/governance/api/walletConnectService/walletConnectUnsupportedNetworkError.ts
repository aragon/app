/**
 * The dApp proposed a session that cannot be served on the connected account's network, e.g. because it requires a
 * different chain.
 */
export class WalletConnectUnsupportedNetworkError extends Error {
    constructor() {
        super('dApp does not support the network of the connected account');
    }
}
