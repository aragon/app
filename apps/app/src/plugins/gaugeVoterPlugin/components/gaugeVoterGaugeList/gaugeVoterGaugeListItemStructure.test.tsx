import {
    AddressResolutionProvider,
    addressEntryKey,
    addressUtils,
    DataList,
} from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { generateGauge } from '../../testUtils';
import {
    GaugeVoterGaugeListItemStructure,
    type IGaugeVoterGaugeListItemStructureProps,
} from './gaugeVoterGaugeListItemStructure';

// The component imports the hook by its file path, which the shared mock does not cover.
jest.mock(
    '@/shared/components/translationsProvider/translationsProvider',
    () => ({ useTranslations: () => ({ t: (key: string) => key }) }),
);

describe('<GaugeVoterGaugeListItemStructure /> component', () => {
    const address = '0x1234567890123456789012345678901234567890';
    const entries = new Map([
        [
            addressEntryKey(address, 0),
            { label: 'Ops wallet', source: 'workspace' as const },
        ],
    ]);

    const renderItem = (
        props?: Partial<IGaugeVoterGaugeListItemStructureProps>,
    ) =>
        render(
            <AddressResolutionProvider entries={entries}>
                <DataList.Root entityLabel="gauges">
                    <DataList.Container>
                        <GaugeVoterGaugeListItemStructure
                            formattedTotalVotes="0"
                            formattedUserVotes="0"
                            gauge={generateGauge({ address })}
                            isUserConnected={false}
                            isUserVotesLoading={false}
                            isVotingPeriod={true}
                            onSelect={jest.fn()}
                            totalVotesValue={0}
                            {...props}
                        />
                    </DataList.Container>
                </DataList.Root>
            </AddressResolutionProvider>,
        );

    it('shows a named gauge by its name and its plain short address', () => {
        renderItem();

        expect(screen.getByText('Test Gauge')).toBeInTheDocument();
        expect(
            screen.getByText(addressUtils.truncateAddress(address)),
        ).toBeInTheDocument();
        expect(screen.queryByText('Ops wallet')).not.toBeInTheDocument();
    });

    it('shows an unnamed gauge by its address once, named by the address book', () => {
        renderItem({ gauge: generateGauge({ address, name: null }) });

        expect(screen.getAllByText('Ops wallet')).toHaveLength(1);
    });
});
