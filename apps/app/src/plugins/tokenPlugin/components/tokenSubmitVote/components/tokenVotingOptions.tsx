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
    /**
     * Options that cannot be selected, each with an optional reason displayed next to the option label.
     */
    disabledOptions?: IDisabledVotingOption[];
    /**
     * Disables all options but "No" for objection-stage proposals, where only objecting is allowed.
     */
    isObjection?: boolean;
}

export interface IDisabledVotingOption {
    /**
     * Value of the vote option that cannot be selected.
     */
    value: string;
    /**
     * Reason why the option cannot be selected.
     */
    reason?: string;
}

export const TokenVotingOptions: React.FC<ITokenVotingOptionsProps> = (
    props,
) => {
    const {
        isVeto,
        value: selectedValue,
        onChange,
        disableOptions,
        disabledOptions,
        isObjection,
    } = props;
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
            label: t(
                `app.plugins.token.tokenSubmitVote.options.${isObjection ? 'object' : 'no'}`,
            ),
            value: VoteOption.NO.toString(),
            variant: isVeto && !isObjection ? 'success' : 'critical',
            description: isObjection
                ? t(
                      'app.plugins.token.tokenSubmitVote.options.objectionDescription',
                  )
                : t(
                      `app.plugins.token.tokenSubmitVote.options.${isVeto ? 'vetoNoDescription' : 'approveNoDescription'}`,
                  ),
        },
    ] as const;

    return (
        <InputContainer
            helpText={
                isObjection
                    ? t(
                          'app.plugins.token.tokenSubmitVote.options.objectionHelpText',
                      )
                    : undefined
            }
            id={id}
            label={t('app.plugins.token.tokenSubmitVote.options.label', {
                label: isObjection
                    ? t(
                          'app.plugins.token.tokenSubmitVote.options.objectionLabel',
                      )
                    : isVeto
                      ? t('app.plugins.token.tokenSubmitVote.options.vetoLabel')
                      : t(
                            'app.plugins.token.tokenSubmitVote.options.approveLabel',
                        ),
            })}
            useCustomWrapper={true}
        >
            <ToggleGroup
                isMultiSelect={false}
                // The toggle group emits an empty string when the selected option is clicked again, normalize the
                // value so that consumers only ever receive a valid vote option or undefined.
                onChange={(value) => onChange(value === '' ? undefined : value)}
                orientation="vertical"
                value={selectedValue ?? ''}
            >
                {voteOptions.map(({ label, value, variant, description }) => {
                    const disabledOption = disabledOptions?.find(
                        (option) => option.value === value,
                    );

                    return (
                        <TokenVotingOptionToggle
                            description={
                                disabledOption?.reason != null
                                    ? ` — ${disabledOption.reason}`
                                    : description
                            }
                            disabled={
                                disableOptions === true ||
                                disabledOption != null ||
                                (isObjection === true &&
                                    value !== VoteOption.NO.toString())
                            }
                            isSelected={value === selectedValue}
                            key={value}
                            label={label}
                            value={value}
                            variant={variant}
                        />
                    );
                })}
            </ToggleGroup>
        </InputContainer>
    );
};
