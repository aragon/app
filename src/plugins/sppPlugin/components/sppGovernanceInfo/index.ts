import dynamic from 'next/dynamic';

export const SppGovernanceInfo = dynamic(() => import('./sppGovernanceInfo').then((mod) => mod.SppGovernanceInfo));
export type { ISppGovernanceInfoProps } from './sppGovernanceInfo';
