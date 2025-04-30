import { addressUtils } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { GovernanceBodyInfo, type IGovernanceBodyInfoProps } from './governanceBodyInfo';

describe('<GovernanceBodyInfo /> component', () => {
    const createTestComponent = (props?: Partial<IGovernanceBodyInfoProps>) => {
        const completeProps: IGovernanceBodyInfoProps = {
            ...props,
        };

        return <GovernanceBodyInfo {...completeProps} />;
    };

    it('throws error if neither address nor subdomain is provided', () => {
        expect(() => render(createTestComponent())).toThrow();
    });

    it('renders the subdomain (parsed) and version when provided', () => {
        const subdomain = 'token-voting';
        const release = '2';
        const build = '4';
        render(createTestComponent({ subdomain, release, build }));

        expect(screen.getByText('Token Voting v2.4')).toBeInTheDocument();
    });

    it('renders the name, address and external subtitle when both are defined', () => {
        const name = 'test.eth';
        const address = '0xB017BB3D282a542Ef521F9052Eba61F1e79FC6E8';
        render(createTestComponent({ name, address }));

        expect(screen.getByText(name)).toBeInTheDocument();
        expect(screen.getByText(addressUtils.truncateAddress(address))).toBeInTheDocument();
        expect(screen.getByText(/governanceBodyInfo.external/)).toBeInTheDocument();
    });
});
