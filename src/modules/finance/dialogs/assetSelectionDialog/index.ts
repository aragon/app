import dynamic from 'next/dynamic';

export const PublishProposalDialog = dynamic(() =>
    import('./assetSelectionDialog').then((mod) => mod.AssetSelectionDialog),
);
export type { IAssetSelectionDialogParams, IAssetSelectionDialogProps } from './assetSelectionDialog';
