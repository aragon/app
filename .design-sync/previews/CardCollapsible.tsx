import { CardCollapsible } from '@aragon/gov-ui-kit';

const proposalSummary = (
    <div className="flex flex-col gap-3 text-neutral-600">
        <p className="font-semibold text-lg text-neutral-800">
            AIP-42: Upgrade the token voting plugin
        </p>
        <p>
            This proposal upgrades the TokenVoting plugin to v1.3, adding
            support for timestamp-based IVotes tokens and allowing the DAO to
            freeze token minting. The upgrade has been audited and tested on
            testnet for four weeks.
        </p>
        <p>
            The new version also allows excluding addresses from the total token
            supply when computing participation, which fixes the long-standing
            issue of treasury-held tokens inflating the quorum requirement.
        </p>
        <p>
            If approved, the upgrade will be executed automatically once the
            voting period ends and the support threshold is reached. No action
            is required from token holders, and delegations remain unchanged.
        </p>
    </div>
);

export const Collapsed = () => (
    <CardCollapsible
        buttonLabelClosed="Read more"
        buttonLabelOpened="Read less"
        className="w-full"
    >
        {proposalSummary}
    </CardCollapsible>
);

export const Expanded = () => (
    <CardCollapsible
        buttonLabelClosed="Read more"
        buttonLabelOpened="Read less"
        className="w-full"
        defaultOpen={true}
    >
        {proposalSummary}
    </CardCollapsible>
);

export const CustomCollapsedHeight = () => (
    <CardCollapsible
        buttonLabelClosed="Show full description"
        buttonLabelOpened="Hide full description"
        className="w-full"
        collapsedPixels={96}
    >
        {proposalSummary}
    </CardCollapsible>
);
