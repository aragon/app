'use client';

import {
    addressUtils,
    InputContainer,
    RadioCard,
    RadioGroup,
} from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';
import type { IGaugeVoterPlugin } from '@/plugins/gaugeVoterPlugin/types';
import { PluginInterfaceType } from '@/shared/api/daoService/domain/enum/pluginInterfaceType';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { useFormField } from '@/shared/hooks/useFormField';
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
     * DAO ID to check for gauge voter plugin availability.
     */
    daoId: string;
}

export const CapitalDistributorCampaignPayoutField: React.FC<
    ICapitalDistributorCampaignPayoutFieldProps
> = (props) => {
    const { fieldPrefix, daoId } = props;
    const { t } = useTranslations();

    const gaugeVoterPlugins = useDaoPlugins({
        daoId,
        interfaceType: PluginInterfaceType.GAUGE_VOTER,
        includeSubDaos: false,
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

    const selectedAsset = useWatch<
        Record<string, ICapitalDistributorCreateCampaignFormData['asset']>
    >({
        name: `${fieldPrefix}.asset`,
    });

    const gaugePlugin = gaugeVoterPlugins?.[0]?.meta as
        | IGaugeVoterPlugin
        | undefined;

    const gaugeVoterPluginFound = gaugePlugin != null;

    const tokenMismatch =
        gaugeVoterPluginFound &&
        selectedAsset?.token?.address != null &&
        !addressUtils.isAddressEqual(
            selectedAsset.token.address,
            gaugePlugin.votingEscrow.underlying,
        );

    const showError =
        payoutType === CampaignPayoutType.VE_LOCK_ENCODER &&
        (!gaugeVoterPluginFound || tokenMismatch);

    const errorMessage = t(
        `app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.payout.error.${tokenMismatch ? 'tokenMismatch' : 'noGaugeVoter'}`,
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
