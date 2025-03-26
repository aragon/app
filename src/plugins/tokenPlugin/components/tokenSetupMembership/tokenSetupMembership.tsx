import { TokenSetupMembershipCreateToken } from '@/plugins/tokenPlugin/components/tokenSetupMembership/tokenSetupMembershipCreateToken';
import { TokenSetupMembershipImportToken } from '@/plugins/tokenPlugin/components/tokenSetupMembership/tokenSetupMembershipImportToken';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Icon, IconType, InputContainer, Link, RadioCard, RadioGroup } from '@aragon/gov-ui-kit';

import { useState } from 'react';

export interface ITokenSetupMembershipProps {
    /**
     * The prefix for the field names
     */
    fieldPrefix: string;
}

export const TokenSetupMembership: React.FC<ITokenSetupMembershipProps> = (props) => {
    const { fieldPrefix } = props;

    const [tokenType, setTokenType] = useState<'imported' | 'new'>('new');

    const { t } = useTranslations();

    return (
        <>
            <InputContainer
                id="token"
                helpText={t('app.createDao.createProcessForm.tokenFlow.distro.helpText')}
                useCustomWrapper={true}
            >
                <RadioGroup
                    className="w-full"
                    value={tokenType}
                    onValueChange={(value) => setTokenType(value as 'imported' | 'new')}
                >
                    <div className="flex w-full flex-row gap-x-2">
                        <RadioCard
                            className="w-1/2"
                            label={t('app.createDao.createProcessForm.tokenFlow.distro.createCardLabel')}
                            value="new"
                        />
                        <RadioCard
                            className="w-1/2"
                            label={t('app.createDao.createProcessForm.tokenFlow.distro.importCardLabel')}
                            value="imported"
                            disabled={process.env.NEXT_PUBLIC_FEATURE_DISABLE_TOKEN_IMPORT === 'true'}
                        />
                    </div>
                    {process.env.NEXT_PUBLIC_FEATURE_DISABLE_TOKEN_IMPORT === 'true' && (
                        <div className="flex flex-row items-baseline gap-x-2">
                            <Icon icon={IconType.WARNING} size="sm" className="text-info-500" />
                            <div className="flex flex-col gap-y-1">
                                <p className="text-sm text-neutral-400">
                                    {t('app.createDao.createProcessForm.tokenFlow.distro.importDisabled')}{' '}
                                </p>
                                <Link
                                    href="https://app-legacy.aragon.org/"
                                    target="_blank"
                                    iconRight={IconType.LINK_EXTERNAL}
                                    className="text-sm"
                                >
                                    <span className="text-sm">
                                        {t('app.createDao.createProcessForm.tokenFlow.distro.importDisabledLink')}
                                    </span>
                                </Link>
                            </div>
                        </div>
                    )}
                </RadioGroup>
            </InputContainer>
            {tokenType === 'imported' && <TokenSetupMembershipImportToken fieldPrefix={fieldPrefix} />}
            {tokenType === 'new' && <TokenSetupMembershipCreateToken fieldPrefix={fieldPrefix} />}
        </>
    );
};
