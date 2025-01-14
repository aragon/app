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
        <div className="flex flex-col gap-10">
            <RadioGroup onValueChange={onNetworkChange} {...networkField}>
                {Object.entries(networkDefinitions).map(([key, network]) => (
                    <RadioCard
                        tag={network.isTestnet ? testnetTag : undefined}
                        key={key}
                        value={key}
                        label={network.name}
                        avatar={network.logo}
                    />
                ))}
            </RadioGroup>
        </div>
    );
};
