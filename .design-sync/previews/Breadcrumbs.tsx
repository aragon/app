import { Breadcrumbs } from '@aragon/gov-ui-kit';

export const Default = () => (
    <div className="flex">
        <Breadcrumbs
            links={[
                { label: 'Proposals', href: '/proposals' },
                { label: 'PIP-23: Treasury diversification', href: '/proposals/pip-23' },
            ]}
        />
    </div>
);

export const MultipleLinks = () => (
    <div className="flex">
        <Breadcrumbs
            links={[
                { label: 'Aragon DAO', href: '/' },
                { label: 'Governance', href: '/governance' },
                { label: 'Proposals', href: '/governance/proposals' },
                { label: 'PIP-23', href: '/governance/proposals/pip-23' },
            ]}
        />
    </div>
);

export const WithTag = () => (
    <div className="flex">
        <Breadcrumbs
            links={[
                { label: 'Members', href: '/members' },
                { label: '0xba9E...aF27', href: '/members/0xba9E' },
            ]}
            tag={{ label: 'Delegate', variant: 'info' }}
        />
    </div>
);
