import { formatterUtils, IconType, NumberFormat } from '@aragon/gov-ui-kit';
import type {
    FlowNodeRole,
    IAddressTokenDelta,
    ISummaryGroup,
} from '../../utils/simulationTypes';

class SimulationFlowVisualizationUtils {
    /**
     * Format token amount with sign (+/-) and formatting.
     */
    formatSignedTokenAmount = (amount: string, symbol: string): string => {
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

    /**
     * Get exact signed token amount for tooltip display.
     */
    getExactSignedTokenAmount = (amount: string, symbol: string): string => {
        const trimmed = amount.trim();

        if (trimmed.startsWith('+') || trimmed.startsWith('-')) {
            return `${trimmed} ${symbol}`;
        }

        return `+${trimmed} ${symbol}`;
    };

    /**
     * Get translation key for group title based on group kind.
     */
    getGroupTitleKey = (group: ISummaryGroup): string => {
        const keyMap: Record<ISummaryGroup['kind'], string> = {
            dao: 'app.capitalFlow.simulationFlowVisualization.summary.daoGroup',
            external:
                'app.capitalFlow.simulationFlowVisualization.summary.externalGroup',
        };
        return keyMap[group.kind];
    };

    /**
     * Get icon type for flow node role.
     */
    getIconTypeForRole = (role: FlowNodeRole): IconType => {
        const iconMap: Record<FlowNodeRole, IconType> = {
            wallet: IconType.BLOCKCHAIN_WALLET,
            contract: IconType.BLOCKCHAIN_SMARTCONTRACT,
            dao: IconType.BLOCKCHAIN_BLOCKCHAIN,
            subdao: IconType.BLOCKCHAIN_BLOCKCHAIN,
            burn: IconType.BURN_ASSETS,
        };
        return iconMap[role];
    };

    /**
     * Sort token deltas: negative amounts first, then positive.
     */
    sortTokenDeltas = (
        tokenDeltas: IAddressTokenDelta[],
    ): IAddressTokenDelta[] => {
        return [...tokenDeltas].sort((a, b) => {
            const aNeg = a.amount.trim().startsWith('-');
            const bNeg = b.amount.trim().startsWith('-');
            if (aNeg !== bNeg) {
                return aNeg ? -1 : 1;
            }
            return 0;
        });
    };
}

export const simulationFlowVisualizationUtils =
    new SimulationFlowVisualizationUtils();
