'use client';

import { Dropdown } from '@aragon/gov-ui-kit';
import { CreateDaoDialogId } from '@/modules/createDao/constants/createDaoDialogId';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useCreateSafeAccount } from '../../hooks/useCreateSafeAccount';

export interface IWorkspaceCreateAccountDropdownProps {}

/**
 * Lets the user create a new account for the workspace of the route: an Aragon DAO or a Safe.
 */
export const WorkspaceCreateAccountDropdown: React.FC<
    IWorkspaceCreateAccountDropdownProps
> = () => {
    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { createSafe } = useCreateSafeAccount();

    const handleCreateDao = () => open(CreateDaoDialogId.CREATE_DAO_DETAILS);

    const translationKey = 'app.workspace.workspaceCreateAccountDropdown';

    return (
        <Dropdown.Container
            label={t(`${translationKey}.label`)}
            variant="secondary"
        >
            <Dropdown.Item onClick={handleCreateDao}>
                {t(`${translationKey}.dao`)}
            </Dropdown.Item>
            <Dropdown.Item onClick={createSafe}>
                {t(`${translationKey}.safe`)}
            </Dropdown.Item>
        </Dropdown.Container>
    );
};
