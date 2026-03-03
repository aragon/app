'use client';

import {
    CheckboxCard,
    type CheckboxState,
    InputNumber,
    invariant,
} from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { formatUnits } from 'viem';
import { ProposalCreationMode } from '@/modules/createDao/components/createProcessForm';
import type { ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import type { IPluginProposalCreationSettingsParams } from '@/modules/createDao/types';
import { BodyType } from '@/modules/createDao/types/enum';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { ITokenSetupGovernanceForm } from '../tokenSetupGovernance';
import type {
    ITokenSetupMembershipForm,
    ITokenSetupMembershipMember,
} from '../tokenSetupMembership';

export interface ITokenProposalCreationSettingsProps
    extends IPluginProposalCreationSettingsParams<
        ITokenSetupGovernanceForm,
        ITokenSetupMembershipMember,
        ITokenSetupMembershipForm
    > {}

export const TokenProposalCreationSettings: React.FC<
    ITokenProposalCreationSettingsProps
> = (props) => {
    const { body, formPrefix, mode, disableCheckbox } = props;

    const { t } = useTranslations();
    const { trigger, setValue } = useFormContext();

    invariant(
        body.type !== BodyType.EXTERNAL,
        'TokenProposalCreationSettings: External body type not expected here.',
    );

    const { type, name = '', description, membership } = body;
    const { totalSupply, decimals } = membership.token;

    const parsedTotalSupply =
        totalSupply && formatUnits(BigInt(totalSupply), decimals);

    const { value: canCreateProposal, onChange: onCreateProposalChange } =
        useFormField<ISetupBodyForm, 'canCreateProposal'>('canCreateProposal', {
            fieldPrefix: formPrefix,
            defaultValue: true,
        });

    const validateMinVotingPower = (value: string) => {
        // Only validate for minVotingPower to be greater than 0 when the plugin is selected
        if (!canCreateProposal || mode === ProposalCreationMode.ANY_WALLET) {
            return;
        }

        return Number(value) > 0;
    };

    const minVotingPowerFieldName = `${formPrefix}.governance.minProposerVotingPower`;
    const {
        onChange: onMinVotingPowerChange,
        value: minVotingPower,
        ...minVotingPowerField
    } = useFormField<ITokenSetupGovernanceForm, 'minProposerVotingPower'>(
        'minProposerVotingPower',
        {
            fieldPrefix: `${formPrefix}.governance`,
            defaultValue: '1',
            rules: { validate: validateMinVotingPower, min: 0 },
            label: t('app.plugins.token.tokenProposalCreationSettings.label'),
        },
    );

    const handleCheckedChange = (checked: CheckboxState) => {
        if (!disableCheckbox) {
            onCreateProposalChange(checked === true);
        }
    };

    // Trigger minVotingPower validation on mode and canCreateProposal change
    useEffect(() => {
        void trigger(minVotingPowerFieldName);
    }, [trigger, minVotingPowerFieldName]);

    useEffect(() => {
        const votingPower =
            mode === ProposalCreationMode.ANY_WALLET || !canCreateProposal
                ? '0'
                : '1';
        setValue(minVotingPowerFieldName, votingPower);
    }, [mode, canCreateProposal, minVotingPowerFieldName, setValue]);

    const checked = canCreateProposal;

    return (
        <CheckboxCard
            checked={checked}
            className="w-full"
            description={description}
            label={name}
            onCheckedChange={handleCheckedChange}
        >
            {
                // Stop onClick event propagation to avoid unchecking the card when clicking on the number-input buttons
                // biome-ignore lint/a11y/noStaticElementInteractions: inner click acceptable
                <object
                    className="text-left"
                    onClick={(event) => event.preventDefault()}
                    type="unknown"
                >
                    <InputNumber
                        disabled={type === BodyType.EXISTING}
                        helpText={t(
                            'app.plugins.token.tokenProposalCreationSettings.helpText',
                        )}
                        max={
                            totalSupply === '0' || parsedTotalSupply == null
                                ? undefined
                                : Number(parsedTotalSupply)
                        }
                        onChange={onMinVotingPowerChange}
                        placeholder={t(
                            'app.plugins.token.tokenProposalCreationSettings.placeholder',
                        )}
                        prefix="≥"
                        // For existing bodies, the conditions are already deployed, so the ability to edit the token requirement for proposal creation wouldn't make sense.
                        value={minVotingPower}
                        {...minVotingPowerField}
                    />
                </object>
            }
        </CheckboxCard>
    );
};
