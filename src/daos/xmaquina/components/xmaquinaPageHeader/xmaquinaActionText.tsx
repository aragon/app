import { useTranslations } from '@/shared/components/translationsProvider';

export interface IXmaquinaActionTextProps {
    /**
     * Title of the action text.
     */
    title: string;
    /**
     * Description of the action text.
     */
    description: string;
}

export const XmaquinaActionText: React.FC<IXmaquinaActionTextProps> = (props) => {
    const { title, description } = props;
    const { t } = useTranslations();

    return (
        <div className="flex w-full flex-col items-start gap-1">
            <p className="text-2xl leading-tight font-medium text-white">{t(title)}</p>
            <p className="text-lg leading-tight text-neutral-400">{t(description)}</p>
        </div>
    );
};
