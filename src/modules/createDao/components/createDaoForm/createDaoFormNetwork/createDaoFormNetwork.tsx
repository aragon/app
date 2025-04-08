import { Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';
import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import type { ICreateDaoFormData } from '../createDaoFormDefinitions';

export interface ICreateDaoFormNetworkProps {}

const optimismMainnet = {
    name: 'Optimism',
    logo: 'https://assets.coingecko.com/coins/images/25244/large/Optimism.png',
    disabled: true,
    testnet: false,
    order: 9,
};

export const CreateDaoFormNetwork: React.FC<ICreateDaoFormNetworkProps> = () => {
    const { t } = useTranslations();

    const { onChange: onNetworkChange, ...networkField } = useFormField<ICreateDaoFormData, 'network'>('network', {
        rules: { required: true },
        defaultValue: Network.ETHEREUM_SEPOLIA,
    });

    const testnetTag = { variant: 'info' as const, label: t('app.createDao.createDaoForm.network.testnetLabel') };
    const disabledTag = { variant: 'info' as const, label: t('app.createDao.createDaoForm.network.disabledLabel') };

    const sortedNetworks = Object.entries({ ...networkDefinitions, 'optimism-mainnet': optimismMainnet }).sort(
        ([, networkA], [, networkB]) => networkA.order - networkB.order,
    );

    return (
        <RadioGroup onValueChange={onNetworkChange} {...networkField}>
            {sortedNetworks.map(([key, networkListData]) => (
                <RadioCard
                    key={key}
                    tag={networkListData.disabled ? disabledTag : networkListData.testnet ? testnetTag : undefined}
                    value={key}
                    label={networkListData.name}
                    disabled={networkListData.disabled}
                    avatar={networkListData.logo}
                />
            ))}
        </RadioGroup>
    );
};
