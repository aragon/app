import { generateToken } from '@/modules/finance/testUtils';
import * as DaoService from '@/shared/api/daoService';
import { generateDao, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { generateDaoTokenSettings } from '../../testUtils';
import { DaoTokenVotingMode } from '../../types';
import { TokenProposalsPageDetails, type ITokenProposalsPageDetailsProps } from './tokenProposalsPageDetails';

describe('<TokenProposalsPageDetails /> component', () => {
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');
    const useDaoSettingsSpy = jest.spyOn(DaoService, 'useDaoSettings');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDaoTokenSettings() }));
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useDaoSettingsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITokenProposalsPageDetailsProps>) => {
        const completeProps: ITokenProposalsPageDetailsProps = {
            daoId: 'dao-id',
            ...props,
        };

        return (
            <OdsModulesProvider>
                <TokenProposalsPageDetails {...completeProps} />
            </OdsModulesProvider>
        );
    };

    it('renders contract info', () => {
        const settings = generateDaoTokenSettings({ pluginSubdomain: 'token-voting' });
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: settings }));

        render(createTestComponent());
        expect(screen.getByText(/tokenProposalsPageDetails.contract/)).toBeInTheDocument();
        expect(screen.getByText('Token Voting')).toBeInTheDocument();
    });

    it('renders support threshold', () => {
        const settings = generateDaoTokenSettings({
            settings: {
                ...generateDaoTokenSettings().settings,
                supportThreshold: 510000,
            },
        });
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: settings }));

        render(createTestComponent());
        expect(screen.getByText(/tokenProposalsPageDetails.supportThreshold/)).toBeInTheDocument();
        expect(screen.getByText('> 51%')).toBeInTheDocument();
    });

    it('renders minimum participation', () => {
        const settings = generateDaoTokenSettings({
            settings: {
                ...generateDaoTokenSettings().settings,
                minParticipation: 50000,
            },
        });
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: settings }));

        render(createTestComponent());
        expect(screen.getByText(/tokenProposalsPageDetails.minimumParticipation/)).toBeInTheDocument();
        expect(screen.getByText('≥ 5%')).toBeInTheDocument();
    });

    it('renders minimum duration', () => {
        const settings = generateDaoTokenSettings({
            settings: {
                ...generateDaoTokenSettings().settings,
                minDuration: 86400,
            },
        });
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: settings }));

        render(createTestComponent());
        expect(screen.getByText(/tokenProposalsPageDetails.minimumDuration/)).toBeInTheDocument();
        expect(screen.getByText('1 day')).toBeInTheDocument();
    });

    it('renders yearly execution', async () => {
        const settings = generateDaoTokenSettings({
            settings: {
                ...generateDaoTokenSettings().settings,
                votingMode: DaoTokenVotingMode.EARLY_EXECUTION,
            },
        });
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: settings }));

        render(createTestComponent());
        expect(screen.getByText(/tokenProposalsPageDetails.earlyExecution/)).toBeInTheDocument();
        expect(screen.getByText(/tokenProposalsPageDetails.yes/)).toBeInTheDocument();
    });

    it('renders vote change', () => {
        const settings = generateDaoTokenSettings({
            settings: {
                ...generateDaoTokenSettings().settings,
                votingMode: DaoTokenVotingMode.VOTE_REPLACEMENT,
            },
        });
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: settings }));

        render(createTestComponent());
        expect(screen.getByText(/tokenProposalsPageDetails.voteChange/)).toBeInTheDocument();
        expect(screen.getByText(/tokenProposalsPageDetails.yes/)).toBeInTheDocument();
    });

    it('renders info regarding who can create proposals', () => {
        const token = generateToken({
            symbol: 'test',
            decimals: 18,
        });
        const settings = generateDaoTokenSettings({
            settings: {
                ...generateDaoTokenSettings().settings,
                minProposerVotingPower: '5e+23',
            },
            token: token,
        });
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: settings }));
        render(createTestComponent());
        expect(screen.getByText(/tokenProposalsPageDetails.proposalCreation$/)).toBeInTheDocument();
        expect(
            screen.getByText(/tokenProposalsPageDetails.proposalCreationAccess \(balance=500,000 \$test\)/),
        ).toBeInTheDocument();
    });
});
