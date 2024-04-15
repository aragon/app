import { footerLinks } from './footerLinks';

export interface IFooterProps {}

export const Footer: React.FC<IFooterProps> = () => {
    return (
        <footer className="border-t border-neutral-100 bg-neutral-0">
            <div className="flex flex-col">
                {footerLinks.map(({ link, label }) => (
                    <a key={label} href={link}>
                        {label}
                    </a>
                ))}
            </div>
        </footer>
    );
};
