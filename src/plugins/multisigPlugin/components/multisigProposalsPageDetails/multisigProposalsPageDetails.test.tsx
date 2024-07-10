import * as DaoService from '@/shared/api/daoService';
import { generateDao, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { generateDaoMultisigSettings } from '../../testUtils';
import { MultisigProposalsPageDetails, type IMultisigProposalsPageDetailsProps } from './multisigProposalsPageDetails';

describe('<MultisigProposalsPageDetails /> component', () => {
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');
    const useDaoSettingsSpy = jest.spyOn(DaoService, 'useDaoSettings');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDaoMultisigSettings() }));
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useDaoSettingsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IMultisigProposalsPageDetailsProps>) => {
        const completeProps: IMultisigProposalsPageDetailsProps = {
            daoId: 'dao-id',
            ...props,
        };

        return (
            <OdsModulesProvider>
                <MultisigProposalsPageDetails {...completeProps} />
            </OdsModulesProvider>
        );
    };

    it('renders contract info', () => {
        const settings = generateDaoMultisigSettings({ pluginSubdomain: 'multisig' });
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: settings }));

        render(createTestComponent());
        expect(screen.getByText(/multisigProposalsPageDetails.contract/)).toBeInTheDocument();
        expect(screen.getByText('Multisig')).toBeInTheDocument();
    });

    it('renders minimum approval info', () => {
        const dao = generateDao({
            metrics: { ...generateDao().metrics, members: 5 },
        });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));

        const settings = generateDaoMultisigSettings({
            pluginSubdomain: 'multisig',
            settings: {
                ...generateDaoMultisigSettings().settings,
                minApprovals: 2,
            },
        });
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: settings }));

        render(createTestComponent());
        expect(screen.getByText(/multisigProposalsPageDetails.minimumApproval$/)).toBeInTheDocument();
        expect(
            screen.getByText(/multisigProposalsPageDetails.minimumApprovalMembers \(count=2,total=5\)/),
        ).toBeInTheDocument();
    });

    it('renders info regarding who can create proposals', () => {
        render(createTestComponent());
        expect(screen.getByText(/multisigProposalsPageDetails.proposalCreation/)).toBeInTheDocument();
        expect(screen.getByText(/multisigProposalsPageDetails.members/)).toBeInTheDocument();
    });
});
