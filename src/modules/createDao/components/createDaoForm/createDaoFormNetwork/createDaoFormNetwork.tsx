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
    beta: false,
    order: 9,
};

export const CreateDaoFormNetwork: React.FC<ICreateDaoFormNetworkProps> = () => {
    const { t } = useTranslations();

    const { onChange: onNetworkChange, ...networkField } = useFormField<ICreateDaoFormData, 'network'>('network', {
        rules: { required: true },
        defaultValue: Network.ETHEREUM_SEPOLIA,
    });

    const testnetTag = { variant: 'neutral' as const, label: t('app.createDao.createDaoForm.network.tag.testnet') };
    const disabledTag = { variant: 'info' as const, label: t('app.createDao.createDaoForm.network.tag.disabled') };
    const betaTag = { variant: 'info' as const, label: t('app.createDao.createDaoForm.network.tag.beta') };

    const sortedNetworks = Object.entries({ ...networkDefinitions, 'optimism-mainnet': optimismMainnet }).sort(
        ([, networkA], [, networkB]) => networkA.order - networkB.order,
    );

    return (
        <RadioGroup onValueChange={onNetworkChange} {...networkField}>
            {sortedNetworks.map(([key, { disabled, testnet, beta, name, logo }]) => (
                <RadioCard
                    key={key}
                    tag={disabled ? disabledTag : testnet ? testnetTag : beta ? betaTag : undefined}
                    value={key}
                    label={name}
                    disabled={disabled}
                    avatar={logo}
                />
            ))}
        </RadioGroup>
    );
};
