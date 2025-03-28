import { ProposalCreationMode } from '@/modules/createDao/components/createProcessForm';
import type { ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import type { IPluginProposalCreationSettingsParams } from '@/modules/createDao/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { CheckboxCard, type CheckboxState, InputNumber } from '@aragon/gov-ui-kit';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { formatUnits } from 'viem';
import type { ITokenSetupGovernanceForm } from '../tokenSetupGovernance';
import type { ITokenSetupMembershipForm, ITokenSetupMembershipMember } from '../tokenSetupMembership';

export interface ITokenProposalCreationSettingsProps
    extends IPluginProposalCreationSettingsParams<
        ITokenSetupGovernanceForm,
        ITokenSetupMembershipMember,
        ITokenSetupMembershipForm
    > {}

export const TokenProposalCreationSettings: React.FC<ITokenProposalCreationSettingsProps> = (props) => {
    const { body, formPrefix, mode } = props;

    const { t } = useTranslations();
    const { trigger } = useFormContext();

    const [isChecked, setIsChecked] = useState(true);

    const { name, description, membership } = body;
    const { totalSupply, decimals } = membership.token;

    const parsedTotalSupply = formatUnits(BigInt(totalSupply), decimals);

    const validateMinVotingPower = (value: string) => {
        // Only validate for minVotingPower to be greater than 0 when the plugin is selected
        if (!isChecked || mode === ProposalCreationMode.ANY_WALLET) {
            return undefined;
        }

        return Number(value) > 0;
    };

    const { onChange: onCreateProposalChange } = useFormField<ISetupBodyForm, 'canCreateProposal'>(
        'canCreateProposal',
        { fieldPrefix: formPrefix },
    );

    const {
        onChange: onMinVotingPowerChange,
        value: minVotingPower,
        ...minVotingPowerField
    } = useFormField<ITokenSetupGovernanceForm, 'minProposerVotingPower'>('minProposerVotingPower', {
        fieldPrefix: `${formPrefix}.governance`,
        defaultValue: '1',
        rules: { validate: validateMinVotingPower, min: 0 },
        label: t('app.plugins.token.tokenProposalCreationSettings.label'),
    });

    const handleCheckedChange = (checked: CheckboxState) => {
        const isChecked = checked === true;
        onMinVotingPowerChange(isChecked ? '1' : '0');
        setIsChecked(isChecked);
    };

    // Trigger minVotingPower validation when checking / unchecking the card
    useEffect(() => {
        void trigger(`${formPrefix}.governance.minProposerVotingPower`);
    }, [trigger, formPrefix, isChecked]);

    // Make sure to set minVotingPower to 0 when user selects any-wallet
    useEffect(() => {
        if (mode === ProposalCreationMode.ANY_WALLET) {
            onMinVotingPowerChange('0');
        }
    }, [mode, onMinVotingPowerChange]);

    // Update the canCreateProposal generic field whenever the card is selected
    useEffect(() => {
        onCreateProposalChange(isChecked);
    }, [isChecked, onCreateProposalChange]);

    return (
        <CheckboxCard label={name} description={description} onCheckedChange={handleCheckedChange} checked={isChecked}>
            {
                // Stop onClick event propagation to avoid unchecking the card when clicking on the number-input buttons
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                <object onClick={(event) => event.preventDefault()} className="text-left" type="unknown">
                    <InputNumber
                        prefix="≥"
                        helpText={t('app.plugins.token.tokenProposalCreationSettings.helpText')}
                        placeholder={t('app.plugins.token.tokenProposalCreationSettings.placeholder')}
                        max={Number(parsedTotalSupply)}
                        onChange={onMinVotingPowerChange}
                        value={minVotingPower}
                        {...minVotingPowerField}
                    />
                </object>
            }
        </CheckboxCard>
    );
};
