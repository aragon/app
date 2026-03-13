import { tokenRewardDialogsDefinitions } from './cryptex/constants/cryptexDialogsDefinitions';
import { gaugeRewardDialogsDefinitions } from './katana/constants/capitalDistributorTestDialogsDefinitions';

export const daosDialogsDefinitions = {
    ...gaugeRewardDialogsDefinitions,
    ...tokenRewardDialogsDefinitions,
};
