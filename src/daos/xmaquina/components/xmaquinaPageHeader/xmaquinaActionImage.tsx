import Image from 'next/image';

export interface IXmaquinaActionImageProps {
    /**
     * The SVG icon to be displayed.
     */
    icon: string;
    /**
     * The alternative text for the icon.
     */
    alt: string;
}

export const XmaquinaActionImage: React.FC<IXmaquinaActionImageProps> = (props) => {
    const { icon, alt } = props;

    return <Image src={icon} alt={alt} width={96} height={96} className="shrink-0" />;
};
