import { Collapsible } from '@aragon/gov-ui-kit';

const proposalSummary = (
    <>
        <p className="text-neutral-800">
            This proposal requests 250,000 USDC from the DAO treasury to fund the ecosystem grants program for Q3 2026.
            The grants committee will allocate funds across up to 12 projects building governance tooling, with
            milestone-based disbursement and quarterly reporting back to the DAO. Unused funds return to the treasury
            at the end of the quarter.
        </p>
        <p className="text-neutral-800">
            The program builds on the Q2 pilot, which funded 8 projects and produced 3 integrations now live on
            app.aragon.org. Applications are reviewed on a rolling basis, and each grant is capped at 40,000 USDC.
            The committee consists of 5 elected members serving six-month terms, and all funding decisions are
            published in the DAO forum before execution.
        </p>
        <p className="text-neutral-800">
            If the proposal passes, the first tranche of 100,000 USDC will be transferred to the grants multisig
            within 7 days of execution. The remaining 150,000 USDC is unlocked after the mid-quarter report is
            approved by a simple-majority signaling vote.
        </p>
    </>
);

export const Default = () => (
    <div className="w-full">
        <Collapsible buttonLabelClosed="Read more" buttonLabelOpened="Read less">
            {proposalSummary}
        </Collapsible>
    </div>
);

export const WithOverlay = () => (
    <div className="w-full">
        <Collapsible buttonLabelClosed="Read more" buttonLabelOpened="Read less" overlayLines={2} showOverlay={true}>
            {proposalSummary}
        </Collapsible>
    </div>
);

export const Expanded = () => (
    <div className="w-full">
        <Collapsible buttonLabelClosed="Read more" buttonLabelOpened="Read less" defaultOpen={true}>
            {proposalSummary}
        </Collapsible>
    </div>
);

export const CustomCollapsedLines = () => (
    <div className="w-full">
        <Collapsible buttonLabelClosed="Show full description" buttonLabelOpened="Hide description" collapsedLines={5}>
            {proposalSummary}
        </Collapsible>
    </div>
);
