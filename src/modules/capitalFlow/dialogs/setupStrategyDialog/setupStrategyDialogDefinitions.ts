export enum StrategyType {
    CAPITAL_ROUTER = 'CAPITAL_ROUTER',
    CAPITAL_DISTRIBUTOR = 'CAPITAL_DISTRIBUTOR',
    DEFI_ADAPTER = 'DEFI_ADAPTER',
}

export interface ISetupStrategyForm {
    /**
     * Type of the strategy to setup.
     */
    type: StrategyType;
}
