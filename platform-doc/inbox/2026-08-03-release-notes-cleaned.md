# Release notes — cleaned capture (2026-08-03)

Cleaned capture of the product owner's release-notes brain dump (source: `raw/release_notes.md`), restructured per release with wording tidied and every claim, hedge, open question, and follow-up preserved. 34 entries: releases 1.0.0 through 1.35 as dictated, plus one third-party-dependencies aside. Release numbers 1.18, 1.29, 1.31, and 1.32 do not appear in the dictation. Version-number garbles are preserved as dictated and flagged in the affected entries' Transcription notes. Inbox rules apply: draft capture, not established fact.

## 1.0.0

### Features and changes

**Explore page** — In 1.0.0 we launched the product with an explore page: the page you land on when you just go to app.aragon.org. It has a top header, "which just says, like the hero page" (dictation garbled here — see Transcription notes), followed by "featured DAOs" — a carousel of DAOs that we manually choose to feature. The featured DAOs are controlled by the app CMS repo.

**Adding bodies and plugin slots (token voting)** — We have a whole concept of wrapping and unwrapping tokens (see the token voting repository for how this works). When you're creating token voting — i.e., in the flow for adding bodies — there's a slot where the flow hands off into launching a plugin: you're adding a plugin as a body, and we launch all of the plugin components in a modular way. This is really worth investigating when evaluating the slots in the codebase.

**Importing ERC-20 tokens and wrapping** — You can import an existing ERC-20 token. We run checks on the ERC-20's capabilities — for example, checking whether it has ERC-20 votes capabilities per the OpenZeppelin standard, specifically whether it has "get past votes" and "get past total supply," which is required for governance to work based on snapshotting. If an imported token doesn't have that capability, we have to wrap it: token voting will automatically deploy a wrapper contract, meaning the user has to wrap their tokens to be able to vote. They have to wrap before proposals are created, so that their voting power is included in the snapshot.

**Token panel** — This all lives within the token panel — the place where we show token-related components dynamically, on the member page (it sometimes also appears in the onboarding flow — see open questions below). In the token panel: you specify the amount of tokens you want to lock, approve it, then lock inside the locker; once the token allowance goes through, you can lock, which gives you voting power, and then you can delegate. When importing tokens, we also check whether the token has a delegation function; if it doesn't, we hide the delegation logic inside the token panel. (We consider that part of our genius — though see the open question below about whether this could break delegate profile pages.)

**Admin experience** — When you're an admin and go to the settings page, there's a banner notifying you that you're an admin and need to set up your governance. If you're not an admin, it instead says the DAO is controlled by admins, with a "View Admins" click that shows you the admins. You can remove the admin plugin, which is essentially uninstalling a plugin — i.e., saying you're done with the DAO / done with the initial setup. After that, we show another alert to make sure you're properly set up; "we use the critical alert because this is important." You can also add or remove other admins. The admin plugin is kind of like a multisig in that it's built around a member list — the list of admins — and all of those admins can execute proposals immediately (i.e., calling create proposal). To add or remove admins, you click into it, a dialog opens, and you add or remove them like members; of course, this requires a transaction.

**Octav link** — On our asset and transfers page, we have a little link to a financial site called Octav. It was just a way to kind of get cozy with them by linking out; we show their DAO so you can see more assets there, because we have a limited asset view because this isn't a financial app.

**Ethereum Follow Protocol** — On member profiles, we do something similar: there's a component that calls the Ethereum Follow Protocol API to show social graph info on the member profile. It's not a very important feature — just a small card with that info off to the side.

**Terms and conditions** — Our terms and conditions are viewed when you open the Wallet Connect dialog. They're essentially links, and you have to agree to them before you connect your wallet.

**Loading states** — Whenever a page is loading, there's a blue bar across the top to make it clear the page is loading. We're running on Vercel, so pages load decently quickly.

**Action builder** — We've made a bunch of improvements to the custom action input components and related pieces used in the action builder.

**Initial release feature set** — Rattling off some of the features that were part of the first release of the product (i.e., existed prior to actual launch):

