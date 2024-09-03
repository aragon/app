import { Description, Title } from '@radix-ui/react-alert-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useTranslations } from '../translationsProvider';

export interface IDialogAlertRootHiddenElementProps {
    /**
     * Key of the label only rendered for screen readers.
     */
    labelKey?: string;
    /**
     * Type of element to be displayed.
     */
    type: 'title' | 'description';
}

export const DialogAlertRootHiddenElement: React.FC<IDialogAlertRootHiddenElementProps> = (props) => {
    const { labelKey, type } = props;
    const { t } = useTranslations();

    if (!labelKey) {
        return null;
    }

    const LabelComponent = type === 'title' ? Title : Description;

    return (
        <VisuallyHidden asChild={true}>
            <LabelComponent>{t(labelKey)}</LabelComponent>
        </VisuallyHidden>
    );
};
