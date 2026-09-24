'use client';

import {
    AlertInline,
    DefinitionList,
    type IProposalAction,
    type IProposalActionComponentProps,
} from '@aragon/gov-ui-kit';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { useTranslations } from '@/shared/components/translationsProvider';
import { usePermissionEntityRenderer } from '../hooks/usePermissionEntityRenderer';
import { permissionActionUtils } from '../permissionActionUtils';
import { PermissionChangeCard } from './permissionChangeCard';

export interface IPermissionChangesDetailsProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction>
    > {}

/**
 * Basic view of `applySingleTargetPermissions` and `applyMultiTargetPermissions`.
 *
 * `applySingleTargetPermissions` hoists the target out of the rows into a sibling
 * `_where` parameter, so it is shown once above the list instead of on every card.
 */
export const PermissionChangesDetails: React.FC<
    IPermissionChangesDetailsProps
> = (props) => {
    const { action, chainId } = props;

    const { t } = useTranslations();

    // Outside a DAO context (e.g. actions forwarded to another chain) there is no
    // daoId; addresses then render as themselves while permission names still resolve.
    const parameters = action.inputData?.parameters ?? [];
    const tupleIndex = parameters.findIndex(
        (parameter) => parameter.components != null,
    );
    const tupleParameter = parameters[tupleIndex];

    // A single-target action carries the shared target in the parameter preceding the rows.
    const hoistedWhere =
        tupleIndex > 0
            ? String(parameters[tupleIndex - 1].value ?? '')
            : undefined;

    const changes =
        tupleParameter == null
            ? []
            : permissionActionUtils.getPermissionChanges(
                  tupleParameter,
                  hoistedWhere,
              );

    const renderEntity = usePermissionEntityRenderer({
        daoId: action.daoId,
        chainId,
        hasCondition: changes.some((change) => change.condition != null),
    });

    return (
        <div className="flex w-full flex-col gap-6">
            <AlertInline
                message={t('app.actions.core.permissionManager.riskWarning')}
                variant="warning"
            />
            {hoistedWhere != null && (
                <DefinitionList.Container>
                    {renderEntity(
                        t('app.actions.core.permissionManager.whereTerm'),
                        hoistedWhere,
                    )}
                </DefinitionList.Container>
            )}
            <ul className="flex flex-col gap-3">
                {changes.map((change, index) => (
                    <PermissionChangeCard
                        change={change}
                        key={`${change.permissionId}-${change.who}-${index.toString()}`}
                        renderEntity={renderEntity}
                        showWhere={hoistedWhere == null}
                    />
                ))}
            </ul>
        </div>
    );
};
