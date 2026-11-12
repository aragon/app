import { render, screen } from '@testing-library/react';
import { WorkspaceAccountType } from '../../api/workspaceService';
import {
    type IWorkspaceAccountAvatarProps,
    WorkspaceAccountAvatar,
} from './workspaceAccountAvatar';

describe('<WorkspaceAccountAvatar /> component', () => {
    const createTestComponent = (
        props?: Partial<IWorkspaceAccountAvatarProps>,
    ) => {
        const completeProps: IWorkspaceAccountAvatarProps = {
            type: WorkspaceAccountType.DAO,
            ...props,
        };

        return <WorkspaceAccountAvatar {...completeProps} />;
    };

    it('stands the initials of a DAO in for its missing avatar', () => {
        render(createTestComponent({ name: 'Demo DAO' }));

        expect(screen.getByText('DD')).toBeInTheDocument();
    });

    it('does not stand initials in for the avatar of a Safe', () => {
        render(
            createTestComponent({
                type: WorkspaceAccountType.SAFE,
                name: 'Treasury Safe',
            }),
        );

        expect(screen.queryByText('TS')).not.toBeInTheDocument();
    });
});
