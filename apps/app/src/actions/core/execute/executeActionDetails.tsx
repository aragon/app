'use client';

import {
    InputContainer,
    type IProposalAction,
    type IProposalActionComponentProps,
} from '@aragon/gov-ui-kit';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { NestedActionsList } from '@/modules/governance/components/nestedActionsList';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { ICoreActionExecute } from '../types/coreActionExecute';

export interface IExecuteActionDetailsProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction>
    > {}

export const ExecuteActionDetails: React.FC<IExecuteActionDetailsProps> = (
    props,
) => {
    const { action, chainId } = props;
    const { inputData } = action as unknown as ICoreActionExecute;

    const { t } = useTranslations();

    const { actions, parameters = [] } = inputData;

    return (
        <div className="flex w-full flex-col gap-y-6">
            <InputContainer
                helpText={t(
                    'app.actions.core.executeActionDetails.actionsHelpText',
                )}
                id="executeActions"
                label={t('app.actions.core.executeActionDetails.actionsLabel')}
                useCustomWrapper={true}
            >
                <NestedActionsList
                    chainId={chainId}
                    daoId={action.daoId}
                    outerParams={parameters}
                    rawActions={actions}
                />
            </InputContainer>
        </div>
    );
};
