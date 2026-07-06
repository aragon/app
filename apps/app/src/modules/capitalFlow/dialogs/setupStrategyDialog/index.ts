import dynamic from 'next/dynamic';

export const SetupStrategyDialog = dynamic(() =>
    import('./setupStrategyDialog').then((mod) => mod.SetupStrategyDialog),
);

export type {
    ISetupStrategyDialogParams,
    ISetupStrategyDialogProps,
} from './setupStrategyDialog';
export {
    type ISetupStrategyForm,
    RouterType,
    StrategyType,
} from './setupStrategyDialogDefinitions';
