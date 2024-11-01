import type { IProposalAction } from '@/modules/governance/api/governanceService';
import { useMemberExists } from '@/modules/governance/api/governanceService/queries/useMemberExists';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { AddressInput, addressUtils, Button, Card, Dropdown, IconType } from '@aragon/gov-ui-kit';

export interface IAddMemberItemProps {
    /**
     * The index of the resource item in the list.
     */
    index: number;
    /**
     * Callback to remove the resource item.
     */
    remove: (index: number) => void;
    /**
     * Action data.
     */
    action: IProposalActionData<IProposalAction>;
    /**
     * Field name of the main form.
     */
    fieldName: string;
}

export const AddMemberItem: React.FC<IAddMemberItemProps> = (props) => {
    const { index, remove, action, fieldName } = props;

    const { t } = useTranslations();

    const addressFieldName = `${fieldName}.[${index}].address`;
    const addressField = useFormField<Record<string, string>, string>(addressFieldName, {
        rules: {
            required: true,
            validate: (value) => addressUtils.isAddress(value) && !isMember,
        },
        defaultValue: '',
    });

    const memberExistsParams = { memberAddress: addressField?.value, pluginAddress: action.pluginAddress };
    const { data: isMember } = useMemberExists(
        { urlParams: memberExistsParams },
        { enabled: action.pluginAddress != null },
    );

    return (
        <Card className="flex flex-col gap-3 border border-neutral-100 p-6 shadow-neutral-sm md:flex-row md:gap-2">
            <AddressInput
                placeholder={t('app.plugins.multisig.multisigAddMembersAction.addressInput.placeholder')}
                {...addressField}
            />
            <Dropdown.Container
                constrainContentWidth={false}
                size="md"
                customTrigger={<Button variant="tertiary" size="lg" iconLeft={IconType.DOTS_VERTICAL} />}
            >
                <Dropdown.Item onClick={() => remove(index)}>
                    {t('app.plugins.multisig.multisigAddMembersAction.removeMember')}
                </Dropdown.Item>
            </Dropdown.Container>
        </Card>
    );
};
