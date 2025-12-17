import { AddressInput, addressUtils, type IAddressInputResolvedValue } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import { AssetInput } from '@/modules/finance/components/assetInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';
import { daoUtils } from '@/shared/utils/daoUtils';
import type { ISetupStrategyForm, ISetupStrategyFormRouter } from '../setupStrategyDialogDefinitions';

export const SetupStrategyDialogDistributionGauge: React.FC = () => {
    const { t } = useTranslations();

    const daoId = useWatch<ISetupStrategyForm, 'sourceVault'>({
        name: 'sourceVault',
    });
    const { network } = daoUtils.parseDaoId(daoId);

    const {
        onChange: onGaugeVoterAddressChange,
        value,
        ...gaugeVoterAddressField
    } = useFormField<ISetupStrategyFormRouter, 'distributionGauge.gaugeVoterAddress'>('distributionGauge.gaugeVoterAddress', {
        label: t('app.capitalFlow.setupStrategyDialog.distributionGauge.gaugeVoterAddress.label'),
        rules: {
            required: true,
            validate: (value) => addressUtils.isAddress(value),
        },
    });

    const [gaugeVoterAddressInput, setGaugeVoterAddressInput] = useState<string | undefined>(value);

    const handleAddressAccept = (value?: IAddressInputResolvedValue) => {
        onGaugeVoterAddressChange(value?.address ?? '');
    };

    const fetchAssetsParams = { queryParams: { daoId } };
    const { id: chainId } = networkDefinitions[network];

    return (
        <div className="flex w-full flex-col gap-6">
            <div className="flex flex-col gap-0.5 md:gap-1">
                <p className="font-normal text-base text-neutral-800 leading-tight md:text-lg">
                    {t('app.capitalFlow.setupStrategyDialog.distributionGauge.token.label')}
                </p>
                <p className="font-normal text-neutral-500 text-sm leading-normal md:text-base">
                    {t('app.capitalFlow.setupStrategyDialog.distributionGauge.token.helpText')}
                </p>
            </div>

            <AssetInput fetchAssetsParams={fetchAssetsParams} fieldPrefix="distributionGauge" hideAmount={true} />

            <AddressInput
                chainId={chainId}
                helpText={t('app.capitalFlow.setupStrategyDialog.distributionGauge.gaugeVoterAddress.helpText')}
                onAccept={handleAddressAccept}
                onChange={setGaugeVoterAddressInput}
                placeholder={t('app.capitalFlow.setupStrategyDialog.distributionGauge.gaugeVoterAddress.placeholder')}
                value={gaugeVoterAddressInput}
                {...gaugeVoterAddressField}
            />
        </div>
    );
};
