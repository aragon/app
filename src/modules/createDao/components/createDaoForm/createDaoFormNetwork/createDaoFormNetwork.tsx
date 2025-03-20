import { Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';
import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import type { ICreateDaoFormData } from '../createDaoFormDefinitions';

export interface ICreateDaoFormNetworkProps {}

export const CreateDaoFormNetwork: React.FC<ICreateDaoFormNetworkProps> = () => {
    const { t } = useTranslations();

    const { onChange: onNetworkChange, ...networkField } = useFormField<ICreateDaoFormData, 'network'>('network', {
        rules: { required: true },
        defaultValue: Network.ETHEREUM_SEPOLIA,
    });

    const testnetTag = { variant: 'info' as const, label: t('app.createDao.createDaoForm.network.testnetLabel') };

    return (
        <RadioGroup onValueChange={onNetworkChange} {...networkField}>
            {Object.entries(networkDefinitions).map(([key, network]) => (
                <RadioCard
                    tag={network.testnet ? testnetTag : undefined}
                    key={key}
                    value={key}
                    label={network.disabled ? `${network.name} (Coming soon)` : network.name}
                    disabled={network.disabled}
                    avatar={network.logo}
                />
            ))}
        </RadioGroup>
    );
};
