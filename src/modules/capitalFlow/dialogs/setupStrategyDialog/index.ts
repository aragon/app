import dynamic from 'next/dynamic';

export const SetupStrategyDialog = dynamic(() =>
    import('./setupStrategyDialog').then((mod) => mod.SetupStrategyDialog),
);

export { type ISetupStrategyDialogParams, type ISetupStrategyDialogProps } from './setupStrategyDialog';
export { RouterType, StrategyType, type ISetupStrategyForm } from './setupStrategyDialogDefinitions';
