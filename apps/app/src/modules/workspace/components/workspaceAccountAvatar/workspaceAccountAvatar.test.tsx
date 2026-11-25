import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
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

    it.each([WorkspaceAccountType.DAO, WorkspaceAccountType.SAFE])(
        'badges a %s avatar with its network',
        (type) => {
            render(
                createTestComponent({
                    type,
                    network: Network.ETHEREUM_SEPOLIA,
                }),
            );

            const { name } = networkDefinitions[Network.ETHEREUM_SEPOLIA];
            expect(screen.getByRole('img', { name })).toBeInTheDocument();
        },
    );

    it('renders no network badge without a network', () => {
        render(createTestComponent({ name: 'Demo DAO' }));

        // A DAO without an avatar shows its initials, so any image would be a badge.
        expect(screen.queryAllByRole('img')).toHaveLength(0);
    });
});