- The general core governance experience for the token voting plugin and the multisig plugin — approval creation, voting, executing (I think you already know all this).
- Modular governance via the staged proposal processor: you can have multiple processes, each process can have multiple stages, and each stage can have multiple bodies.
- A body can either veto or approve within a stage, and that's what enables optimistic governance — it's not exactly that the stage itself is "optimistic," it's this veto/approve behavior at the body level. Optimistic governance is a big, important concept that we need to discuss in more detail.
- A stage can also be configured with no bodies at all and instead just require a certain amount of time to pass — that acts almost like a time lock, or like a delay app, something along those lines.
- The Wallet Connect feature (we used to call it Dapp Connect) in the action builder: it opens a dialog where you take the Wallet Connect QR code from some other application and punch it into our app; that lets our app connect to that other app so you can go do stuff in that other app. We're essentially listening through Wallet Connect, through the API, to grab the actions — stuff that would otherwise be sent as a transaction in the other app instead gets sent / becomes an action inside our app.
- A whole DAO creation flow, where you can launch a new DAO and it goes into the admin experience (not sure if we've discussed this before).
- Member profile pages with a bunch of stuff on them (not sure if we've talked about member profiles before, or about Aragon names / Aragon profiles — we can maybe talk about this later).

### Commentary and cross-feature notes

- Hiding delegation logic in the token panel when a token lacks a delegation function is considered "part of our genius" — though see the open question below about whether this could break things elsewhere.
- "We use the critical alert because this is important" — dictated with the definite article; which alert this refers to (and whether it names a specific component) isn't resolved in the dictation.
- The Octave link was just a way to kind of "get cozy with them" by linking out; we have a limited asset view because this isn't a financial app.
- The Ethereum Follow Protocol card on member profiles is explicitly called out as not a very important feature.
- Optimistic governance (via body-level veto/approve) is called out as a big, important concept in the governance model.
- We're running on Vercel, which is cited as the reason pages load decently quickly.

### Open questions and follow-ups

- The token panel sometimes appears in the onboarding flow — "which I don't think you know anything about, which we can talk about later."
- "Maybe we need to check on our delegate profile pages, though" — to make sure that importing a token without delegation doesn't break them; "I haven't really tested that, to be fair."
- The plugin components launched modularly (via the slot system) are worth investigating further when evaluating the slots in the codebase.
- Check the existing, live Aragon developer portal — it has a lot of good argumentation on why the ERC-20 votes capability check (get past votes / get past total supply) is critical for governance snapshotting.
- Optimistic governance needs to be discussed in more detail later.
- Terminology rebuke, addressed to the documentation agent about optimistic governance: "Elsewhere in the documentation I've seen you call it multisig gating or safe gating. This is not normal terminology, I don't know what you're talking about."
- General thoughts on page/error handling: maybe we should have some questions around what happens if a page fails within the app. We try to scope the errors effectively; and if certain data is missing, how do we show all this?
- A "hardcore deep dive" into the action builder's functionality is needed at some point.
- Not sure if the DAO creation flow has been discussed before.
- Not sure if member profile pages, Aragon names, or Aragon profiles have been discussed before — to be covered later.

### Transcription notes

- "Wallet Connect" is used here for two apparently different things: (1) a dialog shown when connecting your wallet to the app, where the terms and conditions are presented; and (2) a distinct named feature in the action builder (formerly called "Dapp Connect") that connects the Aragon app to another application via the Wallet Connect QR code to import its actions. Both are preserved exactly as dictated; flagging in case they need to be disambiguated later.
- The line about stages and optimism contained a self-corrected false start ("Each stage can be made optimistic by, if the body is configu...") that was immediately restated as "a body can either veto or approve." The truncated fragment was dropped as fully restated, but flagging in case any nuance about stage-level vs. body-level configuration was lost.
- "get past votes" and "get past total supply" are preserved exactly as dictated; these likely refer to OpenZeppelin's getPastVotes / getPastTotalSupply functions (part of the ERC-20 Votes standard), but exact casing/spacing wasn't clear from the audio.
- "approval creation" (in the list of core governance actions: "approval creation, voting, executing") may be a mishearing of "proposal creation," given the create/vote/execute pattern used elsewhere in this chunk. Preserved as dictated.
- "there is like a top header, which just says, like the hero page" — garbled: unclear whether the top header is the hero page, says something, or sits on the hero page. Preserved as dictated.
- "if the ERC-20 has, does not have ERC-20 votes capabilities based on the standard from OpenZeppelin, we check to see if it has get past votes, get past total supply" — dictated with a self-corrected polarity ("has, does not have"); it also permits the reading that the get-past-votes / get-past-total-supply checks happen specifically when the token lacks ERC-20 votes capabilities. The body text above commits to one reading.

## 1.10 (dictated - likely 1.1.0)

### Features and changes

- In 1.10, we added the basic flow within the governance designer, where you can just deploy standalone plugins that are both a process and a body simultaneously.
- We also made it possible to import the tokens, as I said — it does all these dynamic checks.
- We also added this concept — I think we've talked about — in the slot system. There are these DAO slots: the first DAO slot we did was a custom DAO header, so you can create a header.
- We also have Open Graph metadata for pages, for when you share social links.

### Transcription notes

- Orchestrator note: dictated as "In 1.10" but positioned between the 1.0.0 dump and 1.2.0; a separate later entry in the same dump announces the actual 1.10 release (lock-to-vote). Possibly means 1.1.0. Preserved as dictated.
- Ambiguous construction: "We also added this concept I think we've talked about in the slot system." Could be read as (a) "a concept added in the slot system" — something new added inside an already-existing slot system — or (b) "the slot system is the concept" — the slot system itself is the thing added, equated with something discussed before. Preserved as dictated; not resolved.

## 1.2.0

### Features and changes

**Additional network support**
In 1.2.0, we added support for a couple of additional networks. We support the main ones, obviously - Ethereum Sepolia, Ethereum Mainnet, Polygon, Arbitron, Optimism, etc. - but there are way more, and they need to go to the app to actually see that.

**Transaction dialog**
We have a very specific transaction dialog - a universal type of dialog we use for doing transactions. It uses a stepper:
- It first prepares the transaction. If it has to pin any IPFS data, it will do so, because sometimes we need to post metadata and pass along the IPFS hash as an argument to something - like creating a DAO, a proposal, or deploying a plugin, or something along those lines.
- Then you sign the transaction.
- Then it confirms, and we listen for the confirmation.
- Then the backend starts indexing, and we listen for the indexing.
- You can either wait for indexing to finish - once it does, you click OK and it shows everything - or, if it's still indexing and you're impatient, you can click "continue anyway" and move on.

**Two-step process for deploying governance processes**
Certain flows in our application follow what we call a two-step process. We do things very methodically - for example, deploying plugins and then installing them as a second transaction. That's nice because the second transaction can then be the one that creates a proposal. When you deploy governance processes - whether standalone, basic, or advanced - you deploy all the plugins and configure them first (or at least do part of the configuration). The second transaction actually installs it, though there may be some additional configuration done at that point too.

### Commentary and cross-feature notes
The second transaction in the two-step process above is actually a transaction to create a proposal to do all of that, which is important because you need to actually have people in your DAO or whoever, even if you're an admin and an admin just passes it automatically. The whole point is that it has to go through governance, because you need some plugin that has execute permission to actually go and execute all these things. So you do it through a proposal.

### Open questions and follow-ups
- We probably shouldn't actually list the supported networks directly in this wiki. Instead, we should say to go to the Create DAO flow, where you can see the networks we support.
- Maybe we should actually have this documented - maybe you need to go through the app, load it, and try to figure it out yourself. Or you could just look at the app repo, which is a sister repo to the repo you're in right now, and pull all of that in.

### Transcription notes
- "Arbitron" (in the supported-networks list, alongside Ethereum Sepolia, Ethereum Mainnet, Polygon, and Optimism) may be a mis-transcription of a different network name - kept exactly as dictated since it couldn't be verified against a source.
- "You need to actually have people in your DAO or whoever" (in the Commentary and cross-feature notes, on why the second transaction is a proposal) is ambiguous in the raw dictation - it's unclear whether this means the DAO needs to have members/participants at all, or that those people need to vote on or approve the proposal. Kept exactly as dictated without supplying a resolving verb.

## 1.2.1

### Features and changes
As a hotfix in 1.2.1, we excluded testnet DAOs from the all DAOs list on the explore page.

That's maybe another important thing about the explore page that I didn't mention earlier: on the explore page there's a carousel that shows all the DAOs, and then some buttons that say things like "get in touch with the team," "create a DAO," etc. And then it shows the DAO list.

The DAO list has two tabs:
- **All DAOs** - excludes testnet DAOs so it's not noise, and is sorted by total assets in US dollars.
- **Member** - shows all the DAOs you're a member of. You're a member if you're a member in any plugin - being a member in just one plugin is enough.

## 1.3.0

### Features and changes

- In app release 1.3.0, we added support to add any external body. We've talked a lot about safes as bodies, but to be totally clear, you can have any other address as a safe. You can have a governor as a safe, or anything that can execute stuff. It acts as an account or an agent — externally owned accounts, for example. It's kind of janky, but you could do it.
- By the way — I think I mentioned this already — when you install a governance process, you can use a governance process to install another governance process. It's not just admin. That's important.
- Also, when a DAO is deployed on Ethereum mainnet, you're able to get an ENS subname. We use dao.eth, so you could use something like mydao.dao.eth, and you can use that to send assets to your DAO and stuff.

### Transcription notes

- The description of the external-body feature says you can use "any other address as a safe" and "a governor as a safe." Since the point being made is that bodies aren't limited to safes, this may have been intended as "as a body" rather than "as a safe" — preserved verbatim as dictated because the intended meaning is ambiguous.

## 1.4

### Features and changes
In 1.4, we added a couple things, but very small:
- Like a Safe multisig when you add it as a body — we put a little custom branding on it, and we put a little Safe logo.
- When you have a DAO.eth subname, you can use that in the URL to access it — it's like a friendlier name.
- On the Proposals page, when viewing a proposal, we load it and decode the actions, waiting for everything to load while decoding all the actions in real time.
- OSX smart contracts have an upgrade feature, which allows DAOs to upgrade their smart contracts.

### Commentary and cross-feature notes
- The Safe logo/branding addition is just a little note and not really relevant.
- The real-time action-decoding behavior on the Proposals page is mentioned as an FYI — I'm not sure if this is something you need to know.
- I don't necessarily encourage the smart contract upgrade feature for everyone all the time, because it just adds unnecessary risk. Most upgrades are us adding new features, so if a DAO isn't using those features, they don't need to upgrade.

### Transcription notes
- "OSX smart contracts" is preserved as dictated; it's unclear whether "OSX" is the term the author intended or a mishearing/garbling of something else — kept as heard rather than silently corrected.
- The raw is ambiguous about what exactly was added in 1.4 regarding the Safe multisig: whether the Safe multisig body type itself is new, or only the custom branding/logo shown when adding a Safe multisig as a body is new. Preserved as ambiguous rather than resolved. It's also unclear whether "a little Safe logo" is the same thing as the "custom branding" mentioned just before it, or a separate addition — the raw states them as two separate sentences ("We put a little custom branding on it. We put a little Safe logo.") without equating them.

## 1.5.0

### Features and changes
- In 1.5.0, we added an upgrading flow, which allows you to upgrade your smart contracts for your DAO and for your various plugins. That flow is available directly from within the application.
- When you're in an optimistic governance stage — in other words, when a voting body is, like, in veto mode — we kind of change some of the copy a little bit. It says "yes to veto" as opposed to "yes to approve," so it's clearer whether somebody is vetoing or approving, i.e., what they're actually voting on.
- We also added the ability to copy addresses throughout the UI, like in IDs and things — there's the little clipboard you can click on.

### Commentary and cross-feature notes
- We don't necessarily push or drive the upgrading flow, because most of the upgrades are for new features — if people don't have the new features, they don't need them, so who cares? No need to do significant contract changes.
- Because remember, bodies are voting in the affirmative because they're voting yes to send a certain result, so they're voting yes to a veto, which is slightly counterintuitive, but we do our best in the copy to make it a little more clear.
- On the copy-addresses feature: not that interesting.

### Open questions and follow-ups
- One maybe important thing to note about governance stages — but maybe we can talk about this in the governance designer later: stages can advance early if the criteria is met, but that's an option — it's a configuration.
- Maybe you should create a task where we need to walk through the governance designer, and I'll explain all of the things we show there. Even though it's advanced — just the advanced governance designer — and it's not made available to the public, I think it's a good way to understand the capabilities.

### Transcription notes
- Raw dictation for the veto-mode description contains a false start — "a voting body is, like, in for, you know, it's like a veto mode" — before settling on "it's like a veto mode." The false start ("is ... in for") doesn't carry standalone meaning and has been smoothed out of the main text above; only the approximating hedge ("like ... veto mode") is preserved there.
- It's ambiguous in the raw whether "but maybe we can talk about this in the governance designer later" refers specifically to the early-stage-advancement behavior (stages advancing early if the criteria is met) or to the governance designer walkthrough generally — the dictation doesn't make clear which "this" points to.

## 1.6.0

### Features and changes

- We updated the datalist pages — though not all of them, just the proposals datalist.
- Proposals come from different governance processes because the tabs at the top are partitioning the datalist based on proposal type.
- The default tab when you first arrive is "all proposals," which shows all of them.
- What's cool about this: since there are different types of proposals for different governance processes, you can tell them apart based on the process key — the kind of slug, friendly name. That's the main indicator when you're on the "all proposals" tab.
- You can switch between the different tabs for the different governance processes.

### Transcription notes

- The original sentence connecting governance processes and the tabs used "because" in a way that reads as grammatically reversed/run-on: "There's proposals that are coming from different governance processes because the tabs up at the top... are partitioning the datalist based on proposal type." We've kept the author's own "because" connector and its literal direction in the body above (proposals come from different governance processes because the tabs are partitioning the datalist based on proposal type). Two readings seem possible: (a) the literal reading as dictated — the tabs partitioning the datalist by proposal type is the reason proposals are described as coming from different governance processes; or (b) the reverse reading — multiple governance processes are the reason the tabs/partitioning by proposal type exist. We have not resolved which reading the author intended.
- "Process key" was described only loosely, in apposition, as "the kind of slug, friendly name" — it's not fully clear whether "process key," "slug," and "friendly name" are meant as the same identifier or as distinct-but-related terms. We've kept the terms together as the author gave them without resolving this.
- The dictation describes what the tabs split on in two different ways: "partitioning the datalist based on proposal type" (earlier) and "switch between the different tabs for the different governance processes" (later). The author never explicitly equates "proposal type" and "governance process" as the same partition key — both terms are preserved here as given, without assuming they refer to the same axis.

## 1.7.0

### Features and changes

In 1.7.0, we added UI support for veLockers (vote escrow lockers). veLockers are inspired by Curve Finance; more information is available in the ve governance repo (which also has gauges — we implement those later and can talk about them then).

veLockers are visible in the token panel (we've talked about the token panel before, I believe). Here's the mechanism: the token voting plugin treats some token as "the token" used for voting. It checks to see if that token is actually a vote escrow adapter — an adapter contract we created that lets veLockers be used as if they were an ERC-20 votes token (we've talked about ERC-20 votes in certain places before, I believe). When we detect the vote escrow adapter, we show the veLocker token panel component in the UI, on the members page, to the right.

This lets you lock your underlying token — some token that doesn't have to be an ERC-20 votes token itself — into the veLocker. You choose how much to lock, and it gives you a reward over time based on how long you hold it there, so you get a bonus. That's cool because it incentivizes people to vote for longer. (You can do research to see what the point of vote escrow is, in general.)

The UI shows this in real time: it refreshes and shows your actual voting power across multiple locks. Each lock is independent, and you can see the voting power on each one. When you unlock, there's a withdrawal period, and only after that withdrawal period can you actually claim your tokens back. This is similar to token wrapping, in the sense that you have to approve your tokens and then do a transaction to move them over.

Overall, this is a pretty nice feature, but again, users don't get to use this out of the box — we have to deploy it for them (and we generally charge them for it, by the way).

The main point: veLockers are fully compatible with token voting. They're not compatible with the lock-to-vote plugin (which I'll describe later) — I mean, I guess, yeah, it's not, because, yeah, you don't actually hold your tokens anymore, you move them into the escrow.

### Commentary and cross-feature notes

This whole feature is a bit weird/unusual, which points to an interesting broader concept. This is a bit of a digression from 1.7.0 specifically, but it's an important concept worth capturing: there's a whole class of things across the product that are supported plugins, partially supported plugins, and unsupported plugins. What do I mean by partially supported plugins? This is an important concept: we do this with certain features in general — we support the experience for the user inside the UI, but we don't have a deployment experience for a DAO admin or a DAO creator. But when we're working directly with a client, we can deploy the setup ourselves, and our application will understand it and show it in the appropriate place. veLockers are an example of this pattern.

### Open questions and follow-ups

- We may need a whole structure somewhere in the knowledge base to handle this class of feature (supported / partially supported / unsupported plugins, including the ones we deploy directly for clients). Not sure what to call it yet — maybe "premium features" or something else — but it's features that we set up for clients, and that then exist in our app. The call to action for clients is to reach out to the Aragon team, and when they do, we can set it up for them.
- Gauges (from the ve governance repo) — we implement these later and will talk about them then.
- The lock-to-vote plugin will be described later (noted here only because veLockers are not compatible with it).
- Further research could be done on the general point/purpose of vote escrow as a mechanism.

### Transcription notes

- The chunk opens with "vLockers, vote escrow lockers," but every later mention uses "veLockers." Treated as the same term throughout and standardized to "veLockers," consistent with the frozen nomenclature — flagging in case "vLockers" was meant as distinct wording rather than a transcription slip.
- The adapter that lets veLockers act as an ERC-20 votes token is introduced clearly as a "vote escrow adapter," but a later sentence garbles this as "the ERC-20 votes adapter for the vote escrow adapter." Represented here using "vote escrow adapter" as the operative term — flagging in case these are meant to describe two distinct things rather than one and the same adapter.
- Raw says veLockers "are visible in the token panel... It checks to see if the token... It checks to see if it's a vote escrow adapter." The antecedent of "It" is ambiguous — it could be the token panel itself, or the app/system more generally. Left as "It" without resolving which, consistent with the raw.

## 1.8.0

### Features and changes

**Granular permission management in the governance designer**

In 1.8.0, we did a bunch of granular permission management (or granular access control) work and added it to the governance designer.

This addresses an important problem in the permission model of Aragon OSX: if you grant a permission to a plugin — such as the execute permission — you're essentially, as a plugin, telling the DAO to go do something. But the DAO has its own permissions too, so you end up with a kind of chained, implicit permission that sort of collapses together, if you will. That means a governance plugin can tell the DAO to do stuff, and if you have multiple plugins, they're all telling each other to do stuff.

The idea is that you should be able to granularly grant permissions to a governance process, because a governance process represents an actual governance process wrapping around an actual governing body — you want to be able to create checks and balances and things like that. This is really important.

So we had to create a whole other condition — which we don't really show in the product — called the execute selector condition. To be honest, it's a workaround: it allows you to create function-selector-based permissions that are routed through execute. The governance designer can now say that a given governance process is only able to call specific target contracts and specific function selectors on them. These can be internal (e.g., calling specific functions on plugins) or external (e.g., some random contract, like calling transfer on a token). Keep in mind token contracts are all their own tokens, so you'd have to authorize these individually.

On the governance process details page, we show all the authorized selectors. And in the action builder, when creating a proposal, we filter it to only show authorized actions by default — though you can uncheck that to show everything, but then the action (or rather, executing the proposal) might revert.

All of the execute selector stuff is hidden in the background — it's abstracted away. There's something called a condition factory (documented in the protocol doc) that we interact with, but the user doesn't necessarily know about or see that.

**Deep linking into tabs via URL parameters**

Wherever a tab system is used in the app — for example, wanting to see specific members for a specific running body, or really any tab on any page — you can add a parameter to the URL that specifies what to open by default. It's kind of like deep linking into a tab: it just opens with that tab already switched to / open.

**Transaction dialog waits for indexer confirmation**

When there's a transaction and you're on the transaction dialog, the last step waits for the indexer to respond confirming the transaction hash is fully indexed. That lets us update all the pages so we're not still waiting for data, and lets us know when you can advance and actually see the page.

**Address input component**

We don't want to nerd out too much on UI components, but there's also the address input component worth mentioning (described in the dictation both as new in 1.8 and as something we already had — see Transcription notes). It's a really complex component in the UI kit that does checksum by default on all addresses. How it works: if the address is all uppercase, that's fine; if it's all lowercase, that's fine; if it's checksummed correctly, that's fine; but if it has a mix of uppercase and lowercase that doesn't match the checksum, it fails form validation and flags it as bad. The address input also supports ENS, and it's a complex component that lets you interact with addresses nicely and jump to the block explorer.

**OSX capital distributor plugin**

We also built a new plugin: the OSX capital distributor plugin (information available on GitHub). It falls into the same category as the vote escrow locker — supported if we deploy it for a client, but not available for free for anyone to deploy.

The capital distributor can do transfers out of the DAO, and it lets people go to it and make a claim. When someone claims an asset, it checks whether they're eligible, and if so, transfers a token out of the DAO to them. We're currently doing this eligibility check through Merkle proofs: we have a backend service that generates the proof, the tree, and the root (or whatever the exact terms are), and we often pre-populate all of these proofs. The user comes in, requests their proof, and signs a transaction with the proof asserting they're eligible. If eligible, they can claim their token.

We have a UI for this that shows all of the rewards the user is eligible for. Clicking it takes them through a short wizard dialog to make the claim, and they can claim to their own address or to another address. And that's mostly it.

It's been used by projects like Boundless, Katana, and CryptEx — it's being used nicely, but for specific clients. These can be used for one-off distributions (like an airdrop) or for ongoing rewards.

For some clients, we also implement specific logic for creating campaigns and distributing based on different criteria and rules. For example, Katana (like our other existing clients) does incentive distributions with different calculations. Those calculations are done off-chain, and then we generate — not the proof, but a JSON — which is used to create the Merkle tree. The campaign itself is created through the action builder — which, I guess, is something to talk about later, once we actually implement that.

**Frontend plugin interface abstraction**

It's also maybe worth noting that we made the frontend a bit more modular, so that we don't look at the specific plugin repo contract that the plugin comes from — we look at its interface instead. That interface lets us have slightly modified, alternate versions of plugins for testing or for custom client solutions, while the rest of the app just assumes it's the thing it knows, rather than us having to treat it totally differently. Some logic just lives inside the functions, and we don't actually need to know about it or build a bespoke experience in the application for it.

### Commentary and cross-feature notes

- The checks-and-balances rationale for granular governance-process permissions is something I think we've already talked about a little bit before.
- The capital distributor plugin's deployment model (supported if we deploy it for a client, but not available for free for anyone to deploy) mirrors the vote escrow locker's — both fall into that same category.
- For those familiar with Merkle (the project): they offer a similar distribution service, but focus on it more as a standalone, vertically integrated service. We're focusing on this as just one feature that sits alongside your governance.

### Open questions and follow-ups

- The permission model of Aragon OSX (the chained/implicit-permission issue described above) is something you might need to review in the protocol doc, as is the condition factory — which you can learn about in the protocol doc and which we interact with.
- Not sure the URL-deep-linking-for-tabs detail actually matters — it's just a technical thing.
- Client-specific campaign/distribution logic (e.g., for Katana and other clients) doesn't need to go into the knowledge base because it's client-specific — but it's something that, I guess, people need to know we offer.
- We'll talk more about the action builder's campaign-creation flow later, once we actually implement it.

### Transcription notes

- The address input component is described in the source both as "a new component we added in 1.8" and, in the same breath, as something "we already had... it's not new." This is preserved as a direct self-contradiction; it's unclear whether the address input component itself is new in 1.8.0.
- The address input "does checksum by default on all addresses" is ambiguous — it's not clear whether this means the component checksums/normalizes the address, or validates that an address is already correctly checksummed. Preserved verbatim rather than resolved.
- "A specific running body" (in the URL deep-linking passage) may be a mis-transcription of "governing body" (which appears elsewhere in this entry, in the governance-process passage), but it's preserved verbatim since it wasn't clearly an error.

## 1.9

### Features and changes
- In 1.9, we added the actual endpoint for generating the Merkle trees and proofs, and the API is available for external clients to add it into their own UI — if they don't want to use our UI for the claiming (which makes sense). For example, if you're doing an airdrop, you might want to claim it on your own website. They can just hook into the plugin as well.
- The claiming experience in our UI is gated by an OFAC list (O-F-A-C). You can also geofence it for specific countries.
- In 1.9.0, we added the ability to use an existing plugin as a body in multiple governance processes, so you don't have to have redundant bodies with different governance settings.
- Also for granular permissions, you can choose not to authorize any actions — so you're giving somebody execute with the execute selector condition, but just not authorizing anything yet. That makes it easier in the future to just add or remove selectors.

### Commentary and cross-feature notes
- This is important if somebody's from a country that's "bad" (see Transcription notes: it's unresolved whether "this" refers to the geofencing alone or to the OFAC gating and geofencing together).
- Using an existing plugin as a body across multiple governance processes has huge trade-offs: you can't have different governance settings in each, because the governance settings live in the body plugin. Also, the min duration can become really problematic, so the configuration is really risky — you should really work with the Aragon team to make sure you're setting this up right.

### Open questions and follow-ups
- On the trade-offs of reusing a body plugin across multiple governance processes: the author added an aside directed at the documentation agent — "maybe you [the documentation agent] can figure this all out yourself based on your knowledge of how all this works."

### Transcription notes
- "a country that's bad" is preserved verbatim as the author's own informal shorthand in the OFAC/geofencing context; the specific criteria for which countries qualify were not stated.
- Ambiguous referent: in the raw dictation, "And this is important if you're, if somebody's from a country that's bad" immediately follows the geofencing sentence. It's unclear whether "this" refers to geofencing alone or to both the OFAC gating and the geofencing described in the two preceding sentences. The cleaned text preserves "this" without resolving which feature(s) it attaches to.

## 1.10

### Features and changes
- We released 1.10.
- We also released the lock-to-vote plugin.

### Open questions and follow-ups
- There's lots of information online about the lock-to-vote plugin, so maybe we can just research it there. "But essentially, the idea is that, yeah, I'm just gonna copy-paste stuff from the announcement" (breaks off mid-thought — see Transcription notes).
- I will share all the marketing brain dumps later.
- We also need to create a guide about setting up guardian DAOs (main use case for lock to vote).

### Transcription notes
- Orchestrator note: a much earlier entry in this dump was also dictated as '1.10' (governance designer basic flow; likely 1.1.0). This entry is the actual 1.10 release.
- "But essentially, the idea is that, yeah, I'm just gonna copy-paste stuff from the announcement" — the sentence breaks off mid-thought; unclear whether "the idea is that..." was starting to describe the lock-to-vote plugin's mechanics (never completed in this chunk) or refers to the copy-paste plan.

## 1.11

### Features and changes

- We added Tenderly support for all chains that support it. There are two places you can run a simulation: from the proposal creation flow, and from existing proposal pages.
- The way the simulation works (I think I've mentioned this to you before) is that it simulates the plugin you're creating the proposal on, calling the DAO directly and passing that action array — so it's testing the actions and the permission. It does the same thing when you run it from the proposal page.
- We cache it so that you can't spam it and kill our Tenderly credits.
- Once a proposal has been executed, you also can't simulate it again, because it's just silly.
- The token voting plugin now supports timestamp-based clock modes as of 1.11, which supports veLockers because they use timestamps.

### Commentary and cross-feature notes

- But you can probably find this information in protocol doc, so maybe there's no need to go into detail here.

### Transcription notes

- The raw dictation says "V-lockers"; rendered here as "veLockers" per the project's frozen nomenclature list (which includes "veLocker"). Flagging in case a different term was intended.
- The phrase "now supports, after in 1.11, timestamp-based clock modes" was garbled in the dictation; rendered here as "now supports timestamp-based clock modes as of 1.11" without adding or removing information. Flagging in case "after" was meant to convey something other than the version number.
- In "you can probably find this information in protocol doc," the author never states what "this information" refers to. It could mean the veLocker/timestamp-based-clock-mode relationship specifically, the clock-mode change specifically, or the protocol-level details generally — kept as the author's own ambiguous "this information" rather than resolved to a specific scope.

## 1.12

### Features and changes

- I think we've already talked about this, I'm not sure, but in app 1.12 we added support for the safe owner condition. The safe owner condition returns true or false depending on whether a particular address is one of the owners on the configured safe. This is used, for example, if you want to allow members of a safe to be able to create a proposal. We already talked about this and we handle this all in the background when you add a safe as a body.
- Governance processes can also be uninstalled directly from the app. To do this, you go to the process details page, where it's a two-transaction process: first you prepare the uninstallation, and the second transaction is to actually apply the uninstallation, which needs to be done by creating a proposal to the DAO.

### Commentary and cross-feature notes

- Something users have to be intensely aware of: you don't want to uninstall all of your governance processes. You don't want to uninstall a process that's your only process with unconditional execute, because then you're sort of bricking your DAO - or rather, not really bricking it, but making it somewhat semi-immutable.

### Transcription notes

- Raw: "...whether or not the configured safe has a particular address as part of the, is one of the owners on that safe." The clause "as part of the" is an abandoned false start before the speaker self-corrects to "is one of the owners on that safe" - the fragment is omitted from the cleaned sentence above; flagging rather than silently smoothing over it.
- Raw: "...it's a two, so you go to the process details page. On the process details page, you have to prepare an uninstallation in one transaction, and the second step of the transaction, for two transactions, is to actually apply the uninstallation..." This is garbled/ambiguous between (a) one transaction with a "second step of the transaction," and (b) a two-transaction process where the second of two transactions applies the uninstallation. The cleaned bullet above follows reading (b) ("a two-transaction process: first you prepare... and the second transaction is..."), but the raw phrase "the second step of the transaction" (which would support reading (a)) was dropped without note; flagging the ambiguity here instead of resolving it silently.

## 1.13

### Features and changes
- In app 1.13, we added a feature where calling execute proposal — in plugin version 1.4 or whatever, let's just say, later versions of plugins — is permissioned. By default, in some cases, we just grant that permission to everyone. But if that permission is granted to someone more specific, the UI will check for it: there's a little UI guard that will say, no, you can't do this.

### Transcription notes
- The phrase "execute proposal in 1.4 or whatever, later versions of plugins" is garbled in the original dictation. It's unclear whether "1.4" is a specific plugin version number or a rough, uncertain reference (hence "or whatever") to when this permissioned behavior for execute proposal started. Preserved as close to the original phrasing as possible rather than resolved.

## 1.14

### Features and changes

- We extended the vote escrow locker, the veLockers, to support dynamic withdrawal fees. If you withdraw early, you have to pay a fee, and that fee gets sent to the DAO. Currently, you have to configure this yourself — we don't configure it for them.
- This is a feature that is in the veLocker.

### Transcription notes

- The raw dictation for the withdrawal-fee configuration point was garbled/self-contradictory: "Again, this is all just, currently, of course, they have to, you have to configure this yourself, we don't configure it for them." The false start "they have to, you have to" was smoothed to "you have to" in the bullet above. There is an unresolved shift in who is being addressed: "you have to configure this yourself" reads as addressing the reader directly, while "we don't configure it for them" refers to a third party ("them") — it's unclear whether these refer to the same party or two different parties. The discourse markers "Again" (implying this self-configuration point was already made earlier) and "of course" (treating the point as obvious) were dropped from the bullet above and are recorded here.

## 1.15

### Features and changes

In 1.15, we added gauge voting — a new plugin called the gauge voter plugin. This also falls into the premium Aragon services category — we deploy it for people.

Gauges are a whole voting mechanism that amounts to non-proposal-based governance. By default, gauges are just signaling — when you vote on a gauge, the outcome isn't binding on chain.

You can have one or more gauges. Whoever holds the relevant permission — it isn't actually called "gauge admin," but that's the function it serves — can add gauges, remove gauges, activate them, and deactivate them. This is well documented in the V-governance repo.

To start, you create a gauge — a gauge is just something you can vote on. Voters have a certain number of tokens and vote on a gauge; you can vote on any number of gauges and distribute your tokens proportionally across them in your vote. Gauges also have epochs; each epoch, your votes can roll across each epoch, or not.

Gauges are generally used together with escrow governance, with vLockers — the contracts live in the same repo, though that's probably not relevant here.

When you add or remove gauges, we have a basic action view in the action builder, so the experience is nice for them. Gauges can have metadata, and a gauge has an address.

We also, for example, support — again, a client would have to reach out to us for this — the ability to distribute rewards based on gauge vote outcomes, using the OSX capital distributor.

### Commentary and cross-feature notes

Gauges themselves aren't binding, but they're still another kind of governance — governance in the sense that people are voting.

There's another comment you made somewhere I read in the docs saying that because something is a governance plugin, it's therefore IProposal. But I don't think that's right: it assumes all governance is IProposal, which is generally true but not strictly true. You could hypothetically have other plugins that are governance — governing things — without having proposals per se. We're making that distinction because it's important.

### Open questions and follow-ups

- You should probably look up more about gauges in the future, but more or less how they work. So any questions you have, you can follow up, of course.

### Transcription notes

- "V-governance repo" is preserved as transcribed. Given the vote-escrow/gauge context, this may actually be a "ve-governance" (or "veGovernance") repo, but the exact name wasn't confirmed, so the literal transcription was kept.
- "vLockers" is preserved as transcribed. This may correspond to the term "veLocker(s)" used elsewhere, but this wasn't confirmed for this chunk, so the literal transcription was kept.
- The dictation said "IP proposal"; this is written above as "IProposal" as the cleaner's best guess at the intended term, but that spelling wasn't independently confirmed for this chunk. This should not be read as settling the author's own disagreement (see Commentary and cross-feature notes) about whether all governance plugins are IProposal.
- "each epoch, like, your votes can roll across each epoch or not" is stated with some uncertainty/informality in the dictation; the exact epoch-rollover mechanic is preserved as-is rather than resolved.
- "you should probably look up more about gauges in the future, but more or less how they work" — the clause "but more or less how they work" is a garbled/ambiguous fragment in the dictation; it plausibly begins an aborted clause (e.g., a promise to explain the mechanics) rather than cleanly modifying "look up." Preserved as transcribed rather than resolved into cleaner prose.

## 1.16

### Features and changes

- We updated the action builder so you can reorder actions and remove individual actions.
- We updated the gauge voting dialog so you just specify weights and it calculates the percentages programmatically. This is how it works in the contract, so doing it this way in the UI is a little bit easier - you don't have to do any math, you just set weights on them and it calculates the percentage.

### Transcription notes

- In the raw dictation about the gauge voting dialog, the author started a clause with "you don't have to make sure that..." before self-interrupting and continuing with "you don't have to do math or anything." The abandoned clause's intended meaning is unclear, so it isn't reflected in the bullet above beyond the completed thought.

## 1.17

### Features and changes
- In 1.17, we added the ability to export an array of actions as JSON. You can do this from the proposal details page, or a governance process that's in progress, or from the executions tab of the transactions list — open an execution and download the action array.
- The JSON is just an array of actions with a standard format of two-value data in an array form, with all the data encoded.
- That JSON can then be imported into the Action Builder.
- Because you can download from different places, different flows are supported.

### Transcription notes
- "a standard format of two-value data in an array form" is preserved as dictated. The exact meaning of this phrase is ambiguous — flagging rather than silently correcting or interpreting further.
- "You can do this from the proposal details page, or a governance process that's in progress" (bullet above) is ambiguous as dictated: "or a governance process that's in progress" could name a second, independent export location, or could instead describe the proposal details page itself (i.e., the proposal details page of a governance process that's in progress). Preserved as dictated rather than resolved.

## Third-party dependencies (aside)

### Features and changes
Maybe it's also relevant to point out that some of our third-party dependencies have changed a little bit. For example:

- **Token prices**: we get them from CoinGecko. A user might be interested in where those prices come from.
- **Indexer**: we use different indexing techniques for different chains, depending on the chain.
- **Block explorers**: for getting contract code, it all depends on the chain as well. We try to use Etherscan and Etherscan forks whenever possible.

### Transcription notes
- Orchestrator note: not tied to a release number in the dictation; it sits between the 1.17 and 1.19 entries.

## 1.19

### Features and changes
- We improved the importing of actions via JSON, where we decode the actions on the fly, as you go.
- In the same release, we also have logic to detect whether or not a token is spam. There's a bunch of heuristics involved, and it's not perfect.

### Open questions and follow-ups
- If anybody sees a bunch of spam, they can reach out to us, and we'll try to improve this filter.

## 1.20

### Commentary and cross-feature notes

In app 1.20, we did a bunch of stuff that's not relevant and that we never released.

## 1.21

### Features and changes

- We introduced the concept of linked accounts — a bi-directional on-chain permission signal that acknowledges one DAO from the other.
- From the linked account, you can see the governance processes all together, and see which plugin is pointing to which DAO — or governance process rather.
- You can also access the token panel from the gauge voting page as well, not just the gauge voting plugin — the plugin is used on the gauge voter as the token, kind of like the token panel on the members page.
- Going back to the spam token thing: we added an ability to manually filter out spam tokens if somebody lets us know. We have it in the app CMS.

### Open questions and follow-ups

- I think I've mentioned linked accounts before, but we probably need to do a breakdown. I'll give you more information about linked accounts later, I guess.
- I'm not going to go into it here, but if you have a bunch of questions, you need to create a task for me to get more into it. I can also share the marketing brain dump.

### Transcription notes

- Orchestrator note: dictated as "In app 21, 121"; rendered as 1.21 (it follows 1.20 and precedes the 1.20.22 and 1.23 entries).
- The passage "you can access the token panel from the gauge voting page as well, not just the gauge voting plugin. The plugin's used on the gauge voter as the token, kind of like the token panel on the members page" is garbled/ambiguous in the original dictation — the exact relationship between "gauge voting page," "gauge voting plugin," and "gauge voter" is unclear, preserved close to verbatim.
- Self-correction preserved rather than silently resolved: the author said "which plugin is pointing to which DAO, or governance process rather" — voicing "DAO" before retracting to "governance process." Since a linked account is a link between two DAOs, "which DAO" and "which governance process" are substantively different readings, so both are kept.

## 1.20.22 (dictated - likely 1.22)

### Features and changes
- In the VLocker UI component in the token panel, we added a check: if the slope of the rewards curve is flat, we don't show the curve. This is a small adjustment.
- We show DAO metadata wherever possible - for example, we list the DAO name from the metadata file.
- If a DAO has no metadata, we fall back to showing the DAO address throughout the application. This is a minor quality thing.

### Open questions and follow-ups
- Instruction to the documentation process: you probably need to ask about the metadata structure somewhere, for all the different places where we use metadata.
- The author flagged that this is probably something they should populate as a task themselves.

### Transcription notes
- Orchestrator note: dictated as 'app 1.20.22'; positioned between 1.21 and 1.23, so possibly means 1.22. Preserved as dictated.
- Dictated as "VLocker" in this chunk. Elsewhere in the documentation the established term is "veLocker" - this may be the same component transcribed differently, but it is preserved here as dictated rather than silently corrected.

## 1.23

### Features and changes
- In 1.23, we added basic action views also for pausing, resuming, and ending campaigns on the capital distributor.
- We also added a really nice onboarding flow for when a user connects and has tokens or underlying locks but hasn't yet set their delegation — they're delegated to zero, 0x00000 (that's how it works in Ethereum on tokens). A little dialog pops up showing the same UI as the delegate component of the token panel, but in a dialog, prompting them to go delegate.

### Transcription notes
- The dialog description was self-corrected mid-dictation: it was first called "the same onboarding flow we already have, nothing new," then corrected to clarify it's not the same onboarding flow — it's the same UI from the delegate component of the token panel, shown in a dialog instead. The cleaned text above reflects the corrected version.

## 1.24

### Features and changes

- We have an onboarding flow that checks on login — this is part of 1.24 — and encourages users to lock or wrap their tokens, depending on which plugin they're using. If a user has a veLocker, or is using a token wrapper, we check whether they have the underlying token in their balance. If they do, we pop up a message saying: "hey, you have unlocked or unwrapped tokens — do you want to wrap them?" Again, the dialog uses the same components for locking and wrapping them, and it then transitions into the delegate flow.
- We added the ability, via the app CMS, to hide plugins from the datalist pages.
- The Explore page has been updated in 1.24. Rather than just showing a generic dashboard, we now show an onboarding dashboard where we say: "hey, reach out to the Aragon team so we can help you out" — linking out to the contact form. Or, the secondary CTA is to go set up their governance, which leads into the governance designer from normies.

### Commentary and cross-feature notes

- Why we added the ability to hide plugins from the datalist pages: this ties back to being able to reuse bodies (there can be other reasons too, but this is one of them). You might have one group of stakeholders — the same sort of census, if you will. We don't have a formal concept of a census, but if you think about it, that's part of what a plugin is: we have a census coupled to the governance plugin. You can have two plugins that both represent governing bodies but use the same token — is it the same body because it's the same census? Maybe they want different governance parameters: in one process they want certain governance parameters, and in another process they want different ones, but it's technically the same people involved in both.
- We got feedback from some people that it was weird that the members page listed the same set of members twice. So we added the ability to manually override that in the app CMS — we just say "hide this plugin" and one of them gets hidden. It's mildly sneaky, but not too bad. The client is fine with it, and it makes things a little simpler for people to do and see.

### Open questions and follow-ups

- I said I'd quickly explain why we did the hide-plugin thing, and flagged that if it's complicated, we might need a whole separate topic for it later — possibly a guide or an explanation.

### Transcription notes

- Raw chunk says "vLocker" — normalized to "veLocker" to match the frozen nomenclature term used elsewhere in this documentation. Flagging in case a distinct term was actually intended.
- Raw chunk says "Argon team" — normalized to "Aragon team" (the company name), since this is almost certainly a mis-transcription. Flagging for confirmation.
- The raw sentence "And again, it just like goes to the, in the dialogue are the same components for locking and wrapping them" is self-interrupted — the speaker starts "it just like goes to the," abandons that clause, and restarts with "in the dialogue are the same components...". Smoothed into one complete sentence in the main text ("Again, the dialog uses the same components for locking and wrapping them"); flagging the garble here per the no-silent-correction rule.
- "the governance designer from normies" — preserved as dictated; ambiguous whether "from" is as intended or a mis-transcription of "for" (which would change the meaning), and unclear what "normies" refers to. Kept literal since I'm not certain.

## 1.25

### Features and changes

- Remember we added this onboarding stuff relating to tokens — delegating and locking: we added little onboarding cards in the member list, so you can see it again, as an entry point.
- We updated the order of the member list so that the connected user and their delegate are pinned first at the top. Normally the list is sorted by voting power, decreasing; but in the case of delegation, the connected user is first, so you can see your voting power, and then their delegate is right next to them.
- We updated the member profile pages so that extra ENS data is shown on the pages: their bio (which comes from the standard ENS fields), also their avatar, of course, and also their social resources links - those are standard. ENS data is fetched in the front end in real time, so we treat ENS as a source of truth.
- In the app CMS, we created the ability to override or hide certain things in the nav bar. For example, imagine we installed gauges on a DAO but don't want people to see them - we can just hide the gauges.

### Commentary and cross-feature notes

- "Maybe sorting, that's a whole other interesting topic": all the datalists don't currently support custom sorting — we just hardcode the sorting, so it sorts by voting power decreasing.
- On the nav bar hiding: "Because normally everything's programmatic." That's like a core — "I don't know if it's like a philosophy, but it's kind of like a design principle" — because code is law, everything should kind of percolate up.

### Open questions and follow-ups

- I still need to reference the standard ENS fields we're using for bio, avatar, and social links - I need to give you this information at some point, or you can find it online.
- ENS has their own — "I forget what they call it; I think they actually did EIPs, to be honest" — where you have fields that are standardized, and we're using those fields.

## 1.26

### Features and changes

- We added a small delegations card to member profiles, showing the amount of delegations that delegates have received, as well as their total voting power and token balance.

### Transcription notes

- Orchestrator note: dictated as 'In app 1.23, sorry, in 1.26' - the author self-corrects to 1.26 and notes 1.23 was already covered.

## 1.27

### Features and changes

- In app 1.27, we added a feature that also looks at the app CMS, which supports featured delegates.
- If you specify some addresses in the featured delegates area of the app CMS, we'll show those featured delegates first on the DAO dashboard.
- Featured delegates will also show as the first tab in the members list - the first tab people see when they go there.
- This is tied to a plugin, like a voting plugin.
- Featured delegates don't actually have to have voting power or anything like that - the project will just tell us, "these are some featured delegates."
- I think I already said it, but gauges has its own dedicated page - one page for the whole gauge plugin, since there are no proposals or anything. That page is linked up in the navbar.

### Transcription notes

- "This is tied to a plugin, like a voting plugin" - the dictation doesn't make clear whether "it's" refers to the featured delegates feature as a whole or specifically the members-list tab. Preserved as stated without resolving.

## 1.28.0

### Features and changes

App 1.28.0 is a pretty big release. We released Aragon Names.

We give Aragon Names away for free. We own the Aragon.eth account, so if somebody wants to create a name like Vitalik.aragon.eth, they can just go claim it (e.g. if Vitalik wanted to, he'd go claim Vitalik.aragon.eth). We check to see if it's available, and then in the background we claim it. We have a registry contract. And they claim it. Then we help them set it as their primary name, so they can essentially claim their own Aragon name and make it their primary - that's what shows up anywhere in Web3, so they don't have to go buy their own ENS name.

Something cool: this works whether they have their own ENS or an Aragon Name, because an Aragon Name is ENS. Either way, they can create an Aragon profile. In the Aragon profile, they can populate all of the things we show on the profile page (as already mentioned before) - the bio, the links, that kind of stuff, including an avatar. We show user avatars throughout the product, kind of all over the place, which is cool; otherwise we fall back on the blocky default.

The one unique thing we did is create a standard extension for delegate statements. Per token — because you delegate per token — you can create a statement. Inside of it there's a JSON (or whatever) with some specific structure, which I can also share with you. You fill in your delegate statement with rich text and everything, and that gets pinned to IPFS. That updates your ENS record, and your ENS record then has a link to the IPFS content. We fetch all of that and show it in the UI as their delegate statement for each token, next to all the delegate information on their member profile.

To be totally clear about the flow: you set up your profile after we realize that you have an ENS, which might come after claiming your Aragon name if you didn't already have an ENS. And for each token - if your DAO has multiple tokens - that's where you do your delegation, and therefore your delegate statement.

We don't store any information about the user anywhere. We have a flow that helps you connect to the ENS contracts nice and easily, but that's just a helper - it's stored on the blockchain, we don't actually store anything ourselves. "If you want any of this information to be released and like made, you know, essentially deleting all of your data from ENS" (garbled — see Transcription notes), we have a flow for that which does all the work for you: you just go in and say you want to delete your Aragon name, and it deletes your profile. Somebody else can obviously claim your name after that.

Maybe it's also important to point out that all of this claiming and stuff for Aragon names happens on Ethereum mainnet (dictated with an abandoned fragment — see Transcription notes). We use the canonical mainnet deployment for every chain - for every chain that your DAO is on, we look to mainnet and resolve ENS on mainnet, always.

### Commentary and cross-feature notes

- Instruction to the documentation agent: "make sure when you're logging all of this stuff, you're explaining it first and foremost from the user perspective, not just from, you know, how it works, because that would be weird."

### Open questions and follow-ups

- The delegate statement JSON has a specific structure, "which I can also share with you. Maybe take a note that you need this information" (addressed to the documentation agent).

### Transcription notes

- "And then we, in the background, we claim it. We have, like, a registry contract. And they claim it." - it's unclear from the dictation whether "we" (Aragon) or "they" (the user) is the one claiming via the registry contract, or whether both happen in sequence. Preserved both statements as dictated.
- The description of the profile-setup ordering was self-corrected multiple times in the original dictation ("you set up your profile after making it your... after you say, hey, this is... after we realize that you have an ENS"). Cleaned to the final resolved meaning: profile setup happens after we realize the user has an ENS.
- "And if you want any of this information to be released and like made, you know, essentially deleting all of your data from ENS" — the clause "and like made..." is incomplete, and it's ambiguous whether "released" means published or relinquished; the surrounding text describes a deletion flow.
- The mainnet sentence was dictated as "Also, maybe it's important to point out that the, you need to, all of this claiming and stuff for Aragon names happens on Ethereum mainnet" — the fragment "that the, you need to," was abandoned mid-sentence.

## 1.30

### Features and changes

- On app 1.30, we have a very subtle, almost secret-like feature: any time an account is connected to the Aragon app — an EOA, a safe, or anything else — and you have execute permission, then on the transactions page there's a little button that says plus transaction. It opens the transaction wizard, which goes straight into the action builder. From there you can select all your actions, simulate, and create the transaction; you sign the actual transaction with your wallet, and then it will just do the transaction. So it's essentially bypassing the proposal creation flow.

- Also in 1.30, we created basic views for certain actions — for really complex, tricky actions. For example, if you call execute on the DAO as an action, that's a little counterintuitive, because normally proposals call DAO.execute directly. But if you actually have an action within there, it's essentially nested — you have a nested action array within an action.

- There's a similar problem with proposal creation: "if one DAO is, for example, or" (false start — see Transcription notes) you have one proposal telling a DAO to go create a proposal on another plugin — again a strange workflow, but there are some weird edge cases where you might want to do it — none of that decoded properly. So we created some nice basic actions for nested decoding.

### Commentary and cross-feature notes

- However, I don't want to — my point here isn't to talk about these two things as features; they're more just examples of an underlying problem: nested actions can become tricky to deal with in general, and most UIs don't support them well. We do our best to support it, but these are just certain cases.

### Transcription notes

- "So if one DAO is, for example, or you have one proposal telling a DAO to go create a proposal on another plugin" — the abandoned false start "if one DAO is, for example, or" gestures at a DAO-to-DAO framing that the completed sentence doesn't carry. Preserved as dictated.

## 1.33

### Features and changes

- We added the ability for Aragon names to change: you can change what your Aragon name is, and all of your existing ENS records will move over to the new name.
- Across wizards generally (for example, when you're trying to create a proposal), we're being careful about a general technical question: if something is sent to a wallet and the transaction doesn't go through, or there are wallet issues where the wallet provider messes up, we don't know the resulting state because the wallet is being weird. The transaction might actually have gone through, and if the user tries again, they could accidentally create two proposals. To guard against this, whenever something is sent to the wallet we kind of remember that it was sent, and we give the user a little warning telling them to go check the block explorer and figure things out.

### Commentary and cross-feature notes

- The name-change behavior (existing ENS records moving over to the new name) is described as "pretty cool."
- The wallet-transaction-state warning is framed as a general technical question we're really doing our best on, applicable broadly across wizards, not just proposal creation.
- Hedge from the author on the wallet-state warning: "I think this is us just being nice. I don't really know."

## 1.34

### Features and changes

- It's a very, very minor UX improvement to the proposal creation pre-dialog process selector thing, where you select which process you're creating a proposal in:
  - The processes you don't actually have permission to create should be disabled.
  - The processes you are able to create should be enabled and floated up to the top.
  - You want to see why you can't create some of them: there's a "view requirements" link, and clicking it takes you to the process details page, which explains it.

### Transcription notes

- Raw: "When you show in the proposal creation pre-dialog process selector thing" is grammatically broken (possibly "when you're shown" or "when you open" the selector — unknowable which). Smoothed for grammar above while keeping "process selector thing" (the author's own vague noun, not upgraded to a specific UI term like "screen").
- Raw uses "should be disabled" / "should be enabled" rather than "are disabled" / "are enabled" — this reads as ambiguous between describing already-shipped behavior and intended/spec'd behavior. Kept as "should be" rather than resolved either way.
- Raw word order for these two clauses is dangling/non-standard: "the ones should be disabled that you don't actually have permission to create" and "the ones that should be enabled and floated up to the top that you are able to create stuff." Reordered above for readability; flagging that the original order was silently normalized.
- Raw: "And then you want to see why you can't create some of them" reads as a hypothetical/walkthrough framing ("suppose you want to see...") rather than an asserted existing capability; kept as "you want to see" rather than "you can now see" (the word "now" does not appear in the raw).

## 1.35

### Features and changes

- We added some things that were missing on the process details page.
- If you have a Safe, for example, that's a member of a DAO — by which we mean a Safe that's a body on a process — we now show a little Safe logo next to it.
- If a Safe is able to create proposals due to the Safe owner condition, we now show that in the process details page, in the proposal creation section.
