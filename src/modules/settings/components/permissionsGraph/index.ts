import dynamic from 'next/dynamic';

export const PermissionsGraph = dynamic(
    () => import('./permissionsGraph').then((mod) => mod.PermissionsGraph),
    { ssr: false },
);

export type { IPermissionsGraphProps } from './permissionsGraph';
