import { useTranslations } from '@/shared/components/translationsProvider';
import {
    addressUtils,
    type IDefinitionListContainerProps,
    IDefinitionListItemProps,
    type ILinkProps,
} from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { FinanceDetailsList, type IFinanceDetailsListProps } from './financeDetailsList';

jest.mock('@/shared/components/translationsProvider', () => ({
    useTranslations: jest.fn(),
}));

jest.mock('@/shared/components/page', () => ({
    Page: {
        Section: (props: { title: string; children: React.ReactNode }) => <div {...props} />,
    },
}));

jest.mock('@aragon/ods', () => ({
    ...jest.requireActual('@aragon/ods'),
    DefinitionList: {
        Container: (props: IDefinitionListContainerProps) => <dl {...props} />,
        Item: (props: IDefinitionListItemProps) => <div {...props} />,
    },
    Link: ({ children, iconRight, ...otherProps }: ILinkProps) => <a {...otherProps}>{children}</a>,
    addressUtils: {
        truncateAddress: jest.fn((address: string) => `truncated-${address}`),
    },
}));

describe('<FinanceDetailsList /> component', () => {
    const useTranslationsMock = useTranslations as jest.Mock;

    const createTestComponent = (props?: Partial<IFinanceDetailsListProps>) => {
        const defaultProps: IFinanceDetailsListProps = {
            network: 'Ethereum',
            vaultAddress: '0x123',
            ensAddress: 'dao.eth',
            ...props,
        };

        return <FinanceDetailsList {...defaultProps} />;
    };

    beforeEach(() => {
        jest.clearAllMocks();
        useTranslationsMock.mockReturnValue({
            t: (key: string) => key,
        });
    });

    it('renders the finance details list with all provided props', () => {
        const network = 'Polygon';
        const vaultAddress = '0x321';
        const ensAddress = 'dao.polygon';
        render(createTestComponent({ network, vaultAddress, ensAddress }));
        expect(screen.getByText(network)).toBeInTheDocument();
        expect(screen.getByText(`truncated-${vaultAddress}`)).toBeInTheDocument();
        expect(screen.getByText(ensAddress)).toBeInTheDocument();
    });

    it('renders the finance details list with missing ensAddress', () => {
        const ensAddress = null;
        render(createTestComponent({ ensAddress }));
        expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('renders the finance details list with missing network', () => {
        const network = undefined;
        render(createTestComponent({ network }));
        expect(screen.getByText('Unknown Network')).toBeInTheDocument();
    });

    it('calls addressUtils.truncateAddress with the correct address', () => {
        const vaultAddress = '0xVau1t';
        render(createTestComponent({ vaultAddress }));
        expect(addressUtils.truncateAddress).toHaveBeenCalledWith(vaultAddress);
    });
});
