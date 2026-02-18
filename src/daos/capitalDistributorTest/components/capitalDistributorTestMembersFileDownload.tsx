import { Button, IconType, InputContainer } from '@aragon/gov-ui-kit';
import type { ComponentProps } from 'react';
import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface ICapitalDistributorTestMembersFileDownloadProps
    extends ComponentProps<'header'> {
    /**
     * DAO to display in the header.
     */
    dao: IDao;
}

export const CapitalDistributorTestMembersFileDownload: React.FC<
    ICapitalDistributorTestMembersFileDownloadProps
> = () => {
    const { t } = useTranslations();

    return (
        <InputContainer
            helpText={t(
                'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownload.helpText',
            )}
            id="katana-members-file"
            isOptional={true}
            label={t(
                'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownload.label',
            )}
            useCustomWrapper={true}
        >
            <Button
                className="w-fit"
                iconLeft={IconType.REWARDS}
                variant={'tertiary'}
            >
                {t(
                    'app.daos.capitalDistributorTest.capitalDistributorTestMembersFileDownload.button',
                )}
            </Button>
        </InputContainer>
    );
};
