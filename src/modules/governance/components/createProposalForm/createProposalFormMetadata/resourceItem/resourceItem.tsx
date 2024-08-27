import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Button, Dropdown, IconType, InputText } from '@aragon/ods';

export interface IResourceItemProps {
    index: number;
    remove: (index: number) => void;
}

export const ResourceItem: React.FC<IResourceItemProps> = ({ index, remove }) => {
    const { t } = useTranslations();

    const labelField = useFormField(`resources.${index}.label`, {
        label: t('app.createProposal.createProposalForm.resources.labelInput.title'),
        rules: { required: true },
        defaultValue: '',
    });

    const linkField = useFormField(`resources.${index}.link`, {
        label: t('app.createProposal.createProposalForm.resources.linkInput.title'),
        defaultValue: '',
        rules: {
            required: true,
            pattern: {
                value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                message: 'Invalid URL format',
            },
        },
    });

    return (
        <li className="flex gap-2">
            <InputText
                placeholder={t('app.createProposal.createProposalForm.resources.labelInput.placeholder')}
                {...labelField}
            />
            <InputText
                placeholder={t('app.createProposal.createProposalForm.resources.linkInput.placeholder')}
                {...linkField}
            />
            <div className="mt-9">
                <Dropdown.Container
                    constrainContentWidth={false}
                    size="md"
                    customTrigger={<Button variant="tertiary" size="lg" iconLeft={IconType.DOTS_VERTICAL} />}
                >
                    <Dropdown.Item onClick={() => remove(index)}>
                        {t('app.createProposal.createProposalForm.resources.removeResource')}
                    </Dropdown.Item>
                </Dropdown.Container>
            </div>
        </li>
    );
};
