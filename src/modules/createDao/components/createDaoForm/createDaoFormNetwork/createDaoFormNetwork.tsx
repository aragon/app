import { Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';
import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import type { ICreateDaoFormData } from '../createDaoFormDefinitions';

interface INetworkListItem {
    key: string;
    name: string;
    logo: string;
    disabled?: boolean;
    testnet?: boolean;
}

export interface ICreateDaoFormNetworkProps {}

export const CreateDaoFormNetwork: React.FC<ICreateDaoFormNetworkProps> = () => {
    const { t } = useTranslations();

    const { onChange: onNetworkChange, ...networkField } = useFormField<ICreateDaoFormData, 'network'>('network', {
        rules: { required: true },
        defaultValue: Network.ETHEREUM_SEPOLIA,
    });

    const testnetTag = { variant: 'info' as const, label: t('app.createDao.createDaoForm.network.testnetLabel') };
    const disabledTag = { variant: 'info' as const, label: t('app.createDao.createDaoForm.network.disabledLabel') };

    const enabledNetworksListItems: INetworkListItem[] = [];
    const disabledNetworksListItems: INetworkListItem[] = [];

    for (const [key, network] of Object.entries(networkDefinitions)) {
        const networkListItem: INetworkListItem = {
            key,
            name: network.name,
            logo: network.logo,
            testnet: network.testnet,
            disabled: network.disabled,
        };

        if (network.disabled) {
            disabledNetworksListItems.push(networkListItem);
        } else {
            enabledNetworksListItems.push(networkListItem);
        }
    }

    disabledNetworksListItems.push({
        key: 'optimism-mainnet',
        name: 'Optimism',
        logo: 'https://assets.coingecko.com/coins/images/25244/large/Optimism.png',
        disabled: true,
    });

    return (
        <RadioGroup onValueChange={onNetworkChange} {...networkField}>
            {[...enabledNetworksListItems, ...disabledNetworksListItems].map((networkListData) => (
                <RadioCard
                    tag={networkListData.disabled ? disabledTag : networkListData.testnet ? testnetTag : undefined}
                    key={networkListData.key}
                    value={networkListData.key}
                    label={networkListData.name}
                    disabled={networkListData.disabled}
                    avatar={networkListData.logo}
                />
            ))}
        </RadioGroup>
    );
};
