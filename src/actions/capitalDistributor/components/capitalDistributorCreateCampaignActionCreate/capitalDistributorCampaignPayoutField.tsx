'use client';

import { InputContainer, RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';
import type { Hex } from 'viem';
import { CapitalFlowDaoSlotId } from '@/modules/capitalFlow/constants/moduleDaoSlots';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { useSlotSingleFunction } from '@/shared/hooks/useSlotSingleFunction';
import {
    CampaignPayoutType,
    type ICapitalDistributorCreateCampaignFormData,
} from './capitalDistributorCreateCampaignActionCreateForm';

export interface ICapitalDistributorCampaignPayoutFieldProps {
    /**
     * Prefix for form fields.
     */
    fieldPrefix: string;
    /**
     * DAO ID to resolve the voting escrow address via slot function.
     */
    daoId: string;
}

export const CapitalDistributorCampaignPayoutField: React.FC<
    ICapitalDistributorCampaignPayoutFieldProps
> = (props) => {
    const { fieldPrefix, daoId } = props;
    const { t } = useTranslations();

    const escrowAddress = useSlotSingleFunction<void, Hex | undefined>({
        slotId: CapitalFlowDaoSlotId.CAPITAL_DISTRIBUTOR_VOTING_ESCROW_ADDRESS,
        pluginId: daoId,
        params: undefined,
    });

    const { onChange, ...payoutTypeField } = useFormField<
        ICapitalDistributorCreateCampaignFormData,
        'payoutType'
    >('payoutType', {
        fieldPrefix,
        defaultValue: CampaignPayoutType.DEFAULT,
    });

    const payoutType = useWatch<
        Record<string, ICapitalDistributorCreateCampaignFormData['payoutType']>
    >({
        name: `${fieldPrefix}.payoutType`,
    });

    const showError =
        payoutType === CampaignPayoutType.VE_LOCK_ENCODER &&
        escrowAddress == null;

    const errorMessage = t(
        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.payout.error.noEscrowAddress',
    );

    return (
        <InputContainer
            alert={
                showError
                    ? { message: errorMessage, variant: 'warning' }
                    : undefined
            }
            helpText={t(
                'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.payout.helpText',
            )}
            id="campaignPayoutType"
            label={t(
                'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.payout.label',
            )}
            useCustomWrapper={true}
        >
            <RadioGroup
                className="flex w-full gap-4 md:flex-row!"
                onValueChange={onChange}
                {...payoutTypeField}
            >
                <RadioCard
                    description={t(
                        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.payout.default.description',
                    )}
                    label={t(
                        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.payout.default.label',
                    )}
                    value={CampaignPayoutType.DEFAULT}
                />
                <RadioCard
                    description={t(
                        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.payout.veLockEncoder.description',
                    )}
                    label={t(
                        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.payout.veLockEncoder.label',
                    )}
                    value={CampaignPayoutType.VE_LOCK_ENCODER}
                />
            </RadioGroup>
        </InputContainer>
    );
};
