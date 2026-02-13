import { Button, IconType, InputContainer } from '@aragon/gov-ui-kit';
import type { ComponentProps } from 'react';
import type { IDao } from '@/shared/api/daoService';

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
    return (
        <InputContainer
            helpText={
                'Click button to generate members distribution file based on current voting power. Please review file and submit it to the next step.'
            }
            id="katana-members-file"
            isOptional={true}
            label={'Members file'}
            useCustomWrapper={true}
        >
            <Button
                className="w-fit"
                iconLeft={IconType.REWARDS}
                variant={'tertiary'}
            >
                Create members file
            </Button>
        </InputContainer>
    );
};
