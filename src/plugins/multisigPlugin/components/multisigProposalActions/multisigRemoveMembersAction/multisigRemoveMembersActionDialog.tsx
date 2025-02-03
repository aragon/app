import type { IMember } from '@/modules/governance/api/governanceService';
import { DaoMemberList } from '@/modules/governance/components/daoMemberList';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { Dialog, type IDialogRootProps } from '@aragon/gov-ui-kit';

export interface IMultisigRemoveMembersActionDialogProps extends Pick<IDialogRootProps, 'open' | 'onOpenChange'> {
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

export const MultisigRemoveMembersActionDialog: React.FC<IMultisigRemoveMembersActionDialogProps> = (props) => {
    const { daoId, pluginAddress, onMemberClick, open, onOpenChange } = props;

    const { t } = useTranslations();
    const [multisigPlugin] = useDaoPlugins({ daoId, pluginAddress, includeSubPlugins: true })!;

    const membersParams = { queryParams: { daoId, pluginAddress } };

    const handleMemberClicked = (member: IMember) => {
        onMemberClick(member.address);
        onOpenChange?.(false);
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
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
        </Dialog.Root>
    );
};
