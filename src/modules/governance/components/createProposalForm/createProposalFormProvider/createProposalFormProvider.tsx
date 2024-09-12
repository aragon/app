import type { IProposalAction } from '@aragon/ods';
import { createContext, useContext } from 'react';
import type { ProposalActionType } from '../../../api/governanceService';

export type PrepareProposalActionFunction = (action: IProposalAction) => Promise<string>;

export interface ICreateProposalFormContext {
    /**
     *
     */
    prepareActions: Partial<Record<ProposalActionType, PrepareProposalActionFunction>>;
    addPrepareAction: (actionType: ProposalActionType, prepareAction: PrepareProposalActionFunction) => void;
}

const createProposalFormContext = createContext<ICreateProposalFormContext | null>(null);

export const CreateProposalFormProvider = createProposalFormContext.Provider;

export const useCreateProposalFormContext = () => {
    const values = useContext(createProposalFormContext);

    if (values == null) {
        throw new Error('');
    }

    return values;
};
