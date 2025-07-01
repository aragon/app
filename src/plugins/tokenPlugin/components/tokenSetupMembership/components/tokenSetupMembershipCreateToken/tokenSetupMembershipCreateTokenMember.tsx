import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { addressesListUtils } from '@/shared/utils/addressesListUtils';
import {
    AddressInput,
    Button,
    Dropdown,
    type IAddressInputResolvedValue,
    IconType,
    InputNumber,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useCallback, useState } from 'react';
import type { ITokenSetupMembershipForm, ITokenSetupMembershipMember } from '../../tokenSetupMembership.api';

export interface ITokenSetupMembershipCreateTokenMemberProps {
    /**
     * Prefix to be prepended to all form fields.
     */
    formPrefix: string;
    /**
     * Initial value of the member address.
     */
    initialValue: string;
    /**
     * Callback triggered on remove button click.
     */
    onRemove?: () => void;
    /**
     * Current index of this member in the array.
     */
    index: number;
    /**
     * All members in the list for duplicate checking.
     */
    members: ITokenSetupMembershipForm['members'];
}
export const TokenSetupMembershipCreateTokenMember: React.FC<ITokenSetupMembershipCreateTokenMemberProps> = (props) => {
    const { formPrefix, onRemove, initialValue, index, members } = props;

    const { t } = useTranslations();

    const [memberInput, setMemberInput] = useState<string | undefined>(initialValue);

    const {
        onChange: onMemberChange,
        value: memberValue,
        ...memberField
    } = useFormField<ITokenSetupMembershipMember, 'address'>('address', {
        label: t('app.plugins.token.tokenSetupMembership.createToken.member.address.label'),
        rules: {
            required: true,
            validate: (address) => addressesListUtils.validateAddress(address, members, index),
        },
        fieldPrefix: formPrefix,
    });

    const tokenAmountField = useFormField<ITokenSetupMembershipMember, 'tokenAmount'>('tokenAmount', {
        label: t('app.plugins.token.tokenSetupMembership.createToken.member.tokens.label'),
        rules: { required: true, validate: (value) => Number(value) > 0, min: 0 },
        defaultValue: 1,
        fieldPrefix: formPrefix,
    });

    const handleAddressAccept = useCallback(
        (value?: IAddressInputResolvedValue) => onMemberChange(value?.address ?? ''),
        [onMemberChange],
    );

    return (
        <div className="flex items-end gap-x-4 rounded-xl border border-neutral-100 p-6">
            <div className="flex w-full flex-col gap-4 md:flex-row">
                <AddressInput
                    placeholder={t('app.plugins.token.tokenSetupMembership.createToken.member.address.placeholder')}
                    value={memberInput}
                    onChange={setMemberInput}
                    onAccept={handleAddressAccept}
                    className="basis-[65%]"
                    {...memberField}
                />
                <InputNumber className="basis-1/3" min={0} {...tokenAmountField} />
            </div>
            {onRemove != null && (
                <Dropdown.Container
                    customTrigger={
                        <Button
                            variant="tertiary"
                            iconLeft={IconType.DOTS_VERTICAL}
                            className={classNames(
                                'shrink-0',
                                memberField.alert?.message || tokenAmountField.alert?.message
                                    ? 'md:self-center'
                                    : 'md:self-end',
                            )}
                        />
                    }
                >
                    <Dropdown.Item onClick={onRemove}>
                        {t('app.plugins.token.tokenSetupMembership.createToken.member.action.remove')}
                    </Dropdown.Item>
                </Dropdown.Container>
            )}
        </div>
    );
};
