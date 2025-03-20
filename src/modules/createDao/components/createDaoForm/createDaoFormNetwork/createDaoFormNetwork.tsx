import { Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { futureNetworks, networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';
import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import type { ICreateDaoFormData } from '../createDaoFormDefinitions';

interface INetworkListData {
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

    const enabledNetworksListData: INetworkListData[] = Object.entries(networkDefinitions)
        .filter(([, network]) => !network.disabled)
        .map(([key, network]) => ({
            key,
            name: network.name,
            logo: network.logo,
            testnet: network.testnet,
        }));
    const disabledNetworksListData = Object.entries(networkDefinitions)
        .filter(([, network]) => network.disabled)
        .map(([key, network]) => ({
            key,
            name: network.name,
            logo: network.logo,
            testnet: network.testnet,
            disabled: true,
        }));
    const futureNetworksListData = Object.entries(futureNetworks).map(([key, network]) => ({
        key,
        name: network.name,
        logo: network.logo,
        testnet: network.testnet,
        disabled: true,
    }));

    const getNetworkTag = (network: INetworkListData) => {
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
            {[...enabledNetworksListData, ...futureNetworksListData, ...disabledNetworksListData].map(
                (networkListData) => (
                    <RadioCard
                        tag={getNetworkTag(networkListData)}
                        key={networkListData.key}
                        value={networkListData.key}
                        label={networkListData.name}
                        disabled={networkListData.disabled}
                        avatar={networkListData.logo}
                    />
                ),
            )}
        </RadioGroup>
    );
};
