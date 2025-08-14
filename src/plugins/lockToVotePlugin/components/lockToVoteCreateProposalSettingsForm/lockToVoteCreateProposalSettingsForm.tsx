'use client';

import type { ICreateProposalEndDateForm } from '@/modules/governance/utils/createProposalUtils';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { AdvancedDateInput } from '@/shared/components/forms/advancedDateInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { dateUtils } from '@/shared/utils/dateUtils/dateUtils';
import { DateTime } from 'luxon';

export interface ILockToVoteCreateProposalSettingsFormProps {
    /**
     * Plugin to create the proposal for.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
}

export const LockToVoteCreateProposalSettingsForm: React.FC<ILockToVoteCreateProposalSettingsFormProps> = (props) => {
    const { plugin } = props;

    const { t } = useTranslations();

    const proposalDuration = plugin.settings.minDuration;
    const parsedProposalDuration = dateUtils.secondsToDuration(proposalDuration);

    // This is the set proposal duration for Lock To Vote
    // as we don't allow users to set a specific minimum on this plugin
    // but we reuse minimumDuration naming for minimal backend changes
    useFormField<ICreateProposalEndDateForm, 'minimumDuration'>('minimumDuration', {
        defaultValue: parsedProposalDuration,
    });

    return (
        <div className="flex flex-col gap-6 md:gap-12">
            <AdvancedDateInput
                label={t('app.plugins.lockToVote.lockToVoteCreateProposalSettingsForm.startTime.label')}
                field="startTime"
                minTime={DateTime.now()}
            />
        </div>
    );
};
