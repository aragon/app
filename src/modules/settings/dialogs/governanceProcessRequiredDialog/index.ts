import dynamic from 'next/dynamic';

export const GovernanceProcessRequiredDialog = dynamic(() =>
    import('./governanceProcessRequiredDialog').then((mod) => mod.GovernanceProcessRequiredDialog),
);
export type {
    IGovernanceProcessRequiredDialogParams,
    IGovernanceProcessRequiredDialogProps,
} from './governanceProcessRequiredDialog';
