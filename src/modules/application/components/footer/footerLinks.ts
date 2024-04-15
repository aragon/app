export interface IFooterLink {
    /**
     * Label of the footer link.
     */
    label: string;
    /**
     * Url of the footer link.
     */
    link: string;
}

export const footerLinks: IFooterLink[] = [
    { label: 'app.application.footer.link.explore', link: '#' },
    { label: 'app.application.footer.link.learn', link: '#' },
    { label: 'app.application.footer.link.build', link: '#' },
    { label: 'app.application.footer.link.help', link: '#' },
    { label: 'app.application.footer.link.privacy', link: '#' },
    { label: 'app.application.footer.link.termsOfService', link: '#' },
];
