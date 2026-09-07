import {
    Avatar,
    Dropdown,
    Icon,
    IconType,
    InputContainer,
} from '@aragon/gov-ui-kit';
import { Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';
import { networkUtils } from '@/shared/utils/networkUtils';
import type { INetworkInputProps } from './networkInput.api';

export type NetworkInputBaseForm = Record<string, Network>;

/**
 * Classes rendering a network tag. The `Tag` component is not used because it renders a div and the tag is rendered
 * inside paragraphs (see `Dropdown.Item`), where only phrasing content is valid.
 */
const networkTagClassName =
    'flex h-5 shrink-0 items-center rounded-full bg-neutral-100 px-1.5 text-neutral-500 text-sm leading-tight md:h-6 md:px-2 md:text-base';

/**
 * Networks selectable in the input, i.e. every supported network that is not disabled, ordered as defined on the
 * network definitions.
 */
const selectableNetworks = networkUtils
    .getSupportedNetworks()
    .filter((network) => !networkDefinitions[network].disabled)
    .sort(
        (networkA, networkB) =>
            networkDefinitions[networkA].order -
            networkDefinitions[networkB].order,
    );

export const NetworkInput: React.FC<INetworkInputProps> = (props) => {
    const { name, label, helpText, fieldPrefix, defaultValue, onValueChange } =
        props;

    const { t } = useTranslations();

    const fieldName = fieldPrefix ? `${fieldPrefix}.${name}` : name;

    const { value, onChange, ...networkField } = useFormField<
        NetworkInputBaseForm,
        typeof name
    >(name, {
        label: label ?? t('app.shared.networkInput.label'),
        fieldPrefix,
        rules: { required: true },
        defaultValue: defaultValue ?? Network.ETHEREUM_SEPOLIA,
        sanitizeOnBlur: false,
    });

    const handleNetworkSelect = (network: Network) => {
        onChange(network);
        onValueChange?.(network);
    };

    const {
        name: selectedName,
        logo: selectedLogo,
        testnet: selectedTestnet,
        beta: selectedBeta,
    } = networkDefinitions[value];

    const getTagLabel = (params: { testnet?: boolean; beta?: boolean }) => {
        const { testnet, beta } = params;

        if (testnet) {
            return t('app.shared.networkInput.tag.testnet');
        }

        return beta ? t('app.shared.networkInput.tag.beta') : undefined;
    };

    const selectedTagLabel = getTagLabel({
        testnet: selectedTestnet,
        beta: selectedBeta,
    });

    return (
        <InputContainer
            helpText={helpText}
            id={fieldName}
            useCustomWrapper={true}
            {...networkField}
        >
            <Dropdown.Container
                align="start"
                className="w-full"
                customTrigger={
                    <button
                        aria-label={label ?? t('app.shared.networkInput.label')}
                        className="focus-ring-primary flex w-full cursor-pointer items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-0 px-4 py-3 text-left hover:border-neutral-200 focus:outline-hidden"
                        type="button"
                    >
                        <Avatar
                            alt={selectedName}
                            size="sm"
                            src={selectedLogo}
                        />
                        <span className="grow truncate text-base text-neutral-800 leading-tight">
                            {selectedName}
                        </span>
                        {selectedTagLabel != null && (
                            <span className={networkTagClassName}>
                                {selectedTagLabel}
                            </span>
                        )}
                        <Icon
                            className="text-neutral-300"
                            icon={IconType.CHEVRON_DOWN}
                        />
                    </button>
                }
            >
                {selectableNetworks.map((network) => {
                    const {
                        name: networkName,
                        logo,
                        testnet,
                        beta,
                    } = networkDefinitions[network];
                    const tagLabel = getTagLabel({ testnet, beta });

                    return (
                        <Dropdown.Item
                            key={network}
                            onClick={() => handleNetworkSelect(network)}
                            selected={network === value}
                        >
                            {/* Dropdown.Item renders its children inside a paragraph, therefore only phrasing
                             * content is allowed here (no Tag component, which renders a div). */}
                            <span className="flex items-center gap-3">
                                <Avatar
                                    alt={networkName}
                                    size="sm"
                                    src={logo}
                                />
                                <span className="truncate">{networkName}</span>
                                {tagLabel != null && (
                                    <span className={networkTagClassName}>
                                        {tagLabel}
                                    </span>
                                )}
                            </span>
                        </Dropdown.Item>
                    );
                })}
            </Dropdown.Container>
        </InputContainer>
    );
};
