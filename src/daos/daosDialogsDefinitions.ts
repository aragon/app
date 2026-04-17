import { tokenRewardDialogsDefinitions } from './cryptex/constants/cryptexDialogsDefinitions';
import { katanaDialogsDefinitions } from './katana/constants/katanaDialogsDefinitions';
import { statusDialogsDefinitions } from './status/constants/statusDialogsDefinitions';

export const daosDialogsDefinitions = {
    ...katanaDialogsDefinitions,
    ...statusDialogsDefinitions,
    ...tokenRewardDialogsDefinitions,
};
