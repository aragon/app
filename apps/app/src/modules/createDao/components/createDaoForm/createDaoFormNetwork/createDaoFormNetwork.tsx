import {
    Button,
    Heading,
    IconType,
    RadioCard,
    RadioGroup,
} from '@aragon/gov-ui-kit';
import { useId, useState } from 'react';
import { Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    type INetworkDefinition,
    networkDefinitions,
} from '@/shared/constants/networkDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';
import type { ICreateDaoFormData } from '../createDaoFormDefinitions';

export interface ICreateDaoFormNetworkProps {}

/**
 * Number of testnets displayed before the "Show all testnets" trigger.
 */
const visibleTestnets = 1;

type NetworkEntry = [Network, INetworkDefinition];

export const CreateDaoFormNetwork: React.FC<
    ICreateDaoFormNetworkProps
> = () => {
    const { t } = useTranslations();
    const testnetListId = useId();
    const [showAllTestnets, setShowAllTestnets] = useState(false);

    const { onChange: onNetworkChange, ...networkField } = useFormField<
        ICreateDaoFormData,
        'network'
    >('network', {
        defaultValue: Network.ETHEREUM_SEPOLIA,
    });

    const disabledTag = {
        variant: 'info' as const,
        label: t('app.createDao.createDaoForm.network.tag.disabled'),
    };
    const betaTag = {
        variant: 'primary' as const,
        label: t('app.createDao.createDaoForm.network.tag.beta'),
    };

    const sortedNetworks = (
        Object.entries(networkDefinitions) as NetworkEntry[]
    ).sort(([, networkA], [, networkB]) => networkA.order - networkB.order);

    const mainnets = sortedNetworks.filter(([, { testnet }]) => !testnet);
    const testnets = sortedNetworks.filter(([, { testnet }]) => testnet);

    const displayedTestnets = testnets.filter(
        ([network], index) =>
            showAllTestnets ||
            index < visibleTestnets ||
            network === networkField.value,
    );

    const renderNetwork = ([key, network]: NetworkEntry) => {
        const { disabled, beta, name, logo } = network;

        return (
            <RadioCard
                avatar={logo}
                disabled={disabled}
                key={key}
                label={name}
                tag={disabled ? disabledTag : beta ? betaTag : undefined}
                value={key}
            />
        );
    };

    return (
        <RadioGroup onValueChange={onNetworkChange} {...networkField}>
            <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-4">
                    <Heading size="h4">
                        {t(
                            'app.createDao.createDaoForm.network.section.mainnets',
                        )}
                    </Heading>
                    <div className="flex flex-col gap-y-2 md:gap-y-3">
                        {mainnets.map(renderNetwork)}
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <Heading size="h4">
                        {t(
                            'app.createDao.createDaoForm.network.section.testnets',
                        )}
                    </Heading>
                    <div
                        className="flex flex-col gap-y-2 md:gap-y-3"
                        id={testnetListId}
                    >
                        {displayedTestnets.map(renderNetwork)}
                    </div>
                    {testnets.length > visibleTestnets && (
                        <Button
                            aria-controls={testnetListId}
                            aria-expanded={showAllTestnets}
                            className="self-start"
                            iconRight={
                                showAllTestnets
                                    ? IconType.CHEVRON_UP
                                    : IconType.CHEVRON_DOWN
                            }
                            onClick={() =>
                                setShowAllTestnets((expanded) => !expanded)
                            }
                            size="sm"
                            variant="tertiary"
                        >
                            {t(
                                showAllTestnets
                                    ? 'app.createDao.createDaoForm.network.showFewer'
                                    : 'app.createDao.createDaoForm.network.showAllTestnets',
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </RadioGroup>
    );
};
