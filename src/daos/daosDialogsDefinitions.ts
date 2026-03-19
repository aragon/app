import { tokenRewardDialogsDefinitions } from './cryptex/constants/cryptexDialogsDefinitions';
import { katanaDialogsDefinitions } from './katana/constants/katanaDialogsDefinitions';

export const daosDialogsDefinitions = {
    ...katanaDialogsDefinitions,
    ...tokenRewardDialogsDefinitions,
};
