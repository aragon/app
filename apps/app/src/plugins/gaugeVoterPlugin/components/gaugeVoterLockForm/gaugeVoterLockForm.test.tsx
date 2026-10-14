import { render } from '@testing-library/react';
import { generateDaoPlugin } from '@/shared/testUtils';
import { generateGaugeVoterPluginSettings } from '../../testUtils/generators';
import type { IGaugeVoterPlugin } from '../../types';
import {
    GaugeVoterLockForm,
    type IGaugeVoterLockFormProps,
} from './gaugeVoterLockForm';

describe('<GaugeVoterLockForm /> component', () => {
    const createTestComponent = (props?: Partial<IGaugeVoterLockFormProps>) => {
        const completeProps: IGaugeVoterLockFormProps = {
            plugin: generateDaoPlugin({
                settings: generateGaugeVoterPluginSettings(),
            }) as IGaugeVoterPlugin,
            daoId: 'test-dao-id',
            ...props,
        };

        return <GaugeVoterLockForm {...completeProps} />;
    };

    it('renders nothing when the plugin has no escrow settings', () => {
        const settings = {
            ...generateGaugeVoterPluginSettings(),
            votingEscrow: undefined,
        };
        const plugin = {
            ...generateDaoPlugin({ settings }),
            votingEscrow: undefined,
        } as IGaugeVoterPlugin;

        const { container } = render(createTestComponent({ plugin }));
        expect(container).toBeEmptyDOMElement();
    });
});
