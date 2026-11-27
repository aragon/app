import { render, screen } from '@testing-library/react';
import { DateTime } from 'luxon';
import * as wagmi from 'wagmi';
import { AddressResolutionProvider, addressEntryKey, addressUtils } from '../../../../../core';
import { modulesCopy } from '../../../../assets';
import { ProposalStatus } from '../../proposalUtils';
import { ProposalDataListItemStructure } from './proposalDataListItemStructure';
import type { IProposalDataListItemStructureProps } from './proposalDataListItemStructure.api';

jest.mock('wagmi', () => ({ ...jest.requireActual<typeof wagmi>('wagmi'), useConnection: jest.fn() }));

jest.mock('viem/utils', () => ({ isAddress: jest.fn().mockReturnValue(true) }));

describe('<ProposalDataListItemStructure/> component', () => {
    const useConnectionMock = jest.spyOn(wagmi, 'useConnection');

    beforeEach(() => {
        useConnectionMock.mockReturnValue({
            address: '0x456',
            isConnected: true,
        } as unknown as wagmi.UseConnectionReturnType);
    });

    afterEach(() => {
        useConnectionMock.mockReset();
    });

    const createTestComponent = (props?: Partial<IProposalDataListItemStructureProps>) => {
        const defaultProps = {
            publisher: { address: '0x0000000000000000000000000000000000000000', link: '#' },
            status: ProposalStatus.ACTIVE,
            summary: 'Example Summary',
            title: 'Example Title',
            type: 'approvalThreshold',
            ...props,
        } as IProposalDataListItemStructureProps;

        return <ProposalDataListItemStructure {...defaultProps} />;
    };

    it('renders the children property to support custom proposal results', () => {
        const children = 'custom-results';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    it("renders 'You' as the publisher if the connected address is the publisher address", async () => {
        const publisher = { address: '0x0000000000000000000000000000000000000000', link: '#' };

        useConnectionMock.mockReturnValue({
            address: publisher.address,
            isConnected: true,
        } as unknown as wagmi.UseConnectionReturnType);

        render(createTestComponent({ publisher }));

        expect(await screen.findByRole('link', { name: 'You' })).toBeInTheDocument();
    });

    it('names a publisher without a name through the address resolution service, and keeps a given name', () => {
        const unnamed = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
        const named = '0x1111111111111111111111111111111111111111';
        const entries = new Map([
            [addressEntryKey(unnamed, 0), { label: 'Ops wallet', source: 'workspace' as const }],
            [addressEntryKey(named, 0), { label: 'Other name', source: 'workspace' as const }],
        ]);
        const publisher = [
            { address: unnamed, link: '#' },
            { address: named, name: 'Founder', link: '#' },
        ];

        render(
            <AddressResolutionProvider entries={entries}>
                {createTestComponent({ publisher })}
            </AddressResolutionProvider>,
        );

        expect(screen.getByText('Ops wallet')).toBeInTheDocument();
        expect(screen.getByText('Founder')).toBeInTheDocument();
        expect(screen.queryByText('Other name')).not.toBeInTheDocument();
    });

    it('renders multiple publishers', () => {
        const publishers = [
            { name: 'abc', link: '#', address: '0x0000000000000000000000000000000000000000' },
            { name: 'def', link: '#', address: '0x0000000000000000000000000000000000000000' },
        ];

        render(createTestComponent({ publisher: publishers }));

        publishers.forEach((publisher) => expect(screen.getByText(publisher.name)).toBeInTheDocument());
    });

    it(`renders '3+ creators' when the publishers are more than 3`, () => {
        const publishers = [
            { name: 'abc', link: '#', address: '0x0000000000000000000000000000000000000000' },
            { name: 'def', link: '#', address: '0x0000000000000000000000000000000000000000' },
            { name: 'ghi', link: '#', address: '0x0000000000000000000000000000000000000000' },
            { name: 'jkl', link: '#', address: '0x0000000000000000000000000000000000000000' },
        ];

        render(createTestComponent({ publisher: publishers }));

        expect(screen.getByText('3+ creators')).toBeInTheDocument();
    });

    it('renders with the given properties', () => {
        const testProps = {
            tag: 'OSx updates',
            publisher: { address: '0x0000000000000000000000000000000000000000', link: '#' },
            status: ProposalStatus.ACTIVE,
            summary: 'Example Summary',
            title: 'Example Title',
            type: 'approvalThreshold' as const,
            id: '0x1',
        };

        render(createTestComponent(testProps));

        expect(screen.getByText(testProps.title)).toBeInTheDocument();
        expect(screen.getByText(testProps.summary)).toBeInTheDocument();
        expect(
            screen.getByText(modulesCopy.proposalDataListItemStatus.statusLabel[testProps.status]),
        ).toBeInTheDocument();
        expect(screen.getByText(testProps.id)).toBeInTheDocument();
        expect(screen.getByText(testProps.tag)).toBeInTheDocument();
        expect(screen.getByText(addressUtils.truncateAddress(testProps.publisher.address))).toBeInTheDocument();
    });

    describe('date rendering', () => {
        it('renders the correct time left', () => {
            const date = DateTime.now().plus({ hours: 5, minutes: 15 }).toMillis();
            render(createTestComponent({ date }));
            const formattedDate = '5 hours left';
            expect(screen.getByText(formattedDate)).toBeInTheDocument();
        });

        it('renders the correct time ago', () => {
            const date = DateTime.now().minus({ hours: 5, minutes: 15 }).toMillis();
            render(createTestComponent({ date }));
            const formattedDate = '5 hours ago';
            expect(screen.getByText(formattedDate)).toBeInTheDocument();
        });
    });
});
