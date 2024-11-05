import type { IProposalAction } from '@/modules/governance/api/governanceService';
import { useMemberExists } from '@/modules/governance/api/governanceService/queries/useMemberExists';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { MultisigDialogs } from '@/plugins/multisigPlugin/constants/multisigDialogs';
import type { IRemoveMemberDialogParams } from '@/plugins/multisigPlugin/dialogs/removeMemberDialog/removeMemberDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { AddressInput, addressUtils, Button, Card, Dropdown, IconType, InputContainer } from '@aragon/gov-ui-kit';

export interface IRemoveMemberItemProps {
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

export const RemoveMemberItem: React.FC<IRemoveMemberItemProps> = (props) => {
    const { index, remove, action, fieldName } = props;

    const { t } = useTranslations();

    const { open, close } = useDialogContext();

    const addressFieldName = `${fieldName}.[${index}].address`;
    const addressField = useFormField<Record<string, string>, string>(addressFieldName, {
        rules: {
            required: true,
            validate: (value) => addressUtils.isAddress(value) && isMember,
        },
        defaultValue: '',
    });
    const memberExistsParams = { memberAddress: addressField?.value, pluginAddress: action.pluginAddress };
    const { data: isMember } = useMemberExists(
        { urlParams: memberExistsParams },
        { enabled: action.pluginAddress != null },
    );

    const initialParams = {
        queryParams: { daoId: action.daoId, pluginAddress: action.pluginAddress },
    };
    const params: IRemoveMemberDialogParams = { initialParams, onMemberClick: addressField.onChange, close };

    const handleOpenDialog = () => {
        open(MultisigDialogs.MULTISIG_REMOVE_MEMBERS, { params });
    };

    return (
        <Card className="flex flex-col gap-3 border border-neutral-100 p-6 shadow-neutral-sm md:flex-row md:gap-2">
            <InputContainer id="" wrapperClassName="gap-2 pl-1.5 items-center" {...addressField}>
                <Button
                    variant="tertiary"
                    size="sm"
                    iconRight={IconType.CHEVRON_DOWN}
                    onClick={handleOpenDialog}
                    className="shrink-0"
                >
                    select
                </Button>
                <AddressInput
                    placeholder={t('app.plugins.multisig.addMembersAction.addressInput.placeholder')}
                    value={addressField.value}
                    onChange={addressField.onChange}
                />
            </InputContainer>
            <Dropdown.Container
                constrainContentWidth={false}
                size="md"
                customTrigger={<Button variant="tertiary" size="lg" iconLeft={IconType.DOTS_VERTICAL} />}
            >
                <Dropdown.Item onClick={() => remove(index)}>
                    {t('app.plugins.multisig.addMembersAction.removeMember')}
                </Dropdown.Item>
            </Dropdown.Container>
        </Card>
    );
};
