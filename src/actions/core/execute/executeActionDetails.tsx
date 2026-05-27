'use client';

import {
    DefinitionList,
    type IProposalActionComponentProps,
} from '@aragon/gov-ui-kit';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { NestedActionsList } from '@/modules/governance/components/nestedActionsList';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IExecuteActionDetailsProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction>
    > {}

export const ExecuteActionDetails: React.FC<IExecuteActionDetailsProps> = (
    props,
) => {
    const { action, chainId } = props;
    const { t } = useTranslations();

    const parameters = action.inputData?.parameters ?? [];
    const callId =
        (parameters.find((param) => param.name === '_callId')?.value as
            | string
            | undefined) ?? '';
    const allowFailureMap =
        (parameters
            .find((param) => param.name === 'allowFailureMap')
            ?.value?.toString() as string | undefined) ?? '';

    return (
        <div className="flex flex-col gap-y-6">
            <DefinitionList.Container>
                {callId !== '' && (
                    <DefinitionList.Item
                        copyValue={callId}
                        term={t(
                            'app.governance.daoProposalDetailsPage.main.actions.nested.execute.callId',
                        )}
                    >
                        <p className="truncate text-neutral-500">{callId}</p>
                    </DefinitionList.Item>
                )}
                {allowFailureMap !== '' && (
                    <DefinitionList.Item
                        term={t(
                            'app.governance.daoProposalDetailsPage.main.actions.nested.execute.allowFailureMap',
                        )}
                    >
                        {allowFailureMap}
                    </DefinitionList.Item>
                )}
            </DefinitionList.Container>
            <NestedActionsList
                chainId={chainId}
                daoId={action.daoId}
                outerParams={parameters}
                rawActions={action.inputData?.actions}
            />
        </div>
    );
};
