import {
    addressUtils,
    ChainEntityType,
    DaoAvatar,
    formatterUtils,
    Icon,
    IconType,
    NumberFormat,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import type {
    IProcessedSimulation,
    ISummaryGroup,
} from '../../utils/simulationTypes';

export interface ISimulationFlowVisualizationProps {
    /**
     * The simulation data to display.
     */
    simulation: IProcessedSimulation;
    /**
     * Additional CSS classes.
     */
    className?: string;
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

const formatSignedTokenAmount = (amount: string, symbol: string): string => {
    const trimmed = amount.trim();
    const isNegative = trimmed.startsWith('-');
    const unsigned = isNegative ? trimmed.slice(1) : trimmed;
    const isValidNumber = /^\d*\.?\d+$/.test(unsigned);
    const isZero = /^0*(?:\.0*)?$/.test(unsigned);

    if (!isValidNumber) {
        return `${amount} ${symbol}`;
    }

    if (isZero) {
        return `0 ${symbol}`;
    }

    const sign = isNegative ? '-' : '+';
    const formatted =
        formatterUtils.formatNumber(unsigned, {
            format: NumberFormat.TOKEN_AMOUNT_SHORT,
        }) ?? unsigned;

    return `${sign} ${formatted} ${symbol}`;
};

const getExactSignedTokenAmount = (amount: string, symbol: string): string => {
    const trimmed = amount.trim();

    if (trimmed.startsWith('+') || trimmed.startsWith('-')) {
        return `${trimmed} ${symbol}`;
    }

    // Add '+' prefix for positive amounts
    return `+${trimmed} ${symbol}`;
};

const getGroupTitleKey = (group: ISummaryGroup): string => {
    switch (group.kind) {
        case 'dao':
            return 'app.capitalFlow.simulationFlowVisualization.summary.daoGroup';
        default:
            return 'app.capitalFlow.simulationFlowVisualization.summary.externalGroup';
    }
};

const getAvatarSrc = (
    avatar: string | null | undefined,
): string | undefined => {
    if (avatar == null) {
        return undefined;
    }
    return avatar.startsWith('http') ? avatar : ipfsUtils.cidToSrc(avatar);
};

const getIconTypeForRole = (role: string): IconType => {
    return role === 'wallet'
        ? IconType.BLOCKCHAIN_WALLET
        : IconType.BLOCKCHAIN_SMARTCONTRACT;
};

export const SimulationFlowVisualization: React.FC<
    ISimulationFlowVisualizationProps
> = (props) => {
    const { simulation, className, compact = false, buildEntityUrl } = props;

    const { t } = useTranslations();
    const { summaryGroups } = simulation;

    if (summaryGroups.length === 0) {
        return (
            <div className={classNames('flex flex-col gap-8', className)}>
                <p className="text-neutral-500 text-sm">
                    {t(
                        'app.capitalFlow.simulationFlowVisualization.summary.empty',
                    )}
                </p>
            </div>
        );
    }

    return (
        <div className={classNames('flex flex-col gap-8', className)}>
            {summaryGroups.map((group) => (
                <div className="flex w-full flex-col gap-3" key={group.kind}>
                    <p className="text-neutral-800 text-xl leading-tight">
                        {t(getGroupTitleKey(group))}
                    </p>
                    <div className="flex w-full flex-col gap-3">
                        {group.items.map((item) => {
                            const addressHref = buildEntityUrl?.({
                                type: ChainEntityType.ADDRESS,
                                id: item.address,
                            });

                            const linkText =
                                item.ens ??
                                addressUtils.truncateAddress(item.address);
                            const showFallbackAddress =
                                addressHref == null && !compact;

                            const sortedTokens = [...item.tokens].sort(
                                (a, b) => {
                                    const aNeg = a.amount
                                        .trim()
                                        .startsWith('-');
                                    const bNeg = b.amount
                                        .trim()
                                        .startsWith('-');
                                    if (aNeg !== bNeg) {
                                        return aNeg ? -1 : 1;
                                    }
                                    return 0;
                                },
                            );

                            return (
                                <div
                                    className="w-full rounded-xl border border-neutral-100 bg-neutral-0 p-6 shadow-neutral-sm"
                                    key={item.address}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex min-w-0 flex-1 items-start gap-3">
                                            {group.kind === 'dao' ? (
                                                <DaoAvatar
                                                    name={item.label}
                                                    size="md"
                                                    src={getAvatarSrc(
                                                        item.avatar,
                                                    )}
                                                />
                                            ) : item.role === 'burn' ? (
                                                <div className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-critical-100">
                                                    <Icon
                                                        className="text-critical-500"
                                                        icon={
                                                            IconType.BURN_ASSETS
                                                        }
                                                        size="md"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-neutral-50">
                                                    <Icon
                                                        className="text-neutral-300"
                                                        icon={getIconTypeForRole(
                                                            item.role,
                                                        )}
                                                        size="md"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                                <p className="min-w-full overflow-hidden text-ellipsis whitespace-nowrap text-base text-neutral-800 leading-tight">
                                                    {item.label}
                                                </p>
                                                {addressHref && (
                                                    <a
                                                        className="inline-flex w-fit items-center gap-1.5 text-base text-primary-400 leading-tight hover:text-primary-300"
                                                        href={addressHref}
                                                        rel="noreferrer"
                                                        target="_blank"
                                                    >
                                                        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                                                            {linkText}
                                                        </span>
                                                        <Icon
                                                            icon={
                                                                IconType.LINK_EXTERNAL
                                                            }
                                                            size="sm"
                                                        />
                                                    </a>
                                                )}
                                                {showFallbackAddress && (
                                                    <p className="text-neutral-500 text-sm leading-tight">
                                                        {addressUtils.truncateAddress(
                                                            item.address,
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-row items-center self-stretch">
                                            <div
                                                className={classNames(
                                                    'flex h-full flex-col items-end text-right text-base text-neutral-800 leading-tight',
                                                    sortedTokens.length > 1
                                                        ? 'gap-1'
                                                        : 'gap-0',
                                                )}
                                            >
                                                {sortedTokens.map(
                                                    (tokenDelta) => (
                                                        <p
                                                            className="shrink-0"
                                                            key={`${item.address}-${tokenDelta.token.address}`}
                                                            title={getExactSignedTokenAmount(
                                                                tokenDelta.amount,
                                                                tokenDelta.token
                                                                    .symbol,
                                                            )}
                                                        >
                                                            {formatSignedTokenAmount(
                                                                tokenDelta.amount,
                                                                tokenDelta.token
                                                                    .symbol,
                                                            )}
                                                        </p>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {simulation.tenderlyUrl && (
                <a
                    className="inline-flex h-10 min-w-24 items-center justify-center gap-1 self-start overflow-hidden rounded-xl border border-primary-100 bg-neutral-0 px-3 text-primary-400 shadow-primary-sm hover:border-primary-300"
                    href={simulation.tenderlyUrl}
                    rel="noreferrer"
                    target="_blank"
                >
                    <span className="px-1 text-base leading-tight">
                        {t(
                            'app.capitalFlow.simulationFlowVisualization.tenderlyLink',
                        )}
                    </span>
                    <Icon
                        className="text-primary-300"
                        icon={IconType.LINK_EXTERNAL}
                        size="md"
                    />
                </a>
            )}
        </div>
    );
};
