import { InputContainer, ToggleGroup, useRandomId } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import { VoteOption } from '../../../types';
import { TokenVotingOptionToggle } from './tokenVotingOptionToggle';

export interface ITokenVotingOptionsProps {
    /**
     * Is the proposal in optimistic/veto mode.
     */
    isVeto?: boolean;
    /**
     * Current selected vote option.
     */
    value?: string;
    /**
     * Callback to set the selected vote option.
     */
    onChange: (value?: string) => void;
    /**
     * Disables the options when set to true.
     */
    disableOptions?: boolean;
}

export const TokenVotingOptions: React.FC<ITokenVotingOptionsProps> = (props) => {
    const { isVeto, value: selectedValue, onChange, disableOptions } = props;
    const { t } = useTranslations();
    const id = useRandomId();

    const voteOptions = [
        {
            label: t('app.plugins.token.tokenSubmitVote.options.yes'),
            value: VoteOption.YES.toString(),
            variant: isVeto ? 'critical' : 'success',
            description: t(`app.plugins.token.tokenSubmitVote.options.${isVeto ? 'vetoYesDescription' : 'approveYesDescription'}`),
        },
        {
            label: t('app.plugins.token.tokenSubmitVote.options.abstain'),
            value: VoteOption.ABSTAIN.toString(),
            variant: 'neutral',
            description: undefined,
        },
        {
            label: t('app.plugins.token.tokenSubmitVote.options.no'),
            value: VoteOption.NO.toString(),
            variant: isVeto ? 'success' : 'critical',
            description: t(`app.plugins.token.tokenSubmitVote.options.${isVeto ? 'vetoNoDescription' : 'approveNoDescription'}`),
        },
    ] as const;

    return (
        <InputContainer
            id={id}
            label={t('app.plugins.token.tokenSubmitVote.options.label', {
                label: isVeto
                    ? t('app.plugins.token.tokenSubmitVote.options.vetoLabel')
                    : t('app.plugins.token.tokenSubmitVote.options.approveLabel'),
            })}
            useCustomWrapper={true}
        >
            <ToggleGroup isMultiSelect={false} onChange={onChange} orientation="vertical" value={selectedValue ?? ''}>
                {voteOptions.map(({ label, value, variant, description }) => (
                    <TokenVotingOptionToggle
                        description={description}
                        disabled={disableOptions}
                        isSelected={value === selectedValue}
                        key={value}
                        label={label}
                        value={value}
                        variant={variant}
                    />
                ))}
            </ToggleGroup>
        </InputContainer>
    );
};
