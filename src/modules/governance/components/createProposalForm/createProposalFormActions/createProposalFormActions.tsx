import {
    AutocompleteInput,
    type IAutocompleteInputGroup,
    type IAutocompleteInputItem,
} from '@/shared/components/forms/autocompleteInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, CardEmptyState, IconType } from '@aragon/ods';
import classNames from 'classnames';
import { useRef, useState } from 'react';

export interface ICreateProposalFormActionsProps {}

const items: IAutocompleteInputItem[] = [
    { id: 'metadata', name: 'Set metadata', icon: IconType.SETTINGS, groupId: 'dao' },
    { id: 'mint', name: 'Mint', icon: IconType.SETTINGS, groupId: 'token-plugin' },
    { id: 'updateSettings', name: 'Update token settings', icon: IconType.SETTINGS, groupId: 'token-plugin' },
    { id: 'test1', name: 'Test 1', icon: IconType.SETTINGS, groupId: 'test1' },
    { id: 'test3', name: 'Test 3', icon: IconType.SETTINGS },
    { id: 'test2', name: 'Test 2', icon: IconType.SETTINGS, groupId: 'test1' },
    { id: 'transfer', name: 'Transfer', icon: IconType.APP_TRANSACTIONS },
];

const groups: IAutocompleteInputGroup[] = [
    { id: 'dao', name: 'DAO', info: '0x1736...5409', indexData: ['0x17366cae2b9c6C3055e9e3C78936a69006BE5409'] },
    {
        id: 'token-plugin',
        name: 'Token Voting',
        info: '0xF6ad...fBF05',
        indexData: ['0xF6ad40D5D477ade0C640eaD49944bdD0AA1fBF05'],
    },
    { id: 'test1', name: 'Test 1', info: '0x764a...ED2c', indexData: ['0x764a31E070c6Ea2E81CbC1f680BF9a07f762ED2c'] },
];

export const CreateProposalFormActions: React.FC<ICreateProposalFormActionsProps> = () => {
    const { t } = useTranslations();

    const autocompleteInputRef = useRef<HTMLInputElement | null>(null);
    const [displayActionComposer, setDisplayActionComposer] = useState(false);

    const handleAddAction = () => autocompleteInputRef.current?.focus();

    const handleItemSelected = (item: string) => {
        // TODO: implement proposal action handling (APP-3558)
        // eslint-disable-next-line no-console
        console.log('selected item', { item });
    };

    return (
        <div className="flex flex-col gap-y-10">
            <CardEmptyState
                heading={t('app.governance.createProposalForm.actions.empty.heading')}
                description={t('app.governance.createProposalForm.actions.empty.description')}
                objectIllustration={{ object: 'SMART_CONTRACT' }}
                isStacked={false}
            />
            <Button
                variant="primary"
                size="md"
                iconLeft={IconType.PLUS}
                className={classNames('self-start', { 'sr-only': displayActionComposer })}
                onClick={handleAddAction}
            >
                {t('app.governance.createProposalForm.actions.action')}
            </Button>
            <AutocompleteInput
                items={items}
                groups={groups}
                wrapperClassName={classNames('transition-none', { '!sr-only': !displayActionComposer })}
                onChange={handleItemSelected}
                onOpenChange={setDisplayActionComposer}
                ref={autocompleteInputRef}
                selectItemLabel="Add action"
                placeholder="Filter by action, contract name or address"
            />
        </div>
    );
};
