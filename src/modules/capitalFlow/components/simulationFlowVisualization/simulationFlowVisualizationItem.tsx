import {
    addressUtils,
    ChainEntityType,
    DaoAvatar,
    Icon,
    Link,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import type { IAddressDelta, ISummaryGroup } from '../../utils/simulationTypes';
import { simulationFlowVisualizationUtils } from './simulationFlowVisualizationUtils';

export interface ISimulationFlowVisualizationItemProps {
    /**
     * The group kind this item belongs to.
     */
    groupKind: ISummaryGroup['kind'];
    /**
     * The address delta data to display.
     */
    item: IAddressDelta;
    /**
     * Whether to show a compact version (hides fallback address when no link).
     */
    compact?: boolean;
    /**
     * Function to build entity URLs for addresses.
     */
    buildEntityUrl?: (params: {
        type: ChainEntityType;
        id?: string;
        chainId?: number;
    }) => string | undefined;
}

interface IItemIconProps {
    /**
     * The group kind this item belongs to.
     */
    groupKind: ISummaryGroup['kind'];
    /**
     * The address delta data to display.
     */
    item: IAddressDelta;
}

const ItemIcon: React.FC<IItemIconProps> = ({ groupKind, item }) => {
    if (groupKind === 'dao') {
        const avatarSrc = item.avatar?.startsWith('http')
            ? item.avatar
            : ipfsUtils.cidToSrc(item.avatar);

        return <DaoAvatar name={item.label} size="md" src={avatarSrc} />;
    }

    const isBurn = item.role === 'burn';
    const iconType = simulationFlowVisualizationUtils.getIconTypeForRole(
        item.role,
    );

    return (
        <div
            className={classNames(
                'flex size-8 items-center justify-center overflow-hidden rounded-full',
                isBurn ? 'bg-critical-100' : 'bg-neutral-50',
            )}
        >
            <Icon
                className={isBurn ? 'text-critical-500' : 'text-neutral-300'}
                icon={iconType}
                size="md"
            />
        </div>
    );
};

interface IItemAddressProps {
    /**
     * The address delta data to display.
     */
    item: IAddressDelta;
    /**
     * The href for the address.
     */
    addressHref?: string;
    /**
     * Whether to show the fallback address.
     */
    showFallbackAddress: boolean;
}

const ItemAddress: React.FC<IItemAddressProps> = ({
    item,
    addressHref,
    showFallbackAddress,
}) => {
    const linkText = item.ens ?? addressUtils.truncateAddress(item.address);

    return (
        <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="min-w-full overflow-hidden text-ellipsis whitespace-nowrap text-base text-neutral-800 leading-tight">
                {item.label}
            </p>

            {addressHref && (
                <Link
                    className="w-fit"
                    href={addressHref}
                    isExternal
                    variant="primary"
                >
                    {linkText}
                </Link>
            )}

            {showFallbackAddress && (
                <p className="text-neutral-500 text-sm leading-tight">
                    {addressUtils.truncateAddress(item.address)}
                </p>
            )}
        </div>
    );
};

interface IItemTokenDeltasProps {
    /**
     * The address delta data to display.
     */
    item: IAddressDelta;
}

const ItemTokenDeltas: React.FC<IItemTokenDeltasProps> = ({ item }) => {
    const sortedTokens = simulationFlowVisualizationUtils.sortTokenDeltas(
        item.tokens,
    );

    return (
        <div
            className={classNames(
                'flex h-full flex-col items-end text-right text-base text-neutral-800 leading-tight',
                sortedTokens.length > 1 ? 'gap-1' : 'gap-0',
            )}
        >
            {sortedTokens.map((tokenDelta) => (
                <p
                    className="shrink-0"
                    key={`${item.address}-${tokenDelta.token.address}`}
                    title={simulationFlowVisualizationUtils.getExactSignedTokenAmount(
                        tokenDelta.amount,
                        tokenDelta.token.symbol,
                    )}
                >
                    {simulationFlowVisualizationUtils.formatSignedTokenAmount(
                        tokenDelta.amount,
                        tokenDelta.token.symbol,
                    )}
                </p>
            ))}
        </div>
    );
};

/**
 * A component that displays a simulation flow visualization item.
 */
export const SimulationFlowVisualizationItem: React.FC<
    ISimulationFlowVisualizationItemProps
> = (props) => {
    const { groupKind, item, compact = false, buildEntityUrl } = props;

    const addressHref = buildEntityUrl?.({
        type: ChainEntityType.ADDRESS,
        id: item.address,
    });

    const showFallbackAddress = addressHref == null && !compact;

    return (
        <div className="w-full rounded-xl border border-neutral-100 bg-neutral-0 p-6 shadow-neutral-sm">
            <div className="flex items-center gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                    <ItemIcon groupKind={groupKind} item={item} />
                    <ItemAddress
                        addressHref={addressHref}
                        item={item}
                        showFallbackAddress={showFallbackAddress}
                    />
                </div>
                <div className="flex flex-row items-center self-stretch">
                    <ItemTokenDeltas item={item} />
                </div>
            </div>
        </div>
    );
};
