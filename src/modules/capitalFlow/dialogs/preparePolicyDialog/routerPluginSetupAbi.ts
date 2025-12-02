export const routerPluginSetupAbi = [
    { name: '_routerSource', type: 'address' },
    { name: '_isStreamingSource', type: 'bool' },
    { name: '_routerModel', type: 'address' },
] as const;

export const burnRouterPluginSetupAbi = [
    { name: '_routerSource', type: 'address' },
    { name: '_isStreamingSource', type: 'bool' },
] as const;
