import { render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import en from '@/assets/locales/en.json';
import { lockToVotePlugin } from '@/plugins/lockToVotePlugin/constants/lockToVotePlugin';
import { Network } from '@/shared/api/daoService';
import * as translationsProvider from '@/shared/components/translationsProvider';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { translationUtils } from '@/shared/utils/translationsUtils';
import type { ISetupBodyForm } from '../setupBodyDialogDefinitions';
import { SetupBodyDialogSelect } from './setupBodyDialogSelect';

const TestWrapper: React.FC<PropsWithChildren> = ({ children }) => {
    const formMethods = useForm<ISetupBodyForm>();

    return <FormProvider {...formMethods}>{children}</FormProvider>;
};

describe('<SetupBodyDialogSelect /> component', () => {
    beforeEach(() => {
        jest.spyOn(pluginRegistryUtils, 'getPlugins').mockReturnValue([
            lockToVotePlugin,
        ]);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders Lock to vote as an available body', () => {
        jest.spyOn(translationsProvider, 'useTranslations').mockReturnValue({
            t: translationUtils.t(en),
        });
        render(
            <TestWrapper>
                <SetupBodyDialogSelect network={Network.ETHEREUM_SEPOLIA} />
            </TestWrapper>,
        );

        expect(
            screen.getByText(
                'Voting requires locking non-governance ERC20 tokens',
            ),
        ).toBeInTheDocument();
        expect(screen.getByRole('radio')).toBeEnabled();
        expect(screen.queryByText('By request')).not.toBeInTheDocument();
    });
});
