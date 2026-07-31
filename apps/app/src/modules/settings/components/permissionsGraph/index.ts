import dynamic from 'next/dynamic';

export type { IPermissionsGraphProps } from './permissionsGraph';

export const PermissionsGraph = dynamic(() =>
    import('./permissionsGraph').then((mod) => mod.PermissionsGraph),
);
