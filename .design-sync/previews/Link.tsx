import { Link } from '@aragon/gov-ui-kit';

export const Default = () => (
    <div className="flex">
        <Link href="https://app.aragon.org" target="_blank">
            View proposal
        </Link>
    </div>
);

export const Variants = () => (
    <div className="flex items-center gap-6">
        <Link href="https://app.aragon.org" variant="primary">
            Primary link
        </Link>
        <Link href="https://app.aragon.org" variant="neutral">
            Neutral link
        </Link>
    </div>
);

export const External = () => (
    <div className="flex">
        <Link href="https://etherscan.io/tx/0xba9e" isExternal={true} showUrl={true}>
            View on block explorer
        </Link>
    </div>
);

export const Disabled = () => (
    <div className="flex items-center gap-6">
        <Link disabled={true} href="https://app.aragon.org" variant="primary">
            Disabled primary
        </Link>
        <Link disabled={true} href="https://app.aragon.org" variant="neutral">
            Disabled neutral
        </Link>
    </div>
);
