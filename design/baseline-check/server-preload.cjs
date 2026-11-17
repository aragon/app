'use strict';
// Preloaded into the Next.js server (NODE_OPTIONS=--require, see start.sh) so that it renders without the network
// and at the reference time:
// - the app-cms files are answered from ./cms, Pinata IPFS pinning is faked, the Safe transaction service is forwarded
//   to the mock backend, and any other request to a host that is not this machine is refused (as the capture scripts
//   do in the browser);
// - Date is frozen at the reference time, like the browser clock of the capture, so the server-rendered HTML shows
//   the same dates and proposal states as the page that hydrates it.
const fs = require('node:fs');
const path = require('node:path');
const { CMS_PREFIX, PINATA_REPLY, NOW_MS, MOCK_PORT } = require('./lib.cjs');

const SAFE_TX_SERVICE = 'https://api.safe.global/tx-service/';

const RealDate = Date;
globalThis.Date = new Proxy(RealDate, {
    construct: (target, args, newTarget) =>
        Reflect.construct(target, args.length > 0 ? args : [NOW_MS], newTarget),
    apply: () => new RealDate(NOW_MS).toString(),
    get: (target, key) =>
        key === 'now' ? () => NOW_MS : Reflect.get(target, key),
});

const realFetch = globalThis.fetch;
const reply = (status, body) =>
    Promise.resolve(
        new Response(body, {
            status,
            headers: { 'content-type': 'application/json' },
        }),
    );

globalThis.fetch = (input, init) => {
    const url = String(input?.url ?? input);
    if (url.startsWith(CMS_PREFIX)) {
        const file = path.join(
            __dirname,
            'cms',
            path.basename(new URL(url).pathname),
        );
        return fs.existsSync(file)
            ? reply(200, fs.readFileSync(file))
            : reply(404, '{}');
    }
    if (url.startsWith('https://api.pinata.cloud/')) {
        return reply(200, JSON.stringify(PINATA_REPLY));
    }
    if (url.startsWith(SAFE_TX_SERVICE)) {
        // The app's /api/safe proxy has no URL override; its upstream is answered by the mock backend.
        return realFetch(
            `http://localhost:${MOCK_PORT}/tx-service/${url.slice(SAFE_TX_SERVICE.length)}`,
            init,
        );
    }
    if (!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url)) {
        return Promise.reject(
            new TypeError(`fetch refused by the baseline check: ${url}`),
        );
    }
    return realFetch(input, init);
};
