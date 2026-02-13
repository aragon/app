import dynamic from 'next/dynamic';

export const CapitalDistributorCreateCampaignActionCreate = dynamic(() =>
    import('./capitalDistributorCreateCampaignActionCreate').then(
        (mod) => mod.CapitalDistributorCreateCampaignActionCreate,
    ),
);

export type { ICapitalDistributorCreateCampaignActionCreateProps } from './capitalDistributorCreateCampaignActionCreate';

export {
    CampaignScheduleType,
    CapitalDistributorCreateCampaignActionCreateForm,
    type ICapitalDistributorCreateCampaignActionCreateFormProps,
    type ICapitalDistributorCreateCampaignFormData,
} from './capitalDistributorCreateCampaignActionCreateForm';
