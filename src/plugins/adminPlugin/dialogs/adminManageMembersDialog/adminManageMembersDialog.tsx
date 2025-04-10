import { useMemberList } from '@/modules/governance/api/governanceService';
import { GovernanceDialogId } from '@/modules/governance/constants/governanceDialogId';
import type { IPublishProposalDialogParams } from '@/modules/governance/dialogs/publishProposalDialog';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { AddressesInput } from '@/shared/components/forms/addressesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { addressUtils, Dialog, invariant, type ICompositeAddress } from '@aragon/gov-ui-kit';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import type { Hex } from 'viem';
import { adminManageMembersDialogUtils } from './adminManageMembersDialogUtils';

export interface IAdminManageMembersDialogParams {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Address of the admin plugin.
     */
    pluginAddress: string;
}
export interface IAdminManageMembersDialogProps extends IDialogComponentProps<IAdminManageMembersDialogParams> {}

export interface IManageMembersFormData {
    /**
     * List of members in the form.
     */
    members: ICompositeAddress[];
}

const formId = 'manageAdminsForm';

export const AdminManageMembersDialog: React.FC<IAdminManageMembersDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'AdminManageMembersDialog: required parameters must be set.');

    const { daoId, pluginAddress } = location.params;

    const { t } = useTranslations();

    const { open, close } = useDialogContext();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    invariant(dao != null, 'ManageAdminsDialogPublish: DAO data must be set.');

    // TODO: (APP-4045). Setting this to the max pageSize of 300 for now to ensure we get all of the data
    // in the future we should find a better way to handle this.
    const memberParams = { daoId, pluginAddress, pageSize: 300 };
    const { data: memberList } = useMemberList({ queryParams: memberParams });
    const [adminPlugin] = useDaoPlugins({ daoId, subdomain: 'admin' }) ?? [];

    const currentAdmins = useMemo(() => {
        return memberList?.pages.flatMap((page) => page.data) ?? [];
    }, [memberList]);

    const initialMembers = useMemo(() => currentAdmins.map((member) => ({ address: member.address })), [currentAdmins]);

    const formMethods = useForm<IManageMembersFormData>({
        defaultValues: {
            members: initialMembers,
        },
        mode: 'onTouched',
    });

    const { handleSubmit, control, reset } = formMethods;

    const watchMembersField = useWatch({ name: 'members', control });

    const haveMembersChanged = useMemo(() => {
        const initialMembers = currentAdmins.map((member) => member.address);
        const newMembers = watchMembersField.map((field) => field.address);

        if (initialMembers.length !== newMembers.length) {
            return true;
        }

        return !initialMembers.every((initialAddress) =>
            newMembers.some((newAddress) => addressUtils.isAddressEqual(initialAddress, newAddress)),
        );
    }, [watchMembersField, currentAdmins]);

    const handleSubmitAddresses = (data: IManageMembersFormData) => {
        const proposalMetadata = adminManageMembersDialogUtils.prepareProposalMetadata();
        const actionsParams = {
            currentAdmins,
            updatedAdmins: data.members,
            pluginAddress: pluginAddress as Hex,
            daoAddress: dao.address as Hex,
        };

        const actions = adminManageMembersDialogUtils.buildActionsArray(actionsParams);

        const params: IPublishProposalDialogParams = {
            proposal: { ...proposalMetadata, resources: [], actions },
            daoId,
            plugin: adminPlugin.meta,
            prepareActions: {},
        };
        open(GovernanceDialogId.PUBLISH_PROPOSAL, { params });
    };

    // Re-initialise the initial members on the form after fetching the members list
    useEffect(() => {
        reset({ members: initialMembers });
    }, [initialMembers, reset]);

    return (
        <FormProvider {...formMethods}>
            <Dialog.Header onClose={close} title={t('app.plugins.admin.adminManageMembers.dialog.title')} />
            <Dialog.Content description={t('app.plugins.admin.adminManageMembers.dialog.description')}>
                <form
                    className="flex w-full flex-col gap-3 pb-6 md:gap-2"
                    onSubmit={handleSubmit(handleSubmitAddresses)}
                    id={formId}
                >
                    <AddressesInput.Container name="members" allowEmptyList={true}>
                        {watchMembersField.map((field, index) => (
                            <AddressesInput.Item key={index} index={index} />
                        ))}
                    </AddressesInput.Container>
                </form>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t('app.plugins.admin.adminManageMembers.dialog.action.update'),
                    type: 'submit',
                    form: formId,
                    disabled: !haveMembersChanged,
                }}
                secondaryAction={{
                    label: t('app.plugins.admin.adminManageMembers.dialog.action.cancel'),
                    onClick: () => close(),
                }}
            />
        </FormProvider>
    );
};
