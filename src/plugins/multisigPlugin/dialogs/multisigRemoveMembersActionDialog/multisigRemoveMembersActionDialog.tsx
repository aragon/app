import type { IMember } from '@/modules/governance/api/governanceService';
import { DaoMemberList } from '@/modules/governance/components/daoMemberList';
import { IDialogComponentProps, useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { Dialog, invariant } from '@aragon/gov-ui-kit';

export interface IMultisigRemoveMembersActionDialogParams {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Address of the current plugin,
     */
    pluginAddress: string;
    /**
     * Callback called on token click.
     */
    onMemberClick: (address: string) => void;
}

export interface IMultisigRemoveMembersActionDialogProps
    extends IDialogComponentProps<IMultisigRemoveMembersActionDialogParams> {}

export const MultisigRemoveMembersActionDialog: React.FC<IMultisigRemoveMembersActionDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'TokenDelegationFormDialog: required parameters must be set.');

    const { daoId, pluginAddress, onMemberClick } = location.params;

    const { t } = useTranslations();
    const { close } = useDialogContext();
    const [multisigPlugin] = useDaoPlugins({ daoId, pluginAddress, includeSubPlugins: true })!;

    const membersParams = { queryParams: { daoId, pluginAddress } };

    const handleMemberClicked = (member: IMember) => {
        onMemberClick(member.address);
        close();
    };

    return (
        <>
            <Dialog.Header
                title={t('app.plugins.multisig.multisigRemoveMembersAction.dialog.heading')}
                onClose={close}
            />
            <Dialog.Content className="pb-4">
                <DaoMemberList.Default
                    initialParams={membersParams}
                    plugin={multisigPlugin.meta}
                    layoutClassNames="grid grid-cols-2"
                    onMemberClick={handleMemberClicked}
                />
            </Dialog.Content>
        </>
    );
};
