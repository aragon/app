import { WorkspaceWizardStep } from '../../constants/workspaceWizardStep';
import { buildWorkspaceWizardSteps } from './workspaceWizardDefinitions';

describe('workspaceWizard definitions', () => {
    describe('buildWorkspaceWizardSteps', () => {
        it('builds the steps in order, named from the given translation namespace', () => {
            expect(buildWorkspaceWizardSteps('app.test')).toEqual([
                {
                    id: WorkspaceWizardStep.METADATA,
                    order: 0,
                    meta: { name: 'app.test.steps.METADATA.name' },
                },
                {
                    id: WorkspaceWizardStep.TARGETS,
                    order: 1,
                    meta: { name: 'app.test.steps.TARGETS.name' },
                },
                {
                    id: WorkspaceWizardStep.ACCOUNTS,
                    order: 2,
                    meta: { name: 'app.test.steps.ACCOUNTS.name' },
                },
            ]);
        });
    });
});
