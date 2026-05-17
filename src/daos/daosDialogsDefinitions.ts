import { tokenRewardDialogsDefinitions } from './cryptex/constants/cryptexDialogsDefinitions';
import { gaugeDistributionsDialogsDefinitions } from './gaugeDistributions/constants/gaugeDistributionsDialogsDefinitions';
import { katanaDialogsDefinitions } from './katana/constants/katanaDialogsDefinitions';

export const daosDialogsDefinitions = {
    ...gaugeDistributionsDialogsDefinitions,
    ...katanaDialogsDefinitions,
    ...tokenRewardDialogsDefinitions,
};
