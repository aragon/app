# OSx entry point: owner answers

The owner asks for a worktree off `osx-and-cleanup` and a rewrite of `design-platform-osx-orientation` based on these answers before starting the task itself.

## Audience and purpose

The explanation should serve ordinary signers and voters, proposal authors changing settings, and advanced permission managers. It does not need to answer every question those readers might have.

Think of it as a door with an informative sign outside. The door leads out of platform documentation into protocol documentation. Often, readers should be able to read the sign, get a sufficiently useful and succinct answer, and stop. Otherwise, they should understand whether they need to go deeper. They do not need to understand every technical nuance. Representative questions and misunderstandings are useful inputs to the design.

## Depth and use of protocol documentation

Do not go deeply into what a signer should recognize in a wallet's contract-function display. The important point is that the application targets OSx contracts: when users sign these interactions, they are interacting with OSx contracts.

Users need to understand that the application is based on indexed data, primarily from events emitted by OSx smart contracts, with other events such as those from tokens and ENS. Those additional examples are technical details; the page does not need to teach event indexing.

Analyze the existing protocol documentation thoroughly when designing and building the page. Summarize it and reuse useful existing content where appropriate; there may be protocol pages with substantial material that can inform the explanation.

## Permissions, grant, and revoke

The entry page can explain at a high level that permission management is part of OSx and that people who need to manage permissions should understand permissions and conditions. Grant and revoke are examples of functions that can require deeper understanding, but their specific treatment belongs in the Action Builder or Basic action context rather than dominating the general entry page.

Explain grant and revoke as exclusions from default Basic actions. They are important actions, but the product deliberately avoids making them easy and immediately available as Basic actions because users should research how they work in OSx and understand their consequences first.

## Security and configuration

The owner would like wording along the lines of: the contracts have been audited by several different firms, currently govern billions in assets, and provide audit links in every contract repository. Readers should be able to find the audits through those links; there is no need to itemize them.

Describe OSx as a very flexible operating system. The application provides an abstraction that simplifies some of that flexibility and puts common work on rails. The protocol itself does not substantially limit what users can configure, so users can misconfigure their DAOs and governance.

Put practical guidance about making setup mistakes on the relevant DAO-creation and governance-configuration pages. Those pages can link to this entry page for more explanation, which can in turn link to protocol documentation.

## AI boundary and possible topic index

The team has agreed that protocol documentation will not be in the AI assistant's retrieval corpus and will not be available on demand. It is unavailable to that assistant. The corpus remains platform documentation.

This page therefore needs to support the assistant's OSx answers within that boundary. Consider a compact topic index: the main things someone might ask about OSx, each with a couple of sentences or a short paragraph and a link to the relevant protocol page. The assistant should be able to find the entry page quickly, provide a short explanation where useful, and send the user to the appropriate protocol documentation when the summary is insufficient.

The mini index is a design idea rather than a settled layout. Update and reevaluate the task from these answers before beginning the work.
