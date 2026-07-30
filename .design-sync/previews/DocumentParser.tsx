import { DocumentParser } from '@aragon/gov-ui-kit';

const proposalMarkdown = `# AIP-42: Fund the Q3 2026 Grants Program

This proposal allocates **250,000 USDC** from the DAO treasury to the community grants program for Q3 2026.

## Motivation

The grants program funded 14 projects in Q2, growing active contributors by *32%*. Continuing the program keeps momentum with builders and integrators.

## Specification

- Transfer 250,000 USDC to the grants multisig \`0x1a9C…35BC\`
- Grants committee reviews applications bi-weekly
- Unspent funds return to the treasury on October 1, 2026

## Voting

A simple majority with a 10% participation threshold is required for this proposal to pass.
`;

const executionSummaryHtml = `
<h2>Execution summary</h2>
<p>Once approved, the following actions run <strong>atomically</strong> in a single transaction:</p>
<ol>
    <li>Approve <code>250000e6</code> USDC for the grants multisig</li>
    <li>Transfer the approved amount to <em>grants.aragondao.eth</em></li>
</ol>
<blockquote>
    <p>Actions were simulated successfully against a mainnet fork on July 14, 2026.</p>
</blockquote>
<p>Read the full committee charter at <a href="https://example.org/charter" title="Grants charter">example.org/charter</a>.</p>
`;

export const ProposalBody = () => (
    <DocumentParser document={proposalMarkdown} immediatelyRender={false} />
);

export const HtmlSummary = () => (
    <DocumentParser document={executionSummaryHtml} immediatelyRender={false} />
);
