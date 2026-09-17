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
import { PermissionIdItem } from './permissionIdItem';

export interface IPermissionActionDetailsProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction>
    > {}

/**
 * Basic view of a `grant`, `revoke` or `grantWithCondition` action.
 *
 * This is deliberately a BASIC view and not a decoder override: the DECODED view stays
 * the kit's own, unmodified rendering so a reviewer who distrusts this summary can read
 * the parameters exactly as they were decoded.
 */
export const PermissionActionDetails: React.FC<
    IPermissionActionDetailsProps
> = (props) => {
    const { action, chainId } = props;

    const { t } = useTranslations();

    // Outside a DAO context (e.g. actions forwarded to another chain) there is no
    // daoId; addresses then render as themselves while permission names still resolve.
    const renderEntity = usePermissionEntityRenderer({
        daoId: action.daoId,
        chainId,
    });

    const parameters = action.inputData?.parameters ?? [];
    // grantWithCondition appends the condition contract after the permission id.
    const [where, who, permissionId, condition] = parameters.map((parameter) =>
        String(parameter.value ?? ''),
    );

    return (
        <div className="flex w-full flex-col gap-4">
            <AlertInline
                message={t(
                    'app.actions.core.permissionActionDetails.riskWarning',
                )}
                variant="warning"
            />
            <DefinitionList.Container>
                {renderEntity(
                    t('app.actions.core.permissionActionDetails.whoTerm'),
                    who,
                )}
                {renderEntity(
                    t('app.actions.core.permissionActionDetails.whereTerm'),
                    where,
                )}
                <PermissionIdItem permissionId={permissionId} />
                {condition != null &&
                    renderEntity(
                        t(
                            'app.actions.core.permissionActionDetails.conditionTerm',
                        ),
                        condition,
                    )}
            </DefinitionList.Container>
        </div>
    );
};
