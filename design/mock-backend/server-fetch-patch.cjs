'use strict';
// Preloaded into the Next.js server (NODE_OPTIONS=--require) to fake Pinata IPFS pinning, which is unreachable here.
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
    const url =
        typeof input === 'string' ? input : (input?.url ?? String(input));
    if (url.startsWith('https://api.pinata.cloud/')) {
        return new Response(
            JSON.stringify({
                IpfsHash:
                    'bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku',
                PinSize: 1024,
                Timestamp: new Date().toISOString(),
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
        );
    }
    return realFetch(input, init);
};
