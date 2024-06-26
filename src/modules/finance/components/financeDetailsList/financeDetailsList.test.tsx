import { networkDefinitions, type IDao, type IDaoMetrics, type Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    addressUtils,
    type IDefinitionListContainerProps,
    type IDefinitionListItemProps,
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

    const createTestComponent = (props: Partial<IFinanceDetailsListProps>) => {
        const defaultDao: IDao = {
            id: 'dao-id',
            name: 'DAO Name',
            description: 'DAO Description',
            avatar: 'dao-avatar',
            network: 'polygon-mainnet' as Network,
            address: '0x321',
            ens: 'dao.polygon',
            isSupported: true,
            plugins: [],
            tvlUSD: '',
            metrics: { proposalsCreated: 0, members: 1 },
        };

        const defaultProps: IFinanceDetailsListProps = {
            dao: { ...defaultDao, ...props.dao },
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
        const network = 'ethereum-mainnet' as Network;
        const dao: IDao = {
            id: 'dao-id',
            name: 'DAO Name',
            description: 'DAO Description',
            avatar: 'dao-avatar',
            network,
            address: '0x321',
            ens: 'dao.polygon',
            isSupported: true,
            plugins: [],
            tvlUSD: '',
            metrics: { proposalsCreated: 0, members: 1 },
        };
        render(createTestComponent({ dao }));
        expect(screen.getByText(networkDefinitions[network].name)).toBeInTheDocument();
        expect(screen.getByText('truncated-0x321')).toBeInTheDocument();
        expect(screen.getByText('dao.polygon')).toBeInTheDocument();
    });

    it('does not render the ensAddress if it is missing', () => {
        const dao: IDao = {
            id: 'dao-id',
            name: 'DAO Name',
            description: 'DAO Description',
            avatar: 'dao-avatar',
            network: 'polygon-mainnet' as Network,
            address: '0x321',
            ens: null,
            isSupported: true,
            plugins: [],
            tvlUSD: '',
            metrics: {} as IDaoMetrics,
        };
        render(createTestComponent({ dao }));
        expect(screen.queryByText('dao.polygon')).not.toBeInTheDocument();
    });

    it('calls addressUtils.truncateAddress with the correct address', () => {
        const dao: IDao = {
            id: 'dao-id',
            name: 'DAO Name',
            description: 'DAO Description',
            avatar: 'dao-avatar',
            network: 'polygon-mainnet' as Network,
            address: '0xVau1t',
            ens: 'dao.polygon',
            isSupported: true,
            plugins: [],
            tvlUSD: '',
            metrics: { proposalsCreated: 0, members: 1 },
        };
        render(createTestComponent({ dao }));
        expect(addressUtils.truncateAddress).toHaveBeenCalledWith('0xVau1t');
    });
});
