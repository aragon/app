import { Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { INetworkDefinition, networkDefinitions } from '@/shared/constants/networkDefinitions';
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
    const disabledTag = { variant: 'info' as const, label: t('app.createDao.createDaoForm.network.disabledLabel') };

    const enabledNetworkEntries = Object.entries(networkDefinitions).filter(([, network]) => !network.disabled);
    const disabledNetworkEntries = Object.entries(networkDefinitions).filter(([, network]) => network.disabled);

    const getNetworkTag = (network: INetworkDefinition) => {
        if (network.disabled) {
            return disabledTag;
        }

        if (network.testnet) {
            return testnetTag;
        }

        return undefined;
    };

    return (
        <RadioGroup onValueChange={onNetworkChange} {...networkField}>
            {[...enabledNetworkEntries, ...disabledNetworkEntries].map(([key, network]) => {
                return (
                    <RadioCard
                        tag={getNetworkTag(network)}
                        key={key}
                        value={key}
                        label={network.name}
                        disabled={network.disabled}
                        avatar={network.logo}
                    />
                );
            })}
        </RadioGroup>
    );
};
