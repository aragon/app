import { AssetInput } from '@/modules/finance/components/assetInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';
import { daoUtils } from '@/shared/utils/daoUtils';
import { AddressInput, addressUtils, type IAddressInputResolvedValue } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import type { ISetupStrategyForm, ISetupStrategyFormRouter } from '../setupStrategyDialogDefinitions';

export interface ISetupStrategyDialogDistributionGaugeProps {}

export const SetupStrategyDialogDistributionGauge: React.FC<ISetupStrategyDialogDistributionGaugeProps> = () => {
    const { t } = useTranslations();

    const daoId = useWatch<ISetupStrategyForm, 'sourceVault'>({ name: 'sourceVault' });
    const { network, address } = daoUtils.parseDaoId(daoId);

    const {
        onChange: onGaugeVoterAddressChange,
        value,
        ...gaugeVoterAddressField
    } = useFormField<ISetupStrategyFormRouter, 'distributionGauge.gaugeVoterAddress'>(
        'distributionGauge.gaugeVoterAddress',
        {
            label: t('app.capitalFlow.setupStrategyDialog.distributionGauge.gaugeVoterAddress.label'),
            rules: { required: true, validate: (value) => addressUtils.isAddress(value) },
        },
    );

    const [gaugeVoterAddressInput, setGaugeVoterAddressInput] = useState<string | undefined>(value);

    const handleAddressAccept = (value?: IAddressInputResolvedValue) => {
        onGaugeVoterAddressChange(value?.address ?? '');
    };

    const fetchAssetsParams = { queryParams: { address, network } };
    const { id: chainId } = networkDefinitions[network];

    return (
        <div className="flex w-full flex-col gap-6">
            <div className="flex flex-col gap-0.5 md:gap-1">
                <p className="text-base leading-tight font-normal text-neutral-800 md:text-lg">
                    {t('app.capitalFlow.setupStrategyDialog.distributionGauge.token.label')}
                </p>
                <p className="text-sm leading-normal font-normal text-neutral-500 md:text-base">
                    {t('app.capitalFlow.setupStrategyDialog.distributionGauge.token.helpText')}
                </p>
            </div>

            <AssetInput fetchAssetsParams={fetchAssetsParams} fieldPrefix="distributionGauge" hideAmount={true} />

            <AddressInput
                helpText={t('app.capitalFlow.setupStrategyDialog.distributionGauge.gaugeVoterAddress.helpText')}
                placeholder={t('app.capitalFlow.setupStrategyDialog.distributionGauge.gaugeVoterAddress.placeholder')}
                value={gaugeVoterAddressInput}
                onChange={setGaugeVoterAddressInput}
                onAccept={handleAddressAccept}
                chainId={chainId}
                {...gaugeVoterAddressField}
            />
        </div>
    );
};
