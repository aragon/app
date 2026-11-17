'use strict';
// Init script injecting a mock EIP-1193 wallet (EIP-6963 + window.ethereum, shown as MetaMask) holding one account.
// opts.connected === false: the account is only handed out once the user connects. Signing never completes.
module.exports = (address, opts = {}) => `(() => {
  const ACCOUNT = '${address}';
  let authorized = ${opts.connected === false ? 'false' : 'true'};
  const listeners = {};
  let chainId = '0x1';
  let rpcId = 1;
  const provider = {
    isMetaMask: true,
    _events: {},
    on(e, f) { (listeners[e] = listeners[e] || []).push(f); return provider; },
    removeListener(e, f) { listeners[e] = (listeners[e] || []).filter((x) => x !== f); return provider; },
    async request({ method, params }) {
      switch (method) {
        case 'eth_accounts': return authorized ? [ACCOUNT] : [];
        case 'eth_requestAccounts': authorized = true; return [ACCOUNT];
        case 'eth_chainId': return chainId;
        case 'net_version': return String(parseInt(chainId, 16));
        case 'wallet_switchEthereumChain': chainId = params[0].chainId; (listeners.chainChanged || []).forEach((f) => f(chainId)); return null;
        case 'wallet_addEthereumChain': return null;
        case 'wallet_requestPermissions': case 'wallet_getPermissions': return [{ parentCapability: 'eth_accounts' }];
        case 'personal_sign': case 'eth_signTypedData_v4': return '0x' + '11'.repeat(65);
        case 'eth_sendTransaction': return new Promise(() => {});
        default: {
          const r = await fetch('/api/rpc/' + parseInt(chainId, 16), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: rpcId++, method, params }) });
          const j = await r.json();
          if (j.error) throw j.error;
          return j.result;
        }
      }
    },
  };
  window.ethereum = provider;
  const info = { uuid: '8f0c2b1e-0000-4000-8000-000000000001', name: 'MetaMask', icon: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" rx="8" fill="#F6851B"/></svg>'), rdns: 'io.metamask' };
  const announce = () => window.dispatchEvent(new CustomEvent('eip6963:announceProvider', { detail: Object.freeze({ info, provider }) }));
  window.addEventListener('eip6963:requestProvider', announce);
  announce();
})();`;
