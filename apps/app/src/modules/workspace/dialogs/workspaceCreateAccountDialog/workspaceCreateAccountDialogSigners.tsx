import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { ManageMembershipAddressList } from '@/shared/components/forms/manageMembershipAddressList';
import { NumberProgressInput } from '@/shared/components/forms/numberProgressInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceCreateAccountForm } from './workspaceCreateAccountDialogDefinitions';

const i18nBase = 'app.workspace.workspaceCreateAccountDialog';

export const WorkspaceCreateAccountDialogSigners: React.FC = () => {
    const { t } = useTranslations();

    const { setValue } = useFormContext<IWorkspaceCreateAccountForm>();
    const [network, members, threshold] = useWatch<
        IWorkspaceCreateAccountForm,
        ['network', 'members', 'threshold']
    >({ name: ['network', 'members', 'threshold'] });

    // The list always keeps at least one row.
    const total = members.length;

    // Follow removed signers, "Clear all" included (one row left).
    useEffect(() => {
        if (threshold > total) {
            setValue('threshold', total);
        }
    }, [threshold, total, setValue]);

    return (
        <div className="flex flex-col gap-section-wide">
            <ManageMembershipAddressList
                helpText={t(`${i18nBase}.signers.helpText`)}
                label={t(`${i18nBase}.signers.label`)}
                network={network}
                showResetAllAction={false}
            />
            <NumberProgressInput
                fieldName="threshold"
                helpText={t(`${i18nBase}.approvals.helpText`)}
                hideInputLabel={true}
                label={t(`${i18nBase}.approvals.label`)}
                min={1}
                total={total}
                totalLabel={t(`${i18nBase}.approvals.total`, {
                    value: threshold,
                    total,
                })}
                valueLabel={threshold.toString()}
            />
        </div>
    );
};
