'use client';

import { AlertInline, DefinitionList, Heading } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    type IPermissionChange,
    isKnownPermissionOperation,
    permissionOperationLabelKeys,
} from '../permissionActionUtils';
import { PermissionIdItem } from './permissionIdItem';

export interface IPermissionChangeCardProps {
    /**
     * One permission change, in the order it appears in the calldata.
     */
    change: IPermissionChange;
    /**
     * Renders the target of the change. Left out when the action hoists a single
     * target above the list, so it is not repeated on every card.
     */
    showWhere: boolean;
    /**
     * Renders an address as a resolved entity.
     */
    renderEntity: (term: string, address: string) => React.ReactNode;
}

/**
 * One row of a bulk permission action. Rows are rendered in calldata order and never
 * merged: a revoke followed by a re-grant is two real operations even when they look
 * like they cancel out.
 */
export const PermissionChangeCard: React.FC<IPermissionChangeCardProps> = (
    props,
) => {
    const { change, showWhere, renderEntity } = props;

    const { t } = useTranslations();

    const { operation } = change;
    const isKnownOperation = isKnownPermissionOperation(operation);

    return (
        <li className="flex flex-col gap-3 rounded-xl border border-neutral-100 px-4 pt-4 pb-1 md:px-6 md:pt-6 md:pb-2">
            <Heading size="h4">
                {isKnownOperation
                    ? t(
                          `app.actions.core.permissionChangesDetails.operation.${permissionOperationLabelKeys[operation]}`,
                      )
                    : t(
                          'app.actions.core.permissionChangesDetails.unknownOperation',
                          { operation },
                      )}
            </Heading>
            {!isKnownOperation && (
                <AlertInline
                    message={t(
                        'app.actions.core.permissionChangesDetails.unknownOperationWarning',
                    )}
                    variant="warning"
                />
            )}
            <DefinitionList.Container>
                {renderEntity(
                    t('app.actions.core.permissionActionDetails.whoTerm'),
                    change.who,
                )}
                {showWhere &&
                    renderEntity(
                        t('app.actions.core.permissionActionDetails.whereTerm'),
                        change.where,
                    )}
                <PermissionIdItem permissionId={change.permissionId} />
                {change.condition != null &&
                    renderEntity(
                        t(
                            'app.actions.core.permissionActionDetails.conditionTerm',
                        ),
                        change.condition,
                    )}
            </DefinitionList.Container>
        </li>
    );
};
