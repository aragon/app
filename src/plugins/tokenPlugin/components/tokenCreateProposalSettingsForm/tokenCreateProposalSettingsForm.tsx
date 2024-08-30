import { useDaoSettings } from '@/shared/api/daoService';
import { AdvancedDateInput } from '@/shared/components/advancedDateInput';
import React from 'react';
import { useForm } from 'react-hook-form';
import { type IDaoTokenSettings } from '../../types';

export interface ITokenCreateProposalSettingsFormProps {
    /**
     * The DAO ID.
     */
    daoId: string;
}

export const TokenCreateProposalSettingsForm: React.FC<ITokenCreateProposalSettingsFormProps> = ({ daoId }) => {
    const daoSettingsParams = { daoId };
    const { data: dao } = useDaoSettings<IDaoTokenSettings>({ urlParams: daoSettingsParams });
    const minDuration = dao?.settings.minDuration;

    const { watch, control } = useForm();

    console.debug('watch', watch());

    return (
        <>
            <AdvancedDateInput
                label="Start Time"
                helpText="Define when a proposal should be active to receive approvals. If now is selected, the proposal is immediately active after publishing."
                useDuration={false}
                minDuration={0}
                control={control}
            />
            <AdvancedDateInput
                label="End Time"
                helpText="Define when a proposal should expire. After the expiration time, there is no way to approve or execute the proposal."
                useDuration={true}
                minDuration={minDuration ?? 0}
                control={control}
            />
        </>
    );
};
