import dynamic from 'next/dynamic';
import type { IPermissionsGraphProps } from './permissionsGraph';

export type { IPermissionsGraphProps };

export const PermissionsGraph = dynamic<IPermissionsGraphProps>(() =>
    import('./permissionsGraph').then((module) => module.PermissionsGraph),
);
