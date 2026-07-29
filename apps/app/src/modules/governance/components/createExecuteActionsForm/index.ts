import { CreateProposalFormProvider } from '../createProposalForm/createProposalFormProvider';
import { CreateExecuteActionsFormActions } from './createExecuteActionsFormActions';

export const CreateExecuteActionsForm = {
    Actions: CreateExecuteActionsFormActions,
    Provider: CreateProposalFormProvider,
};

export {
    CreateExecuteActionsFormActions,
    type ICreateExecuteActionsFormActionsProps,
} from './createExecuteActionsFormActions';
export type { IExecuteActionsFormData } from './createExecuteActionsFormDefinitions';
