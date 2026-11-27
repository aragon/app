import {
    Button,
    Heading,
    IconType,
    RadioCard,
    RadioGroup,
} from '@aragon/gov-ui-kit';
import { useId, useState } from 'react';
import type { Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    type INetworkDefinition,
    networkDefinitions,
} from '@/shared/constants/networkDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IWorkspaceCreateAccountForm } from './workspaceCreateAccountDialogDefinitions';

type NetworkEntry = [Network, INetworkDefinition];

const i18nBase = 'app.workspace.workspaceCreateAccountDialog.network';

// Testnets displayed before the "Show all testnets" trigger.
const visibleTestnets = 1;

export const WorkspaceCreateAccountDialogNetwork: React.FC = () => {
    const { t } = useTranslations();
    const testnetListId = useId();
    const [showAllTestnets, setShowAllTestnets] = useState(false);

    const { onChange: onNetworkChange, ...networkField } = useFormField<
        IWorkspaceCreateAccountForm,
        'network'
    >('network');

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

    const renderNetwork = ([
        key,
        { disabled, beta, name, logo },
    ]: NetworkEntry) => {
        const tag = disabled ? 'disabled' : beta ? 'beta' : undefined;

        return (
            <RadioCard
                avatar={logo}
                disabled={disabled}
                key={key}
                label={name}
                tag={
                    tag && {
                        variant: disabled ? 'info' : 'primary',
                        label: t(`${i18nBase}.tag.${tag}`),
                    }
                }
                value={key}
            />
        );
    };

    return (
        <RadioGroup onValueChange={onNetworkChange} {...networkField}>
            <div className="flex flex-col gap-section-wide">
                <div className="flex flex-col gap-group">
                    <Heading size="h4">{t(`${i18nBase}.mainnets`)}</Heading>
                    <div className="flex flex-col gap-y-related--8-12">
                        {mainnets.map(renderNetwork)}
                    </div>
                </div>
                <div className="flex flex-col gap-group">
                    <Heading size="h4">{t(`${i18nBase}.testnets`)}</Heading>
                    <div
                        className="flex flex-col gap-y-related--8-12"
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
                                `${i18nBase}.${showAllTestnets ? 'showFewer' : 'showAllTestnets'}`,
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </RadioGroup>
    );
};
