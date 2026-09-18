'use client';

import {
    AlertInline,
    Button,
    IconType,
    InputContainer,
    type IProposalAction,
    type IProposalActionComponentProps,
    Toggle,
    ToggleGroup,
} from '@aragon/gov-ui-kit';
import { useMemo, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { zeroAddress } from 'viem';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { useTranslations } from '@/shared/components/translationsProvider';
import { usePermissionActionEncoder } from '../hooks/usePermissionActionEncoder';
import {
    PermissionOperation,
    permissionActionUtils,
    permissionOperationLabelKeys,
} from '../permissionActionUtils';
import { PermissionAddressInput } from './permissionAddressInput';
import { PermissionIdInput } from './permissionIdInput';

const operationOrder = [
    PermissionOperation.GRANT,
    PermissionOperation.REVOKE,
    PermissionOperation.GRANT_WITH_CONDITION,
];

export interface IPermissionChangesCreateProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction, unknown>
    > {}

/**
 * Composer view of `applySingleTargetPermissions` and `applyMultiTargetPermissions`.
 *
 * Rows are held as the positional tuples the encoder expects, and every column is
 * addressed through its ABI component name rather than a fixed position — reading the
 * columns in the wrong order silently swaps values between them and changes what the
 * action does.
 */
export const PermissionChangesCreate: React.FC<
    IPermissionChangesCreateProps
> = (props) => {
    const { action, index, chainId } = props;

    const { t } = useTranslations();
    const {
        setValue,
        clearErrors,
        trigger,
        formState: { isSubmitted },
    } = useFormContext();

    const fieldPrefix = `actions.${index.toString()}`;
    const parameters = action.inputData?.parameters ?? [];

    usePermissionActionEncoder({ action, fieldPrefix });

    const tupleIndex = parameters.findIndex(
        (parameter) => parameter.components != null,
    );
    const tupleParameter = parameters[tupleIndex];
    const componentNames = useMemo(
        () =>
            tupleParameter?.components?.map((component) => component.name) ??
            [],
        [tupleParameter],
    );
    const columnIndex = (name: string) => componentNames.indexOf(name);

    // A single-target action hoists the shared target into the parameter before the rows.
    const hasHoistedWhere = tupleIndex > 0;
    const hasConditionColumn = componentNames.includes('condition');

    const rowsFieldName = `${fieldPrefix}.inputData.parameters.${tupleIndex.toString()}.value`;
    const rows = (useWatch({ name: rowsFieldName }) ?? []) as string[][];

    // Rows are positional in the form, but React must not key them by position: the
    // address inputs keep local state, so removing a row would hand its inputs to the
    // row that slides into its index. Each row gets an id that follows it instead.
    const rowIds = useRef<string[]>([]);
    const nextRowId = useRef(0);

    while (rowIds.current.length < rows.length) {
        rowIds.current.push(`row-${(nextRowId.current++).toString()}`);
    }

    const cellFieldName = (rowIndex: number, name: string) =>
        `inputData.parameters.${tupleIndex.toString()}.value.${rowIndex.toString()}.${columnIndex(name).toString()}`;

    const handleOperationChange = (rowIndex: number, value?: string) => {
        // A single-select ToggleGroup emits an empty value when the active option is
        // clicked again. Number('') is 0, so letting it through would silently turn a
        // revoke into a grant.
        const nextOperation = operationOrder.find(
            (operation) => operation.toString() === value,
        );

        if (nextOperation == null) {
            return;
        }

        setValue(
            `${fieldPrefix}.${cellFieldName(rowIndex, 'operation')}`,
            nextOperation.toString(),
        );

        if (hasConditionColumn) {
            setValue(
                `${fieldPrefix}.${cellFieldName(rowIndex, 'condition')}`,
                nextOperation === PermissionOperation.GRANT_WITH_CONDITION
                    ? ''
                    : zeroAddress,
            );
        }
    };

    const handleAddChange = () => {
        const newRow = permissionActionUtils.toRowValues(
            {
                operation: PermissionOperation.GRANT,
                where: '' as `0x${string}`,
                who: '' as `0x${string}`,
                permissionId: '' as `0x${string}`,
            },
            componentNames,
        );

        rowIds.current.push(`row-${(nextRowId.current++).toString()}`);
        setValue(rowsFieldName, [...rows, newRow]);
    };

    const handleRemoveChange = async (rowIndex: number) => {
        rowIds.current.splice(rowIndex, 1);
        // Errors are keyed by path, so the row sliding into this index would inherit the
        // removed row's messages. Clear them, and re-validate only once the user has
        // already asked for validation by submitting.
        clearErrors(rowsFieldName);
        setValue(
            rowsFieldName,
            rows.filter((_, currentIndex) => currentIndex !== rowIndex),
        );

        if (isSubmitted) {
            await trigger(rowsFieldName);
        }
    };

    return (
        <div className="flex w-full flex-col gap-6">
            <AlertInline
                message={t(
                    'app.actions.core.permissionActionDetails.riskWarning',
                )}
                variant="warning"
            />
            {hasHoistedWhere && (
                <PermissionAddressInput
                    chainId={chainId}
                    fieldPrefix={fieldPrefix}
                    helpText={t(
                        'app.actions.core.permissionActionCreate.whereHelpText',
                    )}
                    label={t(
                        'app.actions.core.permissionActionDetails.whereTerm',
                    )}
                    name={`inputData.parameters.${(tupleIndex - 1).toString()}.value`}
                />
            )}
            <div className="flex w-full flex-col gap-3">
                {rows.map((row, rowIndex) => {
                    const operation = Number(row[columnIndex('operation')]);
                    const isRevoke = operation === PermissionOperation.REVOKE;

                    return (
                        <div
                            className="flex flex-col gap-6 rounded-xl border border-neutral-100 p-4 md:p-6"
                            key={rowIds.current[rowIndex]}
                        >
                            <div className="flex flex-row items-start justify-between gap-2">
                                <InputContainer
                                    id={`${fieldPrefix}-operation-${rowIndex.toString()}`}
                                    label={t(
                                        'app.actions.core.permissionChangesCreate.changeLabel',
                                    )}
                                    useCustomWrapper={true}
                                >
                                    <ToggleGroup
                                        isMultiSelect={false}
                                        onChange={(value) =>
                                            handleOperationChange(
                                                rowIndex,
                                                value,
                                            )
                                        }
                                        value={operation.toString()}
                                    >
                                        {operationOrder
                                            .filter(
                                                (candidate) =>
                                                    hasConditionColumn ||
                                                    candidate !==
                                                        PermissionOperation.GRANT_WITH_CONDITION,
                                            )
                                            .map((candidate) => (
                                                <Toggle
                                                    key={candidate}
                                                    label={t(
                                                        `app.actions.core.permissionChangesDetails.operation.${permissionOperationLabelKeys[candidate]}`,
                                                    )}
                                                    value={candidate.toString()}
                                                />
                                            ))}
                                    </ToggleGroup>
                                </InputContainer>
                                <Button
                                    aria-label={t(
                                        'app.actions.core.permissionChangesCreate.removeChange',
                                    )}
                                    iconLeft={IconType.CLOSE}
                                    onClick={() => handleRemoveChange(rowIndex)}
                                    size="sm"
                                    variant="tertiary"
                                />
                            </div>
                            <PermissionAddressInput
                                chainId={chainId}
                                fieldPrefix={fieldPrefix}
                                helpText={t(
                                    `app.actions.core.permissionActionCreate.${isRevoke ? 'whoRevokeHelpText' : 'whoGrantHelpText'}`,
                                )}
                                label={t(
                                    'app.actions.core.permissionActionDetails.whoTerm',
                                )}
                                name={cellFieldName(rowIndex, 'who')}
                            />
                            {!hasHoistedWhere && (
                                <PermissionAddressInput
                                    chainId={chainId}
                                    fieldPrefix={fieldPrefix}
                                    helpText={t(
                                        'app.actions.core.permissionActionCreate.whereHelpText',
                                    )}
                                    label={t(
                                        'app.actions.core.permissionActionDetails.whereTerm',
                                    )}
                                    name={cellFieldName(rowIndex, 'where')}
                                />
                            )}
                            <PermissionIdInput
                                fieldPrefix={fieldPrefix}
                                name={cellFieldName(rowIndex, 'permissionId')}
                            />
                            {operation ===
                                PermissionOperation.GRANT_WITH_CONDITION && (
                                <PermissionAddressInput
                                    chainId={chainId}
                                    fieldPrefix={fieldPrefix}
                                    helpText={t(
                                        'app.actions.core.permissionActionCreate.conditionHelpText',
                                    )}
                                    isCondition={true}
                                    label={t(
                                        'app.actions.core.permissionActionDetails.conditionTerm',
                                    )}
                                    name={cellFieldName(rowIndex, 'condition')}
                                />
                            )}
                        </div>
                    );
                })}
                {rows.length === 0 && (
                    <p className="text-neutral-500">
                        {t(
                            'app.actions.core.permissionChangesCreate.emptyList',
                        )}
                    </p>
                )}
                <Button
                    className="w-fit"
                    iconLeft={IconType.PLUS}
                    onClick={handleAddChange}
                    size="sm"
                    variant="tertiary"
                >
                    {t('app.actions.core.permissionChangesCreate.addChange')}
                </Button>
            </div>
        </div>
    );
};
