import dynamic from 'next/dynamic';

export const GaugeDistributionsMembersFileDownloadDialog = dynamic(() =>
    import('./gaugeDistributionsMembersFileDownloadDialog').then(
        (mod) => mod.GaugeDistributionsMembersFileDownloadDialog,
    ),
);

export type { IGaugeDistributionsMembersFileDownloadDialogParams } from './gaugeDistributionsMembersFileDownloadDialog';
