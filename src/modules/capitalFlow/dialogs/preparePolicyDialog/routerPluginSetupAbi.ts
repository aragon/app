export const routerPluginSetupAbi = [
    { name: '_routerSource', type: 'address' },
    { name: '_isStreamingSource', type: 'bool' },
    { name: '_routerModel', type: 'address' },
] as const;

export const burnRouterPluginSetupAbi = [
    { name: '_routerSource', type: 'address' },
    { name: '_isStreamingSource', type: 'bool' },
] as const;

export const cowSwapRouterPluginSetupAbi = [
    { name: '_routerSource', type: 'address' },
    { name: '_isStreamingSource', type: 'bool' },
    { name: '_targetToken', type: 'address' },
    { name: '_cowSwapSettlement', type: 'address' },
] as const;

export const multiDispatchPluginSetupAbi = [{ name: '_subrouters', type: 'address[]' }] as const;

export const uniswapRouterPluginSetupAbi = [
    { name: '_routerSource', type: 'address' },
    { name: '_isStreamingSource', type: 'bool' },
    { name: '_targetToken', type: 'address' },
    { name: '_uniswapRouter', type: 'address' },
] as const;
