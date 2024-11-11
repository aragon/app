import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { AddressInput, Button, Card, Dropdown, type ICompositeAddress, IconType } from '@aragon/gov-ui-kit';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

export interface IMultisigRemoveMembersActionItemProps {
    /**
     * The index of the resource item in the list.
     */
    index: number;
    /**
     * Callback to remove the resource item.
     */
    remove: (index: number) => void;
    /**
     * Field name of the main form.
     */
    fieldName: string;
    /**
     * Defines if the current field is already on the list.
     */
    isAlreadyInList: boolean;
}

export const MultisigRemoveMembersActionItem: React.FC<IMultisigRemoveMembersActionItemProps> = (props) => {
    const { index, remove, fieldName, isAlreadyInList } = props;

    const { t } = useTranslations();
    const { trigger } = useFormContext();

    const memberFieldName = `${fieldName}.[${index}]`;
    const {
        value: memberValue,
        onChange,
        label,
        ...memberField
    } = useFormField<Record<string, ICompositeAddress>, string>(memberFieldName, {
        label: 'Member',
        rules: { validate: () => !isAlreadyInList },
    });

    const [addressInputValue, setAddressInputValue] = useState<string | undefined>(memberValue.address);

    useEffect(() => {
        trigger(memberFieldName);
    }, [trigger, memberFieldName, isAlreadyInList]);

    return (
        <Card className="flex flex-col gap-3 border border-neutral-100 p-6 shadow-neutral-sm md:flex-row md:gap-2">
            <AddressInput
                chainId={1}
                placeholder={t('app.plugins.multisig.multisigRemoveMembersAction.addressInput.placeholder')}
                disabled={true}
                value={addressInputValue}
                onChange={setAddressInputValue}
                {...memberField}
            />
            <Dropdown.Container
                constrainContentWidth={false}
                size="md"
                customTrigger={<Button variant="tertiary" size="lg" iconLeft={IconType.DOTS_VERTICAL} />}
            >
                <Dropdown.Item onClick={() => remove(index)}>
                    {t('app.plugins.multisig.multisigRemoveMembersAction.removeMember')}
                </Dropdown.Item>
            </Dropdown.Container>
        </Card>
    );
};
