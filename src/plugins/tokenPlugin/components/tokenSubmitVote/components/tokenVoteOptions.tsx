import { useTranslations } from '@/shared/components/translationsProvider';
import { InputContainer, ToggleGroup, useRandomId } from '@aragon/gov-ui-kit';
import { VoteOption } from '../../../types';
import { TokenVoteOptionToggle } from './tokenVoteOptionToggle';

export interface ITokenVoteOptionsProps {
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
    onChange: (value: string | undefined) => void;
}

export const TokenVoteOptions: React.FC<ITokenVoteOptionsProps> = (props) => {
    const { isVeto, value: selectedValue, onChange } = props;
    const { t } = useTranslations();
    const id = useRandomId();

    const voteOptions = [
        {
            label: t('app.plugins.token.tokenSubmitVote.options.yes'),
            value: VoteOption.YES.toString(),
            variant: isVeto ? 'critical' : 'success',
            description: t(
                `app.plugins.token.tokenSubmitVote.options.${isVeto ? 'vetoYesDescription' : 'approveYesDescription'}`,
            ),
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
            description: t(
                `app.plugins.token.tokenSubmitVote.options.${isVeto ? 'vetoNoDescription' : 'approveNoDescription'}`,
            ),
        },
    ] as const;

    return (
        <InputContainer
            id={id}
            useCustomWrapper={true}
            label={t('app.plugins.token.tokenSubmitVote.options.label', {
                label: isVeto
                    ? t('app.plugins.token.tokenSubmitVote.options.vetoLabel')
                    : t('app.plugins.token.tokenSubmitVote.options.approveLabel'),
            })}
        >
            <ToggleGroup isMultiSelect={false} orientation="vertical" value={selectedValue ?? ''} onChange={onChange}>
                {voteOptions.map(({ label, value, variant, description }) => (
                    <TokenVoteOptionToggle
                        key={value}
                        label={label}
                        value={value}
                        isSelected={value === selectedValue}
                        variant={variant}
                        description={description}
                    />
                ))}
            </ToggleGroup>
        </InputContainer>
    );
};
