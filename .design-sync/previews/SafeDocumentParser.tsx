import { SafeDocumentParser } from '@aragon/gov-ui-kit';

const proposalMarkdown = `# AIP-57: Renew the security council mandate

This proposal renews the **security council** for another 12-month term and adjusts its emergency powers.

## Motivation

The council responded to 3 incidents in the last term with a median response time of *41 minutes*. Renewing the mandate keeps an emergency backstop in place while the DAO transitions to fully onchain governance.

## Specification

- Re-appoint the 5 sitting members to the council multisig \`0x9bF1…22Ad\`
- Reduce the emergency execution window from 48h to 24h
- Publish a public post-mortem within 7 days of any emergency action

## Voting

Approval requires a 66% supermajority with a 15% participation threshold.
`;

const executionSummaryHtml = `
<h2>Execution summary</h2>
<p>On approval, the following actions execute <strong>atomically</strong>:</p>
<ol>
    <li>Grant <code>EXECUTE_EMERGENCY_PERMISSION</code> to the council multisig</li>
    <li>Set the execution window parameter to <em>86400 seconds</em></li>
</ol>
<blockquote>
    <p>Simulated successfully against a mainnet fork on July 14, 2026.</p>
</blockquote>
<p>Full charter: <a href="https://example.org/security-council" title="Council charter">example.org/security-council</a>.</p>
`;

export const ProposalBody = () => (
    <SafeDocumentParser document={proposalMarkdown} immediatelyRender={false} />
);

export const SanitizedHtmlSummary = () => (
    <SafeDocumentParser
        document={`${executionSummaryHtml}<script>alert('xss')</script>`}
        immediatelyRender={false}
    />
);
