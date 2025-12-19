import dynamic from 'next/dynamic';

export const AdminGovernanceInfo = dynamic(() =>
    import('./adminGovernanceInfo').then((mod) => mod.AdminGovernanceInfo),
);
export type { IAdminGovernanceInfoProps } from './adminGovernanceInfo';
