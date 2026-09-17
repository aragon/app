# Release notes — ordered by topic (2026-08-03)

Topical reorganization of `inbox/2026-08-03-release-notes-cleaned.md` (itself cleaned from `raw/release_notes.md`) into 18 major categories instead of 34 per-release entries. Every item carries its originating release version in parentheses, e.g. "(1.7.0)", so provenance back to the release-ordered capture survives the reshuffle. Content legitimately relevant to more than one category is cross-referenced rather than duplicated in full; where an item's home category was a genuine judgment call, that call is recorded under the category's own Transcription and placement notes rather than silently made.

Produced by 18 parallel extraction passes (one per category) plus a completeness sweep comparing every item back against the cleaned, release-ordered source; one gap the sweep found (the 1.0.0 body-adding/plugin-slot mechanism) was folded into "Governance model" below. Inbox rules apply: draft capture, not established fact — this is provenance-preserving reshuffling, not new analysis.

## Categories
- Explore page & DAO discovery
- DAO creation, admin experience & DAO-level presentation
- Governance model: processes, stages, bodies, the governance designer & external/Safe bodies
- Permissions & granular access control
- Proposal lifecycle: transactions, simulation & datalists
- Action builder & complex/nested actions
- Token voting: importing & wrapping ERC-20s
- Token panel, delegation, address input & onboarding nudges
- veLockers (vote escrow lockers)
- Gauge voting
- Lock-to-vote plugin
- Capital distributor & Merkle-based reward distribution
- Premium / partially-supported services model
- Member identity: Aragon Names, ENS profiles & delegate statements
- App CMS content configuration
- Linked accounts
- Platform infrastructure: networks, contract upgrades & third-party integrations
- General UI infrastructure, wallet safety & miscellaneous notes

## Explore page & DAO discovery

### Features and mechanics

- (1.0.0) The explore page launched with the initial product release — it's the page you land on when you just go to app.aragon.org.
- (1.0.0) The explore page has a top header — the dictation is garbled here ("which just says, like the hero page"): unclear whether the top header is the hero page, says something on it, or sits on the hero page (see transcription and placement notes below).
- (1.0.0) Below the header, "featured DAOs" — a carousel of DAOs that Aragon manually chooses to feature.
- (1.0.0) The featured DAOs carousel is controlled by the app CMS repo (Explore-page-specific fact only — the app CMS mechanism itself is out of scope for this category).
- (1.2.1) Hotfix: testnet DAOs excluded from the All DAOs list on the explore page.
- (1.2.1) Explore page layout, recapped as "another important thing about the explore page that I didn't mention earlier": a carousel, then CTA buttons such as "get in touch with the team" and "create a DAO," and then the DAO list.
- (1.0.0, refined 1.2.1) The DAO list has two tabs: **All DAOs** — sorted by total assets in US dollars, and excluding testnet DAOs "so it's not noise" per the 1.2.1 hotfix — and **Member** — shows all the DAOs the user is a member of; being a member in just one plugin is enough to count.
- (1.24) The Explore page was redesigned: rather than just showing "a generic dashboard," it now shows "an onboarding dashboard."
- (1.24) Onboarding dashboard primary CTA: "hey, reach out to the Aragon team so we can help you out" — linking out to the contact form.
- (1.24) Onboarding dashboard secondary CTA: go set up their governance, which leads into the governance designer "from normies" (see transcription and placement notes below).

### Transcription and placement notes

- (1.0.0) Source transcription note: "there is like a top header, which just says, like the hero page" — garbled: unclear whether the top header is the hero page, says something, or sits on the hero page. Preserved as dictated.
- (1.2.1) Placement/reading note: this category's brief tags the DAO list and its two tabs as "(1.0.0, refined 1.2.1)." The 1.2.1 text itself introduces the DAO list by saying it's "another important thing about the explore page that I didn't mention earlier," implying the DAO list already existed from launch and is only now being fully described in the dictation, while the actual 1.2.1 change is specifically the testnet-DAO exclusion. The source never explicitly dates the DAO list's origin to 1.0.0 in so many words; tagged here per that reading rather than asserting it as directly dictated.
- (1.2.1) Placement/reading note: "on the explore page there's a carousel that shows all the DAOs" could be a loose re-description of the "featured DAOs" carousel already established in 1.0.0 (a manually curated subset), or could instead be read as naming a second, distinct carousel that shows the complete DAO list rather than a curated feature set. The source doesn't disambiguate; treated here as the same featured-DAOs carousel, consistent with how this category was scoped (only one carousel is named in the scope).
- (1.24) Source transcription note: "the governance designer from normies" — preserved as dictated; ambiguous whether "from" is as intended or a mis-transcription of "for" (which would change the meaning), and unclear what "normies" refers to. Kept literal since the source isn't certain.
- (1.24) Source transcription note: the raw chunk says "Argon team" — normalized to "Aragon team" (the company name) in the onboarding-dashboard CTA copy, since this is almost certainly a mis-transcription; flagged for confirmation in the source.
- (1.27) Placement note: the 1.27 entry says featured delegates are shown "first on the DAO dashboard." This "DAO dashboard" may or may not be the same surface as the Explore page's "dashboard" terminology introduced in 1.24 ("generic dashboard" → "onboarding dashboard") — the source doesn't clarify whether these are the same page or a different, per-DAO home screen. The featured-delegates substance itself belongs with member identity (elsewhere); flagging only the terminology overlap here in case it turns out to name the same surface.

## DAO creation, admin experience & DAO-level presentation

### Features and mechanics

- (1.0.0) A whole DAO creation flow: you can launch a new DAO and it goes into the admin experience ("not sure if we've discussed this before" — hedge from the source, repeated under Open questions below).
- (1.0.0) The admin-vs-non-admin settings-page banner: when you're an admin and go to the settings page, there's a banner notifying you that you're an admin and need to set up your governance. If you're not an admin, it instead says the DAO is controlled by admins, with a "View Admins" click that shows you the admins.
- (1.0.0) You can remove the admin plugin, which is essentially uninstalling a plugin — i.e., saying you're done with the DAO / done with the initial setup.
- (1.0.0) After removing the admin plugin, another alert is shown to make sure you're properly set up — "we use the critical alert because this is important" (quoted as dictated; see Transcription and placement notes below for the unresolved ambiguity about which alert this names).
- (1.0.0) The admin plugin is "kind of like a multisig" in that it's built around a member list — the list of admins — and all of those admins can execute proposals immediately (i.e., calling create proposal).
- (1.0.0) You can also add or remove other admins: you click into it, a dialog opens, and you add or remove them like members; of course, this requires a transaction.
- (1.3.0) When a DAO is deployed on Ethereum mainnet, it's able to get an ENS subname. Aragon uses dao.eth, so you could use something like mydao.dao.eth, and you can use that to send assets to your DAO and stuff.
- (1.4) When you have a DAO.eth subname, you can use that in the URL to access the DAO — "it's like a friendlier name."
- (1.10/1.1.0) DAO slots as a presentation mechanism: the first DAO slot was a custom DAO header, so you can create a header for the DAO.
- (1.10/1.1.0) Open Graph metadata was added for pages, for when you share social links.
- (1.20.22/likely 1.22) DAO metadata is shown wherever possible — for example, the DAO name is listed from the metadata file.
- (1.20.22/likely 1.22) If a DAO has no metadata, the app falls back to showing the DAO address throughout the application ("this is a minor quality thing").

### Commentary and rationale

- (1.2.0) Within the two-step deploy-then-install/proposal pattern for governance processes, the second transaction has to go through governance "because you need some plugin that has execute permission to actually go and execute all these things" — the source explicitly notes that "even if you're an admin," "an admin just passes it automatically." This reaffirms the admin plugin's immediate-execution mechanic already described under 1.0.0 above. (This point sits centrally inside a category-5 discussion of the two-step transaction pattern — flagged as a placement judgment call; see Transcription and placement notes.)

### Open questions and follow-ups

- (1.0.0) Hedge, stated twice in the source: "not sure if we've discussed this [the DAO creation flow] before" and, restated in the open-questions list, "Not sure if the DAO creation flow has been discussed before."
- (1.20.22/likely 1.22) Instruction to the documentation process: "you probably need to ask about the metadata structure somewhere, for all the different places where we use metadata."
- (1.20.22/likely 1.22) The author separately flagged that this is probably something they should populate as a task themselves — the source states this as its own bullet immediately after the metadata-structure instruction above, without fully re-stating what "this" refers to; it reads as most likely pointing back at that same metadata-structure item, but that linkage is an inference, not stated outright.

### Transcription and placement notes

- (1.0.0) "We use the critical alert because this is important" is dictated with the definite article; which alert this refers to, and whether it names a specific component, isn't resolved in the dictation.
- (1.10/1.1.0) Orchestrator note carried over from the source: this chunk is dictated as "In 1.10" but sits positioned between the 1.0.0 dump and 1.2.0; a separate, later entry in the same dump announces the actual 1.10 release (lock-to-vote). Possibly means 1.1.0. The DAO-slots and Open Graph items above are tagged "(1.10/1.1.0)" accordingly.
- (1.10/1.1.0) Ambiguous construction preserved from the source: "We also added this concept I think we've talked about in the slot system." This could mean (a) a concept newly added inside an already-existing slot system, or (b) the slot system itself is the thing being introduced/discussed as previously mentioned. Preserved as dictated in the source; not resolved. Affects how to read the DAO-slots bullet above.
- (1.20.22/likely 1.22) Orchestrator note carried over from the source: dictated as "app 1.20.22"; positioned between the 1.21 and 1.23 entries, so possibly means 1.22. Preserved as dictated.
- (1.2.0) Placement judgment call: the "even if you're an admin and an admin just passes it automatically" aside lives inside a passage that is centrally about the two-step deploy/install-via-proposal pattern (squarely category 5's territory — the universal transaction dialog / two-step process). Included here under Commentary and rationale only because it touches, and reaffirms, the admin plugin's auto-execution behavior established in 1.0.0's admin-experience material.

## Governance model: processes, stages, bodies, the governance designer & external/Safe bodies

### Features and mechanics

- (1.0.0) Core governance experience for the token voting plugin and the multisig plugin: "approval creation, voting, executing" ("I think you already know all this" — hedge preserved; see Transcription notes on "approval creation" possibly being a mishearing of "proposal creation").
- (1.0.0) Modular governance via the staged proposal processor: a DAO can have multiple governance processes, each process can have multiple stages, and each stage can have multiple bodies.
- (1.0.0) A body can either veto or approve within a stage, and it's this veto/approve behavior at the body level that enables optimistic governance — explicitly not that the stage itself is "optimistic."
- (1.0.0) A stage can also be configured with no bodies at all and instead just require a certain amount of time to pass — "that acts almost like a time lock, or like a delay app, something along those lines."
- (1.0.0) Adding a body via plugin slots: when creating token voting — i.e., in the flow for adding bodies — there's a slot where the flow hands off into launching a plugin: you're adding a plugin as a body, and the app launches all of the plugin components in a modular way. Introduced in the same breath as the token-wrapping concept (see category 7 for that), but this bullet is specifically about the body-adding/plugin-launch mechanism itself.
- (1.10, dictated — likely 1.1.0; see Transcription notes) The basic flow within the governance designer: you can deploy standalone plugins that are both a process and a body simultaneously.
- (1.2.0) Governance processes are described as coming in three varieties — "standalone, basic, or advanced" — deployed/configured via the two-step deploy-then-install pattern (the two-step mechanic itself is category 5's; the standalone/basic/advanced taxonomy is noted here — see Transcription and placement notes).
- (1.3.0) Support added to add any external body: bodies aren't limited to Safes — "you can have any other address as a safe. You can have a governor as a safe, or anything that can execute stuff." Described as the body acting as an account or agent, e.g. externally owned accounts (EOAs) — "it's kind of janky, but you could do it."
- (1.3.0) When you install a governance process, you can use a governance process to install another governance process — "it's not just admin. That's important."
- (1.4) Safe as a body: when you add a Safe multisig as a body, a little custom branding is put on it, and a little Safe logo is shown (ambiguous whether the Safe-as-body type itself is new here or only the branding/logo — see Transcription and placement notes).
- (1.5.0) Copy change for optimistic governance stages: when a voting body is "in veto mode," the UI says "yes to veto" instead of "yes to approve," so it's clearer whether someone is vetoing or approving.
- (1.5.0) Stages can advance early if the configured criteria is met — this is optional, "an option — it's a configuration," not default behavior.
- (1.8.0) Granular permission management (granular access control) work was added to the governance designer in 1.8.0 (the substantive mechanics — execute selector condition, target/selector authorization, condition factory, process-details-page authorized-selectors display, action-builder authorized-actions filter — belong to category 4 and are not repeated here; flagged only because the work is explicitly framed as living in the governance designer — see Transcription and placement notes).
- (1.9) Added the ability to use an existing plugin as a body in multiple governance processes, "so you don't have to have redundant bodies with different governance settings."
- (1.12) The Safe owner condition: returns true or false depending on whether a given address is one of the owners on a configured Safe; used, for example, to let members of a Safe create a proposal. Handled automatically in the background when you add a Safe as a body.
- (1.12) Governance processes can be uninstalled directly from the app via the process details page, as a two-transaction process: first you prepare the uninstallation, then a second transaction actually applies it, which must be done by creating a proposal to the DAO.
- (1.35) Things that were missing were added to the process details page, including: a little Safe logo shown next to a Safe that is a body on a process — "a Safe, for example, that's a member of a DAO — by which we mean a Safe that's a body on a process."
- (1.35) If a Safe is able to create proposals due to the Safe owner condition, this is now shown on the process details page, in the proposal creation section.

### Commentary and rationale

- (1.0.0) Optimistic governance (the body-level veto/approve mechanic) is explicitly called out as "a big, important concept that we need to discuss in more detail."
- (1.0.0) Terminology rebuke addressed to the documentation agent about optimistic governance: "Elsewhere in the documentation I've seen you call it multisig gating or safe gating. This is not normal terminology, I don't know what you're talking about." (Nomenclature flag: "multisig gating" / "safe gating" are explicitly rejected terms for this concept, per the frozen-nomenclature rule.)
- (1.4) The Safe logo/branding addition on Safe-as-body is called out as "just a little note and not really relevant."
- (1.5.0) Rationale for the yes-to-veto copy change: bodies vote in the affirmative to send a certain result, so "they're voting yes to a veto, which is slightly counterintuitive, but we do our best in the copy to make it a little more clear."
- (1.8.0) The rationale offered for granular per-process permissions frames a governance process as "wrapping around" an actual governing body, in service of enabling "checks and balances" — this restates the core process/body relationship from the governance model in support of the (category-4) permissions argument (see Transcription and placement notes).
- (1.9) Reusing an existing plugin as a body across multiple governance processes "has huge trade-offs": you can't have different governance settings in each process, because the governance settings live in the body plugin; also, "the min duration can become really problematic," so "the configuration is really risky" — recommendation to work directly with the Aragon team to set this up correctly.
- (1.12) Explicit user-facing risk flagged: you don't want to uninstall a governance process that's your only process with unconditional execute, because then you're sort of "bricking your DAO — or rather, not really bricking it, but making it somewhat semi-immutable."
- (1.24) Elaboration on why plugins/bodies get reused across processes (raised while explaining the app-CMS hide-plugin feature — category 15's core content — but substantively about the governance model's "body" concept; see Transcription and placement notes): the product has no formal concept of a "census," but a plugin effectively couples a census (e.g. a token/stakeholder group) to a governance plugin; two plugins can both represent governing bodies using the same token/census yet want different governance parameters in different processes, even though "it's technically the same people involved in both."

### Open questions and follow-ups

- (1.0.0) The plugin components launched modularly via the slot system, in the body-adding flow above, are worth investigating further when evaluating the slots in the codebase.
- (1.5.0) Stages advancing early per configuration is flagged as "one maybe important thing to note... but maybe we can talk about this in the governance designer later" (ambiguous whether "this" refers to the early-advancement behavior specifically or to the governance-designer walkthrough generally — see Transcription notes).
- (1.5.0) Suggested follow-up task: walk through the (advanced) governance designer so the author can "explain all of the things we show there." Noted that this advanced governance designer "is not made available to the public," but "it's a good way to understand the capabilities."
- (1.9) Aside directed at the documentation agent regarding the trade-offs of reusing a body plugin across multiple governance processes: "maybe you [the documentation agent] can figure this all out yourself based on your knowledge of how all this works."

### Transcription and placement notes

- (1.0.0) The stages/optimism line contained a self-corrected false start — "Each stage can be made optimistic by, if the body is configu..." — immediately restated as "a body can either veto or approve." The fragment was dropped as fully restated, but flagging in case any nuance about stage-level vs. body-level configuration was lost.
- (1.0.0) "Approval creation" (in "approval creation, voting, executing") may be a mishearing of "proposal creation," given the create/vote/execute pattern used elsewhere in the source. Preserved as dictated.
- (1.0.0) Audit-time addition: the body-adding/plugin-slot mechanism and its codebase-investigation follow-up were originally introduced in the source under a combined "Adding bodies and plugin slots (token voting)" heading together with the token-wrapping concept (category 7's material). The completeness audit found this specific plugin-slot/body-adding content had not been carried into any of the 18 category files and added it here, since the mechanism itself is about the governance model's body-adding flow.
- (1.10/1.1.0) Orchestrator note carried over from the source: this "governance designer basic flow for standalone plugins" entry was dictated under a section labeled "1.10," positioned between the 1.0.0 dump and 1.2.0 — a separate, later entry in the same dump announces the actual 1.10 release (lock-to-vote). Possibly means 1.1.0; preserved as dictated rather than resolved.
- (1.2.0) Placement/overlap judgment call: the "standalone, basic, or advanced" description of governance-process types appears inside the source's passage about the two-step deploy-then-install pattern, which is centrally category 5's content. Included here only as a brief taxonomy note (not the full two-step mechanic) because it connects the 1.10/1.1.0 "standalone" flow and the 1.5.0 "advanced" governance designer into one taxonomy.
- (1.3.0) The external-body description says you can use "any other address as a safe" and "a governor as a safe." Since the point being made is that bodies aren't limited to Safes, this may have been intended as "as a body" rather than "as a safe" — preserved verbatim as dictated because the intended meaning is ambiguous.
- (1.4) Ambiguous whether the Safe-as-body type itself is new in 1.4, or only the custom branding/logo shown when adding a Safe as a body is new. Also unclear whether "a little Safe logo" is the same thing as the "custom branding" mentioned just before it, or a separate addition — the source states them as two separate sentences ("We put a little custom branding on it. We put a little Safe logo.") without equating them.
- (1.5.0) Raw dictation for the veto-mode description contained a false start — "a voting body is, like, in for, you know, it's like a veto mode" — before settling on "it's like a veto mode." The false start doesn't carry standalone meaning; only the approximating hedge ("like ... veto mode") is preserved above.
- (1.5.0) Ambiguous whether "but maybe we can talk about this in the governance designer later" refers specifically to the early-stage-advancement behavior or to the governance-designer walkthrough generally — the dictation doesn't make clear which "this" points to.
- (1.8.0) Placement judgment call: the granular-permission-management work is explicitly said to have been "added to the governance designer" in 1.8.0, and its stated rationale restates the governance process as "wrapping around" a governing body. Both are noted here for continuity with the core governance model, but the substantive mechanics (execute selector condition, target-contract/selector authorization internal and external, condition factory, process-details-page authorized-selectors display, action-builder authorized-actions filter and opt-out) belong to category 4 and are deliberately not duplicated here.
- (1.12) Raw false start dropped in the source's own cleanup: "...whether or not the configured safe has a particular address as part of the, is one of the owners on that safe" — the abandoned clause "as part of the" was dropped before the self-correction to "is one of the owners on that safe."
- (1.12) The uninstall-flow description is garbled/ambiguous in the source between (a) one transaction with a "second step of the transaction," and (b) a two-transaction process where the second of two transactions applies the uninstallation. The feature bullet above follows reading (b), consistent with the source's own resolution; the raw phrase "the second step of the transaction" (which would support reading (a)) was dropped by the source without note — flagging the ambiguity here rather than re-resolving it.
- (1.24) Placement judgment call: the census/body-reuse elaboration under Commentary and rationale above appears within the source's 1.24 section explaining the app-CMS hide-plugin feature (category 15's core content, including the members-page duplicate-listing feedback that motivated it, which is not repeated here). Included here as well because its substance — what makes a "body" the same or different across governance processes — belongs to the core governance model and connects directly to the 1.9 body-reuse item above.

## Permissions & granular access control

### Features and mechanics

- (1.8.0) In 1.8.0 a bunch of granular permission management (also called granular access control) work was added to the governance designer.
- (1.8.0) This addresses an important problem in the permission model of Aragon OSx: if you grant a permission to a plugin — such as the execute permission — the plugin is essentially telling the DAO to go do something. But the DAO has its own permissions too, so this collapses into a kind of chained, implicit permission. That means a governance plugin can tell the DAO to do stuff, and if you have multiple plugins, they're all telling each other to do stuff.
- (1.8.0) To address this, a whole other condition was created — called the execute selector condition — which isn't really shown in the product; it's described as, "to be honest," a workaround. It allows creating function-selector-based permissions that are routed through execute: the governance designer can now say that a given governance process is only able to call specific target contracts and specific function selectors on them.
- (1.8.0) These target-contract/selector authorizations can be internal (e.g., calling specific functions on plugins) or external (e.g., some random contract, like calling transfer on a token). Token contracts are all their own tokens, so you'd have to authorize these individually.
- (1.8.0) On the governance process details page, all of the authorized selectors are shown.
- (1.8.0) In the action builder, when creating a proposal, actions are filtered to only show authorized actions by default — though you can uncheck that to show everything, but then the action (or rather, executing the proposal) might revert.
- (1.8.0) All of the execute selector stuff is hidden in the background / abstracted away, via something called a condition factory (documented in the protocol doc) that the app interacts with; the user doesn't necessarily know about or see that.
- (1.9) Also for granular permissions: you can choose not to authorize any actions — so you're giving somebody execute with the execute selector condition, but just not authorizing anything yet. That makes it easier in the future to just add or remove selectors.
- (1.13) Calling execute proposal (in plugin version 1.4 "or whatever," i.e., later versions of plugins) was made permissioned. By default, in some cases, that permission is just granted to everyone. But if the permission is granted to someone more specific, the UI checks for it — there's a little UI guard that will say, no, you can't do this.

### Commentary and rationale

- (1.8.0) The rationale: you should be able to granularly grant permissions to a governance process, because a governance process represents an actual governance process wrapping around an actual governing body — you want to be able to create checks and balances and things like that. "This is really important." The author separately notes this checks-and-balances rationale for granular governance-process permissions is something already talked about a little bit before.

### Open questions and follow-ups

- (1.8.0) The permission model of Aragon OSx (the chained/implicit-permission issue above) is something the documentation agent might need to review in the protocol doc, as is the condition factory — which can also be learned about in the protocol doc and which the app interacts with.

### Transcription and placement notes

- (1.13) The phrase "execute proposal in 1.4 or whatever, later versions of plugins" is garbled in the original dictation. It's unclear whether "1.4" is a specific plugin version number or a rough, uncertain reference (hence "or whatever") to when this permissioned behavior for execute proposal started. Preserved as close to the original phrasing as possible rather than resolved.
- Placement judgment call (1.2.0): the commentary on the two-step deploy-then-install-via-proposal pattern explains the second transaction must be a proposal because "you need some plugin that has execute permission to actually go and execute all these things." This is a direct application of the execute-permission concept, so it is cross-referenced here in substance, but the two-step pattern itself is centrally catalogued under category 5 (proposal lifecycle).
- Placement judgment call (1.11): Tenderly simulation is described as simulating the plugin calling the DAO directly and passing the action array, "so it's testing the actions and the permission." Cross-referenced here for the permission-testing angle; the simulation feature itself is centrally catalogued under category 5 (proposal lifecycle).
- Placement judgment call (1.12): the warning that you don't want to uninstall "your only process with unconditional execute," because then you're "sort of bricking your DAO — or rather, not really bricking it, but making it somewhat semi-immutable," is a direct consequence of the execute-permission model, so it's cross-referenced here in substance; the uninstallation flow itself (the two-step prepare/apply-via-proposal process) is centrally catalogued under category 3 (governance model).
- Placement judgment call (1.12, 1.35): the safe owner condition — which returns true or false depending on whether a particular address is one of the owners on a configured safe, used e.g. to let members of a safe create a proposal (1.12), and by 1.35 shown in the process details page's proposal-creation section when a Safe is able to create proposals because of it — is conceptually a permission "condition," similar in kind to the execute selector condition / condition factory abstraction above, so it's cross-referenced here in substance; its content is centrally catalogued under category 3 (governance model / Safe as a body).
- Placement judgment call (1.30): the "plus transaction" feature (a button on the transactions page that opens the transaction wizard straight into the action builder, bypassing proposal creation) is available to "any time an account is connected to the Aragon app — an EOA, a safe, or anything else" that has execute permission. This is a direct application of the execute-permission concept, so it's cross-referenced here in substance; the feature itself is centrally catalogued under category 6 (action builder & complex/nested actions).
- Placement judgment call (1.34): the proposal-creation pre-dialog process selector disables "the processes you don't actually have permission to create" and enables/floats up the ones you are able to create, with a "view requirements" link to the process details page (the same page that, per 1.8.0, displays authorized selectors) to explain why. Cross-referenced here for the permission-gating angle; the UX feature itself is centrally catalogued under category 5 (proposal lifecycle).

## Proposal lifecycle: transactions, simulation & datalists

### Features and mechanics

- (1.2.0) The universal transaction dialog used across the app for doing transactions is a stepper: (1) it first prepares the transaction — pinning any IPFS data if needed, since metadata sometimes has to be posted with its IPFS hash passed along as an argument to something like creating a DAO, a proposal, or deploying a plugin; (2) then you sign the transaction; (3) then it confirms, and the dialog listens for the confirmation; (4) then the backend starts indexing, and the dialog listens for the indexing. You can either wait for indexing to finish — once it does, you click OK and it shows everything — or, if it's still indexing and you're impatient, you can click "continue anyway" and move on.
- (1.2.0) Certain flows — including deploying governance processes, whether standalone, basic, or advanced — follow a "two-step process," done "very methodically": you deploy all the plugins and configure them first (or at least do part of the configuration), then a second transaction actually installs it, though there may be some additional configuration done at that point too.
- (1.2.0) That two-step pattern is nice because the second transaction can then be the one that creates a proposal (see Commentary and rationale below for why this matters).
- (1.4) On the Proposals page, when viewing a proposal, the app loads it and decodes the actions in real time while waiting for everything to load.
- (1.6.0) The datalist pages were updated, but not all of them — just the proposals datalist.
- (1.6.0) Proposals come from different governance processes; the tabs at the top of the proposals datalist partition it based on proposal type (see Transcription and placement notes on the exact direction of this "because" relationship as dictated).
- (1.6.0) The default tab on first arrival is "all proposals," which shows all of them.
- (1.6.0) On the "all proposals" tab, since there are different types of proposals for different governance processes, you can tell them apart based on the process key — described loosely, in apposition, as "the kind of slug, friendly name." That's the main indicator on that tab.
- (1.6.0) You can switch between the different tabs for the different governance processes.
- (1.8.0) Deep linking into tabs via URL parameters: wherever a tab system is used in the app — for example, wanting to see specific members for a specific running body (see Transcription and placement notes — may mean "governing body"), or really any tab on any page — you can add a parameter to the URL that specifies what to open by default. It's like deep linking into a tab: it opens with that tab already switched to / open.
- (1.8.0) The transaction dialog's last step waits for the indexer to respond confirming the transaction hash is fully indexed. That lets the app update all the pages so it's not still waiting for data, and lets it know when the user can advance and actually see the page.
- (1.11) Tenderly support was added for all chains that support it. There are two places you can run a simulation: from the proposal-creation flow, and from existing proposal pages.
- (1.11) How the simulation works: it simulates the plugin you're creating the proposal on, calling the DAO directly and passing the action array — so it's testing both the actions and the permission. It does the same thing when run from the proposal page.
- (1.11) Simulations are cached so that users can't spam it and kill the team's Tenderly credits.
- (1.11) Once a proposal has been executed, it can't be simulated again, "because it's just silly."
- (1.11) The token voting plugin now supports timestamp-based clock modes as of 1.11, which supports veLockers because they use timestamps. (Also centrally relevant to the veLockers category — cross-reference only.)
- (1.19) Importing actions via JSON was improved so the actions are decoded on the fly, as you go — the JSON-import counterpart to the 1.4 real-time decoding behavior on the proposal-viewing page.
- (1.34) Very minor UX improvement to the proposal-creation pre-dialog process selector (the UI where you select which process you're creating a proposal in): processes you don't actually have permission to create in should be disabled; processes you are able to create in should be enabled and floated up to the top; you want to see why you can't create some of them via a "view requirements" link, which takes you to the process details page, which explains it. (Raw dictation hedges "should be" rather than "are" — see Transcription and placement notes.)
- (1.33) Across wizards generally, including proposal creation, the app guards against a general wallet-state problem: if something is sent to a wallet and the transaction doesn't go through, or the wallet provider has issues, the app doesn't know the resulting state; if the user tries again, they could accidentally create two proposals. To guard against this, whenever something is sent to the wallet the app remembers that it was sent and gives the user a warning telling them to go check the block explorer and figure things out. (Placement judgment call — see Transcription and placement notes.)

### Commentary and rationale

- (1.2.0) The second transaction in the two-step process is actually a transaction to create a proposal to do the installation, which matters because you need to actually have people in your DAO or whoever (see Transcription and placement notes on this phrase), even if you're an admin and an admin just passes it automatically. The whole point is that it has to go through governance, because you need some plugin that has execute permission to actually go and execute all these things — so you do it through a proposal.
- (1.4) The real-time action-decoding behavior on the Proposals page is mentioned only as an FYI, with the author unsure whether it's something the documentation agent needs to know.
- (1.11) Aside: this information (simulation and/or the timestamp-clock-mode/veLocker relationship) can probably be found in the protocol doc, so there may be no need to go into detail here — the source leaves ambiguous exactly which piece of information this refers to (see Transcription and placement notes).
- (1.33) The wallet-transaction-state warning is framed as a general technical question the team is "really doing our best on," applicable broadly across wizards, not just proposal creation. Hedge from the author: "I think this is us just being nice. I don't really know."

### Open questions and follow-ups

- (1.8.0) Not sure the URL-deep-linking-for-tabs detail actually matters — "it's just a technical thing."

### Transcription and placement notes

- (1.2.0) "You need to actually have people in your DAO or whoever" (on why the second transaction is a proposal) is ambiguous in the raw dictation — it's unclear whether this means the DAO needs to have members/participants at all, or that those people need to vote on or approve the proposal. Preserved without supplying a resolving verb.
- (1.6.0) The connecting sentence "proposals come from different governance processes because the tabs... are partitioning the datalist based on proposal type" reads as grammatically reversed/run-on in the raw dictation. Two readings seem possible: (a) the tabs partitioning by proposal type is the reason proposals are described as coming from different governance processes, or (b) multiple governance processes are the reason the tabs/partitioning exist. Not resolved; preserved as dictated.
- (1.6.0) "Process key" is described only loosely, in apposition, as "the kind of slug, friendly name" — not fully clear whether "process key," "slug," and "friendly name" are meant as the same identifier or as distinct-but-related terms. Kept together as given.
- (1.6.0) The source describes what the tabs split on in two different ways — "partitioning the datalist based on proposal type" and "different tabs for the different governance processes" — without ever explicitly equating "proposal type" and "governance process" as the same partition key. Both terms preserved as given, without assuming they're the same axis.
- (1.8.0) "A specific running body" (in the URL deep-linking passage) may be a mis-transcription of "governing body" (used elsewhere in the same entry for the governance-process/permissions passage), but it wasn't clearly an error, so it's preserved verbatim.
- (1.11) The raw dictation says "V-lockers"; rendered here as "veLockers" per the project's frozen nomenclature — flagging in case a different term was intended.
- (1.11) The phrase "now supports, after in 1.11, timestamp-based clock modes" was garbled in dictation; rendered as "now supports timestamp-based clock modes as of 1.11" without adding or removing information — flagging in case "after" was meant to convey something other than the version number.
- (1.11) In "you can probably find this information in protocol doc," the author never states what "this information" refers to — it could mean the veLocker/timestamp-based-clock-mode relationship specifically, the clock-mode change specifically, or protocol-level details generally. Kept as the author's own ambiguous phrase rather than resolved to one scope.
- (1.34) Raw: "When you show in the proposal creation pre-dialog process selector thing" is grammatically broken (possibly "when you're shown" or "when you open" the selector — unknowable which). Smoothed for grammar while keeping "process selector thing" as the author's own vague noun rather than upgrading it to a specific UI term like "screen."
- (1.34) Raw uses "should be disabled" / "should be enabled" rather than "are disabled" / "are enabled" — ambiguous between describing already-shipped behavior and intended/spec'd behavior. Kept as "should be" rather than resolved either way.
- (1.34) The raw word order for the disabled/enabled clauses was dangling/non-standard ("the ones should be disabled that you don't actually have permission to create," "the ones that should be enabled and floated up to the top that you are able to create stuff"); reordered for readability in the source, which flagged that normalization there.
- (1.34) Raw: "And then you want to see why you can't create some of them" reads as a hypothetical/walkthrough framing rather than an asserted existing capability; kept as "you want to see" rather than "you can now see" (the word "now" does not appear in the raw).
- (1.12, placement note) Governance-process uninstallation's two-transaction prepare/apply-via-proposal flow (process details page → prepare → apply via a proposal to the DAO) is structurally similar to this category's 1.2.0 deploy-then-install-via-proposal pattern, but the category brief assigns the uninstall-specific facts and the bricking-your-DAO risk to category 3 (Governance model). Not duplicated here; flagging the parallel only.
- (1.13, placement note) The 1.13 feature making "execute proposal" calls permissioned (with a UI guard blocking unauthorized callers) touches proposal execution, but is fundamentally a permissions-gating mechanic that the category brief assigns to category 4 (Permissions & granular access control). Not duplicated here.
- (1.33, placement note) The wallet transaction-state safety warning is centrally a category-18 (General UI infrastructure, wallet safety & miscellaneous notes) item per the category brief, but it explicitly names proposal creation and accidental-duplicate-proposal risk as its motivating case, so it is included above as a judgment call rather than dropped from this category's file.

## Action builder & complex/nested actions

### Features and mechanics

- (1.0.0) The action builder and its custom action input components: "a bunch of improvements" were made to the custom action input components and related pieces used in the action builder (general, unspecified improvements — no further detail given in the source).
- (1.0.0) The Wallet Connect feature (previously called Dapp Connect) lives in the action builder: it opens a dialog where you take a Wallet Connect QR code from some other connected application and enter it into the Aragon app, which lets the Aragon app connect to that other app so you can go do stuff in it. Mechanically, the app listens through Wallet Connect (via its API) to grab the actions — stuff that would otherwise be sent as a transaction in the other app instead gets sent / becomes an action inside the Aragon app.
- (1.8.0) In the action builder, when creating a proposal, actions are filtered by default to show only "authorized actions" (i.e., those matching the governance process's authorized target-contract/selector permissions); you can uncheck the filter to show everything, but then the action — or rather, executing the proposal — might revert. (This is centrally category 4/permissions material; included here as a judgment call because the filter itself is an action-builder behavior — see placement note below.)
- (1.8.0) For some clients, campaign-creation logic for the capital distributor (e.g., Katana's incentive distributions, calculated off-chain and turned into a JSON that feeds the Merkle tree) is created through the action builder — noted with the hedge "which, I guess, is something to talk about later, once we actually implement that." (Centrally category 12/capital-distributor material; included here as a judgment call because it explicitly names the action builder as the creation mechanism — see placement note below.)
- (1.15) When adding or removing gauges, there's a basic action view in the action builder, added so the experience is nice for users doing that.
- (1.16) The action builder was updated so actions can be reordered, and individual actions can be removed.
- (1.17) The ability to export an array of actions as JSON was added. You can do this from: the proposal details page; a governance process that's in progress; or the executions tab of the transactions list, by opening an execution and downloading its action array. (See placement note below on the ambiguity of the "governance process that's in progress" location.)
- (1.17) The exported JSON is described as "just an array of actions with a standard format of two-value data in an array form, with all the data encoded" (exact meaning of "two-value data in an array form" preserved verbatim — see placement note below).
- (1.17) That exported JSON can then be imported into the action builder.
- (1.17) Because the JSON can be downloaded from different places (the three locations above), different flows are supported.
- (1.19) The importing of actions via JSON was improved so that the actions are decoded on the fly, as you go.
- (1.23) Basic action views were added for pausing, resuming, and ending campaigns on the capital distributor.
- (1.30) A "plus transaction" feature was added — described as "a very subtle, almost secret-like feature": any time an account is connected to the Aragon app (an EOA, a Safe, or anything else) and holds execute permission, a "plus transaction" button appears on the transactions page. It opens a transaction wizard that goes straight into the action builder, where you select actions, simulate, and create the transaction; you sign it with your wallet and it just executes — bypassing the proposal-creation flow entirely.
- (1.30) Basic action views were created for certain complex/tricky actions. One case: calling execute on the DAO as an action is counterintuitive, because normally proposals call DAO.execute directly — but here the action itself contains a nested action array within an action, which needed its own basic view to decode/display properly.
- (1.30) A similar tricky case was addressed for one proposal telling a DAO to go create a proposal on another plugin (one proposal creating another proposal) — called "again a strange workflow, but there are some weird edge cases where you might want to do it," and one where none of it decoded properly before. Nice basic actions were created for this nested decoding. (See placement note below on an abandoned false start in this passage.)

### Commentary and rationale

- (1.30) The two 1.30 examples above (nested execute-on-DAO actions, one proposal creating another proposal) aren't meant to be read as features in their own right — the author's point is that they're just examples of an underlying, generalized problem: nested actions can become tricky to deal with in general, and most UIs don't support them well. "We do our best to support it, but these are just certain cases."

### Open questions and follow-ups

- (1.0.0) A "hardcore deep dive" into the action builder's functionality is needed at some point.
- (1.8.0) "We'll talk more about the action builder's campaign-creation flow later, once we actually implement it" — a follow-up promise specifically about the action builder's role in capital-distributor campaign creation (cross-reference categories 12 and 13).

### Transcription and placement notes

- (1.0.0) "Wallet Connect" is used in the source for two apparently different things: (1) a dialog shown when connecting your wallet to the app generally, where terms and conditions are presented (that sense belongs to category 18 — cross-reference only, not included here); and (2) the distinct action-builder feature described above (formerly "Dapp Connect") that imports actions from another connected app via its Wallet Connect QR code. Both are preserved exactly as dictated in the source; flagged there in case they need to be disambiguated later.
- (1.8.0) Placement call: the action-builder's default authorized-actions filter (with opt-out) is centrally category 4 (Permissions & granular access control) material. Included as a bullet here too because the filter is literally a behavior of the action builder itself.
- (1.8.0) Placement call: the capital-distributor campaign-creation-via-action-builder detail, and its accompanying "talk about later" open question, are centrally category 12 (Capital distributor) and category 13 (Premium/partially-supported services) material. Included as bullets here too because both explicitly name the action builder as the mechanism/subject.
- (1.17) "You can do this from the proposal details page, or a governance process that's in progress" is ambiguous in the source: "a governance process that's in progress" could name a second, independent JSON-export location distinct from the proposal details page, or could instead describe the proposal details page of a governance process that's in progress. Preserved as dictated rather than resolved.
- (1.17) "A standard format of two-value data in an array form" is preserved verbatim from the source; its exact intended meaning is ambiguous and was not resolved there.
- (1.30) The source contains an abandoned false start — "if one DAO is, for example, or" — immediately before the completed sentence about one proposal telling a DAO to create a proposal on another plugin. The false start gestures at a DAO-to-DAO framing that the completed sentence doesn't carry; preserved as a flag rather than resolved.

## Token voting: importing & wrapping ERC-20s

### Features and mechanics

- (1.0.0) The dictation introduces a general concept of "wrapping and unwrapping tokens," pointing to the token voting repository as the reference for how this works; this pointer appears under the heading "Adding bodies and plugin slots (token voting)," in the same breath as a description of the plugin-slot mechanism for launching a body in the token-voting creation flow (see Transcription and placement notes below on why only the wrap/unwrap pointer is carried here).
- (1.0.0) Users can import an existing ERC-20 token to use as the voting token for token voting.
- (1.0.0) On import, checks run against the ERC-20's capabilities - specifically whether it has ERC-20 votes capabilities per the OpenZeppelin standard, i.e., whether it has "get past votes" and "get past total supply" - which is required for governance to work based on snapshotting.
- (1.0.0) If an imported token doesn't have that capability, token voting automatically deploys a wrapper contract, and the user has to wrap their tokens to be able to vote.
- (1.0.0) Wrapping has to happen before proposals are created, so that the user's voting power is included in the snapshot.
- (1.10, dictated - likely 1.1.0) "We also made it possible to import the tokens, as I said — it does all these dynamic checks": restates the ERC-20-import/capability-check functionality. The phrase "as I said" suggests this may be a callback reference to the 1.0.0 feature rather than new functionality shipped in 1.10, but this isn't certain - flagging rather than guessing which it is.

### Open questions and follow-ups

- (1.0.0) Follow-up instruction: check the existing, live Aragon developer portal, which has a lot of good argumentation on why the ERC-20 votes capability check ("get past votes" / "get past total supply") is critical for governance snapshotting.

### Transcription and placement notes

- (1.0.0) "get past votes" and "get past total supply" are preserved exactly as dictated; these likely refer to OpenZeppelin's getPastVotes / getPastTotalSupply functions (part of the ERC-20 Votes standard), but exact casing/spacing wasn't clear from the audio.
- (1.0.0) The capability-check description was dictated with a self-corrected polarity ("if the ERC-20 has, does not have ERC-20 votes capabilities based on the standard from OpenZeppelin, we check to see if it has get past votes, get past total supply"). This also permits the reading that the get-past-votes / get-past-total-supply checks happen specifically when the token lacks ERC-20 votes capabilities, rather than as a general check run on every import. The source's cleaned text commits to one reading (checks run generally; wrapping is triggered specifically on failure) - carried over here as-is, not re-resolved.
- Placement note: (1.0.0) the token panel's check for whether an imported token has a delegation function (hiding the delegation logic in the token panel if it doesn't), and the associated open question about whether that could break delegate profile pages, sit right next to this category's import/capability-check story but are explicitly assigned to category 8 (token panel, delegation & onboarding nudges) in the category list - not duplicated here, just flagging the adjacency.
- Placement note: (1.7.0) the veLocker's vote-escrow-adapter mechanism, described as letting "veLockers be used as if they were an ERC-20 votes token," and the description of veLocker unlock/withdrawal as "similar to token wrapping, in the sense that you have to approve your tokens and then do a transaction to move them over," both touch this category's ERC-20-votes/wrapping vocabulary but are centrally veLocker mechanics assigned to category 9 (veLockers) - not duplicated here, flagging the explicit analogy the source draws to token wrapping in case it matters for cross-linking later.

## Token panel, delegation, address input & onboarding nudges

### Features and mechanics

- (1.0.0) The token panel is the place where token-related components are shown dynamically; it lives on the member page and — per the open questions below — sometimes also appears in the onboarding flow.
- (1.0.0) Token panel core mechanics: you specify the amount of tokens you want to lock, approve it, then lock inside the locker; once the token allowance goes through you can lock, which gives you voting power, and then you can delegate.
- (1.0.0) When importing tokens, the app also checks whether the token has a delegation function; if it doesn't, the delegation logic is hidden inside the token panel.
- (1.5.0) Added the ability to copy addresses throughout the UI (e.g., in IDs) via a small clipboard icon you can click.
- (1.8.0) The address input UI-kit component does checksum validation by default on all addresses: all-uppercase is fine, all-lowercase is fine, and correctly checksummed (matching) mixed case is fine; but a mix of uppercase/lowercase that doesn't match the checksum fails form validation and is flagged as bad.
- (1.8.0) The address input component also supports ENS and lets you jump to the block explorer; described as "a really complex component" in the UI kit.
- (1.8.0) It's unresolved/self-contradictory in the dictation whether the address input component is actually new in 1.8.0 or something the product already had — it's described both ways (see Transcription and placement notes).
- (1.21) The token panel is also accessible from the gauge voting page, not just via the gauge voting plugin — the plugin is used on the gauge voter as the token, similar to how the token panel appears on the members page.
- (1.23) Onboarding nudge: when a user connects and has tokens or underlying locks but hasn't yet set their delegation (i.e., they're delegated to zero, "0x00000," per how it works in Ethereum on tokens), a dialog pops up showing the same UI as the delegate component of the token panel, but in a dialog, prompting them to go delegate.
- (1.24) Login-time onboarding nudge: on login, checks whether the user has a veLocker or is using a token wrapper and holds the underlying (unlocked/unwrapped) token in their balance; if so, pops up a message — "hey, you have unlocked or unwrapped tokens — do you want to wrap them?" — using the same locking/wrapping components, which then transitions into the delegate flow.
- (1.25) Added onboarding cards to the member list, as a re-entry point for the token delegating/locking onboarding flow.
- (1.25) Updated the member list's sort order: normally sorted by voting power, decreasing (hardcoded — datalists don't currently support custom sorting); the connected user and their delegate are now pinned first at the top, so the user sees their own voting power with their delegate right next to them.

### Commentary and rationale

- (1.0.0) Hiding the token panel's delegation logic when a token lacks a delegation function is considered "part of our genius."
- (1.5.0) The copy-address feature is called out as "not that interesting."
- (1.25) "Maybe sorting, that's a whole other interesting topic" — none of the datalists (including the member list) currently support custom sorting; it's hardcoded to voting power decreasing.

### Open questions and follow-ups

- (1.0.0) The token panel's appearance in the onboarding flow is flagged as something the documentation agent doesn't know about yet — "which I don't think you know anything about, which we can talk about later."
- (1.0.0) "Maybe we need to check on our delegate profile pages, though" — open question on whether hiding the token panel's delegation logic (for imported tokens without a delegation function) could break delegate profile pages; "I haven't really tested that, to be fair."

### Transcription and placement notes

- (1.8.0) The address input component is described in the source both as "a new component we added in 1.8" and, in the same breath, as something "we already had... it's not new" — a direct self-contradiction, preserved as-is; unclear whether the component itself is new in 1.8.0.
- (1.8.0) The address input "does checksum by default on all addresses" is ambiguous — unclear whether this means the component checksums/normalizes the address, or validates that an address is already correctly checksummed. Preserved verbatim rather than resolved.
- (1.21) The passage on token-panel access from the gauge voting page ("not just the gauge voting plugin... the plugin's used on the gauge voter as the token") is garbled/ambiguous in the dictation — the exact relationship between "gauge voting page," "gauge voting plugin," and "gauge voter" is unclear; preserved close to verbatim.
- (1.23) The delegated-to-zero dialog's description was self-corrected mid-dictation: first called "the same onboarding flow we already have, nothing new," then corrected to clarify it's actually the same UI as the token panel's delegate component, just shown in a dialog instead. The bullet above reflects the corrected version.
- (1.24) The sentence describing the login-time nudge's shared components was self-interrupted in the raw ("it just like goes to the," abandoned, restarted as "in the dialogue are the same components for locking and wrapping them"); smoothed to one sentence above, flagged here per the no-silent-correction rule.
- Placement call — (1.7.0): veLockers are described as visible in the token panel on the members page: the token voting plugin checks whether "the token" used for voting is a vote escrow adapter, and when detected, shows the veLocker token panel component in the UI, on the members page, to the right ("Raw says veLockers 'are visible in the token panel... It checks to see if the token... It checks to see if it's a vote escrow adapter' — the antecedent of 'It' is ambiguous, left unresolved consistent with the raw"). Noted here only for the token-panel-appearance angle; the full veLocker mechanics are centrally category 9's scope.
- Placement call — (1.20.22, dictated - likely 1.22): in the veLocker ("VLocker" as dictated) UI component in the token panel, a check was added so that if the slope of the rewards curve is flat, the curve isn't shown — described as a small adjustment. Noted here only because it's a token-panel-component tweak; the full veLocker substance is centrally category 9's scope.
- Placement call — (1.26): a small delegations card was added to member profiles, showing delegations received, total voting power, and token balance. This is centrally category 14's (member identity) scope; noted here only given the thematic overlap with "delegation" in this category's name.
- Placement call — (1.28.0): "And for each token — if your DAO has multiple tokens — that's where you do your delegation, and therefore your delegate statement" states that delegation happens per token, but this is raised purely as context for the delegate-statement/ENS-profile feature, which is centrally category 14's scope — not reproduced here as a full bullet.
- Placement call — (1.0.0): the general "wrapping and unwrapping tokens" concept (mentioned in the "Adding bodies and plugin slots" passage) and the automatic-wrapper-deployment mechanic for imported ERC-20s lacking votes capability are assigned to category 7 (token voting: importing & wrapping ERC-20s), since they concern the contract-level import/wrap decision rather than the token panel's own UI mechanics; not reproduced here.

## veLockers (vote escrow lockers)

### Features and mechanics

- (1.7.0) UI support added for veLockers (vote escrow lockers). veLockers are inspired by Curve Finance; more information is available in the ve governance repo (which also has gauges — implemented later, discussed then).
- (1.7.0) veLockers are visible in the token panel. Mechanism: the token voting plugin treats some token as "the token" used for voting, and checks whether that token is actually a vote escrow adapter — an adapter contract created to let veLockers be used as if they were an ERC-20 votes token. When the vote escrow adapter is detected, the veLocker token panel component is shown in the UI, on the members page, to the right.
- (1.7.0) This lets you lock your underlying token — some token that doesn't itself have to be an ERC-20 votes token — into the veLocker. You choose how much to lock, and it gives you a reward over time based on how long you hold it there, i.e. a time-based bonus; framed as incentivizing people to vote for longer.
- (1.7.0) The UI shows this in real time: it refreshes and shows your actual voting power across multiple, independent locks — you can see the voting power on each lock individually.
- (1.7.0) When you unlock, there's a withdrawal period, and only after that withdrawal period can you actually claim your tokens back. This is similar to token wrapping, in the sense that you have to approve your tokens and then do a transaction to move them over.
- (1.7.0) veLockers are not something users get to use out of the box — Aragon has to deploy it for them (and generally charges them for it).
- (1.7.0) veLockers are fully compatible with token voting. They are not compatible with the lock-to-vote plugin, because once tokens are moved into the escrow you don't actually hold your tokens anymore.
- (1.11) The token voting plugin now supports timestamp-based clock modes as of 1.11, which supports veLockers because they use timestamps.
- (1.14) The vote escrow locker (veLocker) was extended to support dynamic withdrawal fees: if you withdraw early, you have to pay a fee, and that fee gets sent to the DAO. Currently this must be configured by the client themselves — Aragon doesn't configure it for them.
- (1.20.22, dictated - likely 1.22) In the veLocker (dictated "VLocker") UI component in the token panel, a check was added: if the slope of the rewards curve is flat, the curve is not shown. Described as a small adjustment.

### Commentary and rationale

- (1.7.0) The whole veLocker feature is called "a bit weird/unusual," which the author uses to introduce a broader, cross-cutting concept: a class of supported / partially supported / unsupported plugins across the product. Partially supported means Aragon supports the user-facing experience inside the UI but has no deployment experience for a DAO admin/creator to self-serve it; when working directly with a client, Aragon deploys the setup itself and the application understands and displays it appropriately. veLockers are given as the example of this pattern. (The pattern itself, and its naming/knowledge-base-placement question, is centrally category 13's content — included here because it was raised using veLockers as the illustrating case.)
- (1.8.0, cross-reference from the capital distributor entry) "The capital distributor plugin's deployment model (supported if we deploy it for a client, but not available for free for anyone to deploy) mirrors the vote escrow locker's — both fall into that same category," reaffirming veLocker's deploy-for-clients-only model from a later release's discussion.
- (1.15, cross-reference from the gauge-voting entry) Gauges are described as generally used together with escrow governance, with vLockers — "the contracts live in the same repo, though that's probably not relevant here" — reinforcing the ve-governance repo pointer as shared between gauges and veLockers.

### Open questions and follow-ups

- (1.7.0) Further research could be done on the general point/purpose of vote escrow as a mechanism.
- (1.7.0) Gauges (also from the ve governance repo) are noted as being implemented later, to be discussed then — a forward pointer from the veLocker discussion toward the gauge-voting category.
- (1.7.0) The lock-to-vote plugin is noted as being described later; raised here only because veLockers are not compatible with it.
- (1.7.0) Tied to the supported/partially-supported/unsupported-plugin commentary above: the author flags not being sure what to call this whole pattern (maybe "premium features" or something else) or where it should live in the knowledge base, with reach-out-to-the-Aragon-team as the client call to action. This open question is centrally category 13's, noted here only because it surfaced during the veLocker discussion.

### Transcription and placement notes

- (1.7.0) The chunk opens with "vLockers, vote escrow lockers," but every later mention uses "veLockers." Treated as the same term throughout and standardized to "veLockers," consistent with the frozen nomenclature — flagging in case "vLockers" was meant as distinct wording rather than a transcription slip.
- (1.7.0) The adapter that lets veLockers act as an ERC-20 votes token is introduced clearly as a "vote escrow adapter," but a later sentence garbles this as "the ERC-20 votes adapter for the vote escrow adapter." Represented using "vote escrow adapter" as the operative term — flagging in case these are meant to describe two distinct things rather than one and the same adapter.
- (1.7.0) Raw says veLockers "are visible in the token panel... It checks to see if the token... It checks to see if it's a vote escrow adapter." The antecedent of "It" is ambiguous — could be the token panel itself, or the app/system more generally. Left as "It," unresolved, consistent with the raw.
- (1.11) Raw dictation says "V-lockers"; rendered as "veLockers" per the project's frozen nomenclature list. Flagging in case a different term was intended.
- (1.11) "now supports, after in 1.11, timestamp-based clock modes" was garbled in the dictation; rendered as "now supports timestamp-based clock modes as of 1.11" without adding or removing information. Flagging in case "after" was meant to convey something other than the version number.
- (1.11) "You can probably find this information in protocol doc" — the author never states what "this information" refers to. Could mean the veLocker/timestamp-based-clock-mode relationship specifically, the clock-mode change specifically, or protocol-level details generally — left as the author's own ambiguous phrase, unresolved.
- (1.14) The withdrawal-fee configuration point was garbled/self-contradictory in the raw: "Again, this is all just, currently, of course, they have to, you have to configure this yourself, we don't configure it for them." The false start "they have to, you have to" was smoothed to "you have to" in the features bullet above. There's an unresolved shift in who is being addressed — "you have to configure this yourself" reads as addressing the reader directly, while "we don't configure it for them" refers to a third party ("them") — unclear whether these are the same party or two different parties. The discourse markers "Again" (implying this point was already made earlier) and "of course" (treating it as obvious) were dropped from the bullet and are recorded here.
- (1.20.22, dictated - likely 1.22) Orchestrator note: dictated as "app 1.20.22"; positioned between 1.21 and 1.23 in the dump, so possibly means 1.22. Preserved as dictated.
- (1.20.22, dictated - likely 1.22) Dictated as "VLocker" in this chunk; elsewhere the established term is "veLocker" — may be the same component transcribed differently, preserved as dictated rather than silently corrected.
- Placement call, (1.15): "vLockers" is preserved as transcribed in the gauge-voting entry (on gauges being used together with escrow governance); this may correspond to "veLocker(s)" used elsewhere, unconfirmed for this chunk. Noted here as a nomenclature cross-reference; the surrounding content (gauges' relationship to escrow governance via the shared repo) is centrally category 10's scope, not duplicated in full here.
- Placement call, (1.23): the delegated-to-zero onboarding-dialog description (member connects and "has tokens or underlying locks" but hasn't set delegation) uses the phrase "underlying locks," which plausibly refers to veLocker users specifically. The bullet's substance — the delegated-to-zero onboarding dialog itself — is centrally category 8's scope; flagged here rather than duplicated in full.
- Placement call, (1.24): the login-time onboarding nudge explicitly branches on "If a user has a veLocker, or is using a token wrapper" when checking for unlocked/unwrapped underlying token balances, transitioning into the delegate flow. This is a veLocker-relevant mechanic, but the bullet's substance — the login-time wrap/lock nudge — is centrally category 8's scope; flagged here rather than duplicated in full. (The raw also dictates "vLocker" here, normalized to "veLocker" per frozen nomenclature.)

## Gauge voting

### Features and mechanics

- (1.7.0) While introducing veLockers, the author points to the "ve governance repo" for more information and notes it "also has gauges — we implement those later and can talk about them then" — an early forward-reference to gauge voting, not yet implemented at this point.
- (1.15) Gauge voting was added as a new plugin: the gauge voter plugin.
- (1.15) The gauge voter plugin "also falls into the premium Aragon services category — we deploy it for people."
- (1.15) Gauges are "a whole voting mechanism that amounts to non-proposal-based governance." By default, gauges are just signaling — when you vote on a gauge, the outcome isn't binding on chain.
- (1.15) You can have one or more gauges. Whoever holds the relevant permission — "it isn't actually called 'gauge admin,' but that's the function it serves" — can add gauges, remove gauges, activate them, and deactivate them. This is noted as well documented in the "V-governance repo" (see naming note below).
- (1.15) Creating a gauge: a gauge "is just something you can vote on." Gauges can have metadata, and a gauge has an address.
- (1.15) Voting mechanic: voters have a certain number of tokens and vote on a gauge; you can vote on any number of gauges and distribute your tokens proportionally across them in your vote.
- (1.15) Gauges also have epochs; "each epoch, your votes can roll across each epoch, or not" (see transcription note below on the uncertainty in this phrasing).
- (1.15) Gauges are generally used together with escrow governance, with vLockers — "the contracts live in the same repo," though the author adds "that's probably not relevant here."
- (1.15) When you add or remove gauges, there is a basic action view in the action builder, "so the experience is nice for them."
- (1.15) Distributing rewards based on gauge vote outcomes is supported, using the OSX capital distributor — again gated behind a client reaching out ("again, a client would have to reach out to us for this").
- (1.16) The gauge voting dialog was updated so you just specify weights and the UI calculates the percentages programmatically, matching how it works in the contract — "you don't have to do any math, you just set weights on them and it calculates the percentage."
- (1.21) The token panel is also accessible from the gauge voting page, not just [via] the gauge voting plugin — "the plugin is used on the gauge voter as the token, kind of like the token panel on the members page" (garbled in the original; see transcription note below).
- (1.25) Judgment-call item, primarily category-15 (App CMS) territory: the app-CMS nav-bar override/hide feature is illustrated specifically with gauges — "imagine we installed gauges on a DAO but don't want people to see them - we can just hide the gauges." Included here because it names gauges and the navbar directly (see placement note below).
- (1.27) Gauges have their own dedicated page — "one page for the whole gauge plugin, since there are no proposals or anything" — linked up in the navbar. The author adds "I think I already said it" (believes this was mentioned before).

### Commentary and rationale

- (1.15) Gauges themselves aren't binding, "but they're still another kind of governance — governance in the sense that people are voting."
- (1.15) Terminology correction addressed to the documentation agent: a prior doc comment apparently claimed that because something is a governance plugin, it's therefore IProposal. The author disagrees: "it assumes all governance is IProposal, which is generally true but not strictly true." You could hypothetically have other plugins that are governance — "governing things" — without having proposals per se, and "we're making that distinction because it's important."

### Open questions and follow-ups

- (1.7.0) Restated explicitly as an open follow-up: gauges (from the ve governance repo) — "we implement these later and will talk about them then."
- (1.15) "You should probably look up more about gauges in the future, but more or less how they work" — with an open invitation to raise follow-up questions later ("any questions you have, you can follow up, of course").

### Transcription and placement notes

- (1.7.0 / 1.15) The repo pointer for gauges is dictated differently across releases — "ve governance repo" in 1.7.0 versus "V-governance repo" in 1.15. Both plausibly refer to the same repo (1.7.0 states this repo "also has gauges"), but this wasn't independently confirmed; preserved as dictated in each place.
- (1.15) "V-governance repo" is preserved as transcribed; given the vote-escrow/gauge context, this may actually be a "ve-governance" (or "veGovernance") repo, but the exact name wasn't confirmed.
- (1.15) "vLockers" is preserved as transcribed in this chunk; this may correspond to "veLocker(s)" used elsewhere in the source, but this wasn't confirmed for this chunk.
- (1.15) The dictation said "IP proposal"; rendered as "IProposal" as the cleaner's best guess, not independently confirmed. This should not be read as settling the author's own disagreement (see Commentary above) about whether all governance plugins are IProposal.
- (1.15) "each epoch, like, your votes can roll across each epoch or not" is stated with some uncertainty/informality in the dictation; the exact epoch-rollover mechanic is preserved as-is rather than resolved.
- (1.15) "You should probably look up more about gauges in the future, but more or less how they work" — the clause "but more or less how they work" is a garbled/ambiguous fragment, plausibly the start of an aborted clause (e.g., a promise to explain the mechanics) rather than cleanly modifying "look up." Preserved as transcribed rather than resolved.
- (1.16) In the raw dictation about the gauge voting dialog, the author started a clause with "you don't have to make sure that..." before self-interrupting and continuing with "you don't have to do math or anything." The abandoned clause's intended meaning is unclear and isn't reflected above beyond the completed thought.
- (1.21) The passage about accessing the token panel from the gauge voting page is garbled/ambiguous in the original dictation — the exact relationship between "gauge voting page," "gauge voting plugin," and "gauge voter" is unclear; preserved close to verbatim.
- Placement call (1.25): the gauge-hiding example under the app-CMS nav-bar override feature is centrally category 15 (App CMS content configuration) territory — that category's own scope names this exact example ("hiding/overriding nav bar items, e.g. hiding gauges (1.25)"). Included here as well only because it directly names gauges and the navbar, adjacent to this category's 1.27 dedicated-gauge-page-in-the-navbar fact.
- Placement call (1.15): the "premium Aragon services category" line and the capital-distributor rewards-distribution line are centrally category 13 (Premium / partially-supported services model) territory. Included here in full because they describe the gauge voter plugin's own deployment/monetization model end-to-end, per the source's own placement of these sentences inside the 1.15 gauge-voting write-up rather than split into a separate commentary aside (contrast with 1.7.0's veLocker entry, where the same pattern is discussed as a separate digression).

## Lock-to-vote plugin

### Features and mechanics

- (1.10) The lock-to-vote plugin was released. The 1.10 "Features and changes" entry lists this alongside the bare statement "we released 1.10" itself; no mechanics of the plugin are described in this chunk (see Open questions and follow-ups below for why).
- (1.7.0, cross-reference — substance belongs to category 9, veLockers) veLockers are described as "fully compatible with token voting" but explicitly not compatible with the lock-to-vote plugin. The source hedges on this point ("I mean, I guess, yeah, it's not, because, yeah...") before giving the reason: once tokens are moved into the vote escrow, you don't actually hold your tokens anymore, unlike lock-to-vote. Included here only as a brief cross-reference per this category's scope; the full veLocker mechanism lives in category 9.

### Open questions and follow-ups

- (1.10) The author noted there's a lot of information about the lock-to-vote plugin already available online, and suggested just researching it there rather than dictating a full description — then trailed off mid-thought: "But essentially, the idea is that, yeah, I'm just gonna copy-paste stuff from the announcement" (see Transcription and placement notes).
- (1.10) Promise: "I will share all the marketing brain dumps later" — referring to marketing/announcement content on the lock-to-vote plugin.
- (1.10) Follow-up need: create a guide about setting up guardian DAOs, described as the main use case for lock-to-vote.
- (1.7.0, cross-reference — substance belongs to category 9, veLockers) A follow-up note in the veLocker chunk states the lock-to-vote plugin "will be described later," flagged there only because veLockers are not compatible with it.

### Transcription and placement notes

- (1.10) Orchestrator note carried over from the source: an earlier entry in the same dump was also dictated as "1.10" — that one covers the governance-designer basic flow for standalone plugins that are both a process and a body (category 3 territory), sits between the 1.0.0 and 1.2.0 chunks, and is likely actually 1.1.0. The source explicitly confirms the entry summarized in this file (the lock-to-vote release) is "the actual 1.10 release."
- (1.10) The dictation breaks off mid-thought at "But essentially, the idea is that, yeah, I'm just gonna copy-paste stuff from the announcement." The source flags this as unresolved: it's unclear whether "the idea is that..." was starting to describe the lock-to-vote plugin's actual mechanics (never completed in this chunk) or was only referring to the plan to copy-paste announcement/marketing material later. Preserved as a genuine ambiguity, not smoothed over.
- Placement note (mine, 1.7.0): per this category's own scope definition, veLocker's incompatibility with lock-to-vote belongs primarily in category 9 (veLockers). It is included above only as two brief cross-reference bullets (one under Features and mechanics, one under Open questions and follow-ups); the full veLocker mechanism, the "fully compatible with token voting" framing, and the broader vote-escrow context should be sought in category 9, not here.

## Capital distributor & Merkle-based reward distribution

### Features and mechanics

- (1.8.0) New plugin: the OSX capital distributor plugin (information available on GitHub). It falls into the same category as the vote escrow locker — supported if Aragon deploys it for a client, but not available for free for anyone to deploy.
- (1.8.0) Purpose: the capital distributor does transfers out of the DAO, letting people go to it and make a claim. When someone claims an asset, it checks whether they're eligible, and if so, transfers a token out of the DAO to them.
- (1.8.0) Eligibility is currently checked through Merkle proofs: a backend service generates "the proof, the tree, and the root (or whatever the exact terms are)," and these are often pre-populated.
- (1.8.0) Claim flow: the user comes in, requests their proof, and signs a transaction with the proof asserting they're eligible; if eligible, they can claim their token.
- (1.8.0) Claim UI/wizard: shows all of the rewards the user is eligible for; clicking takes them through a short wizard dialog to make the claim, and they can claim to their own address or to another address ("and that's mostly it").
- (1.8.0) Named client usage: used by projects like Boundless, Katana, and CryptEx — "used nicely," but for specific clients; used for either one-off distributions (like an airdrop) or ongoing rewards.
- (1.8.0) For some clients, Aragon implements specific campaign/distribution logic based on different criteria and rules — e.g., Katana (like other existing clients) does incentive distributions with different calculations. Those calculations are done off-chain, and instead of the proof, a JSON is generated, which is used to create the Merkle tree. The campaign itself is created through the action builder.
- (1.9) Added the actual endpoint for generating Merkle trees and proofs; the API is available for external clients to build into their own claiming UI if they don't want to use Aragon's UI for claiming (which makes sense) — e.g., for an airdrop claimed on the client's own website. They can hook directly into the plugin.
- (1.9) The claiming experience in Aragon's own UI is gated by an OFAC list. It can also be geofenced for specific countries.
- (1.15) The capital distributor can also be used to distribute rewards based on gauge vote outcomes — again, a client would have to reach out to Aragon for this.
- (1.23) Added basic action views for pausing, resuming, and ending campaigns on the capital distributor.

### Commentary and rationale

- (1.8.0) Comparison to Merkle (the project): people familiar with Merkle will know they offer a similar distribution service, but focus on it more as a standalone, vertically integrated service; Aragon is focusing on this as just one feature that sits alongside a DAO's governance.
- (1.8.0) The capital distributor's deployment model (supported if Aragon deploys it for a client, not available for free for anyone to deploy) mirrors the vote escrow locker's — both fall into that same category. (The general supported/partially-supported/unsupported plugin pattern this instantiates is its own cross-cutting concept — see category 13 — this note captures only the capital-distributor-specific restatement of it.)
- (1.9) The OFAC-list gating and geofencing are described as important "if somebody's from a country that's 'bad'" — it's unresolved whether "this" refers to the geofencing alone or to the OFAC gating and geofencing together (see Transcription notes).

### Open questions and follow-ups

- (1.8.0) Client-specific campaign/distribution logic (e.g., for Katana and other clients) doesn't need to go into the knowledge base because it's client-specific — but it's something people need to know Aragon offers.
- (1.8.0) The action builder's campaign-creation flow will be discussed more later, once it's actually implemented.

### Transcription and placement notes

- (1.9) "a country that's bad" is preserved verbatim as the author's own informal shorthand in the OFAC/geofencing context; the specific criteria for which countries qualify were not stated.
- (1.9) Ambiguous referent: in the raw dictation, "this is important if somebody's from a country that's bad" immediately follows the geofencing sentence. It's unclear whether "this" refers to the geofencing alone or to both the OFAC gating and the geofencing described in the two preceding sentences. Preserved without resolving which feature(s) it attaches to.
- Placement note: the cross-cutting "supported / partially-supported / unsupported plugin" business-model concept itself — introduced while discussing veLockers (1.7.0), restated for the capital distributor (1.8.0), and again for gauges (1.15) — is scoped to category 13. Only the capital-distributor-specific instances (the 1.8.0 deployment-model sentence and the 1.15 gauge-rewards cross-reference) are captured here.
- Placement note: (1.15) the gauge-vote-outcome reward distribution via the capital distributor is also centrally relevant to category 10 (gauge voting); included here in full since it's a direct capital-distributor mechanic, per the overlap-is-fine rule.
- Placement note: (1.8.0) the frontend plugin-interface abstraction described in the same 1.8.0 chunk as the capital distributor (letting the frontend treat modified/custom plugin versions the same as known ones) is explicitly assigned to category 13 in the master category list, so it is not duplicated here.

## Premium / partially-supported services model

### Features and mechanics

- (1.7.0) While discussing veLockers, the author digresses to introduce a cross-cutting concept: "there's a whole class of things across the product that are supported plugins, partially supported plugins, and unsupported plugins." For "partially supported" plugins, the product supports the experience for the user inside the UI, but there is no deployment experience for a DAO admin or a DAO creator to self-serve it. But when Aragon is working directly with a client, Aragon can deploy the setup itself, "and our application will understand it and show it in the appropriate place." veLockers are given as "an example of this pattern."
- (1.7.0) Stated specifically of veLockers: "this is a pretty nice feature, but again, users don't get to use this out of the box — we have to deploy it for them (and we generally charge them for it, by the way)."
- (1.8.0) The OSX capital distributor plugin restates the same pattern: it "falls into the same category as the vote escrow locker — supported if we deploy it for a client, but not available for free for anyone to deploy."
- (1.8.0) Frontend plugin-interface abstraction: "maybe worth noting" — the frontend was made "a bit more modular," so that it doesn't look at the specific plugin repo/contract a plugin comes from but looks at its interface instead. That interface lets the app support "slightly modified, alternate versions of plugins for testing or for custom client solutions, while the rest of the app just assumes it's the thing it knows," rather than the team having to treat it totally differently. "Some logic just lives inside the functions, and we don't actually need to know about it or build a bespoke experience in the application for it." (This is what lets client-specific or test plugin variants work without bespoke frontend logic — it's the mechanism underpinning how the partially-supported/premium plugins above can be deployed for a specific client and still be understood by the app.)
- (1.15) Gauge voting (the gauge voter plugin) restates the pattern a third time: "This also falls into the premium Aragon services category — we deploy it for people." This is also the chunk that names the category "premium Aragon services" explicitly, closest to the "premium features" naming floated as an open question in 1.7.0.
- (1.15) The ability to distribute rewards based on gauge vote outcomes, using the OSX capital distributor, is flagged with the same client-facing caveat: "again, a client would have to reach out to us for this."

### Commentary and rationale

- (1.7.0) The author frames the whole digression as prompted by veLockers themselves being unusual: "this whole feature is a bit weird/unusual, which points to an interesting broader concept. This is a bit of a digression from 1.7.0 specifically, but it's an important concept worth capturing."
- (1.8.0) The capital distributor's deployment model is explicitly said to mirror the vote escrow locker's: "both fall into that same category."

### Open questions and follow-ups

- (1.7.0) "We may need a whole structure somewhere in the knowledge base to handle this class of feature (supported / partially supported / unsupported plugins, including the ones we deploy directly for clients)." The author is not sure what to call it yet — "maybe 'premium features' or something else" — but describes it as features Aragon sets up for clients that then exist in the app. The call to action for clients is to reach out to the Aragon team, and when they do, Aragon can set it up for them. (Note: 1.15's "premium Aragon services category" phrasing, above, may be the closest the dictation gets to answering this naming question, but the author never explicitly ties the two together, so this is left as still-open rather than resolved.)

### Transcription and placement notes

- (1.8.0) Judgment call: the comparison to Merkle-the-project's "more vertically integrated" distribution service ("we're focusing on this as just one feature that sits alongside your governance") is capital-distributor-specific positioning rather than a restatement of the supported/partially-supported/unsupported pattern itself. Left in substance to category 12 (Capital distributor); not duplicated here.
- (1.24) Judgment call: the Explore-page onboarding-dashboard CTA — "hey, reach out to the Aragon team so we can help you out" — uses similar reach-out-to-the-Aragon-team language but is a general onboarding/Explore-page CTA (linking to the contact form, alongside a "set up your governance" CTA), not a restatement of the supported/partially-supported/unsupported premium-plugin pattern. Left to category 1 (Explore page & DAO discovery).
- (1.19) Judgment call: "if anybody sees a bunch of spam, they can reach out to us, and we'll try to improve this filter" is a reach-out CTA but is about spam-token-filter feedback, unrelated to the premium-services deployment pattern. Left to category 17.
- General placement note: the plugin-specific deploy-for-clients/self-serve mechanics of veLockers (1.7.0, category 9), the capital distributor (1.8.0/1.9/1.23, category 12), and gauges (1.15, category 10) live in their own categories in full; only the cross-cutting general statements of the supported/partially-supported/unsupported pattern and its restatements are captured here, per the assignment scope.

## Member identity: Aragon Names, ENS profiles & delegate statements

### Features and mechanics

- (1.0.0) Member profile pages shipped as part of the initial release feature set, described only as having "a bunch of stuff on them"; the author flagged not being sure whether member profiles, Aragon names, or Aragon profiles had been discussed before, noting "we can maybe talk about this later."
- (1.0.0) Member profiles include a component that calls the Ethereum Follow Protocol API to show social-graph info on the member profile — a small card with that info off to the side, explicitly called out as "not a very important feature."
- (1.25) Member profile pages show extra ENS data: bio (which comes from the standard ENS fields), avatar, and social-resource links ("those are standard"). ENS data is fetched in the front end in real time, so ENS is treated as the source of truth.
- (1.26) Member profiles gained a small delegations card showing the amount of delegations a delegate has received, plus their total voting power and token balance.
- (1.27) Featured delegates: addresses specified in the featured-delegates area of the app CMS are shown first on the DAO dashboard, and also as the first tab in the members list (the first tab people see when they arrive there).
- (1.27) Featured delegates don't actually have to have voting power or anything like that — the project simply tells Aragon "these are some featured delegates." This is tied to a plugin, "like a voting plugin" (see Transcription notes for an ambiguity about what exactly "this" refers to).
- (1.28.0) Aragon Names released — described as "a pretty big release." Aragon Names are given away for free: Aragon owns the Aragon.eth account, so a user can claim a name like Vitalik.aragon.eth (e.g., "if Vitalik wanted to, he'd go claim Vitalik.aragon.eth"); the app checks whether the name is available and then claims it in the background via a registry contract.
- (1.28.0) After claiming, the app helps the user set the new name as their primary name, so it's what shows up anywhere in Web3 — meaning the user doesn't have to go buy their own separate ENS name.
- (1.28.0) This works whether the user already has their own ENS or an Aragon Name, "because an Aragon Name is ENS." Either way, the user can create an Aragon profile.
- (1.28.0) The Aragon profile can be populated with everything shown on the profile page: bio, links, and avatar. User avatars are shown throughout the product ("kind of all over the place"); when there isn't one, the product falls back to a "blocky default."
- (1.28.0) A standard extension for delegate statements was created: since delegation happens per token, a user creates one statement per token. The statement has a specific JSON (or similar) structure. Users fill it in with rich text, which gets pinned to IPFS; that updates the user's ENS record, which then has a link to the IPFS content.
- (1.28.0) The app fetches that delegate-statement content and shows it in the UI as the delegate statement for each token, next to the rest of the delegate information on the member's profile.
- (1.28.0) Setup ordering: a user sets up their profile after the app realizes they have an ENS — which might come right after claiming an Aragon name, if they didn't already have one. For each token a user's DAO has, that's where delegation — and therefore the delegate statement — is done.
- (1.28.0) Aragon stores no information about the user anywhere off-chain; everything is on the blockchain. The app provides a flow that helps the user connect to the ENS contracts "nice and easily," but this is only a helper — it doesn't itself store anything.
- (1.28.0) There is a delete flow: a user can choose to delete their Aragon name, which deletes their profile; someone else can then claim that name afterward. The dictation frames the point of this as letting the user have their information "released" / effectively deleted from ENS (phrasing garbled — see Transcription notes).
- (1.28.0) Aragon Name claiming and ENS resolution happen exclusively on Ethereum mainnet: Aragon uses the canonical mainnet deployment for every chain — regardless of which chain a user's DAO is on, the app always looks to and resolves ENS on mainnet.
- (1.33) Aragon Names can be changed: a user can change what their Aragon name is, and all of their existing ENS records move over to the new name.

### Commentary and rationale

- (1.0.0) The Ethereum Follow Protocol card on member profiles is explicitly called out (restated in commentary) as not a very important feature.
- (1.28.0) Instruction to the documentation agent: "make sure when you're logging all of this stuff, you're explaining it first and foremost from the user perspective, not just from, you know, how it works, because that would be weird."
- (1.33) The name-change behavior (existing ENS records moving over to the new name) is described by the author as "pretty cool."

### Open questions and follow-ups

- (1.0.0) Not sure if member profile pages, Aragon names, or Aragon profiles have been discussed with the documentation agent before — flagged to be covered later.
- (1.25) The author still needs to give the documentation agent the standard ENS fields used for bio, avatar, and social links: "I need to give you this information at some point, or you can find it online."
- (1.25) Hedge on how ENS standardizes these profile fields: "I forget what they call it; I think they actually did EIPs, to be honest" — referring to whatever mechanism ENS uses to standardize the fields being used.
- (1.28.0) The delegate-statement JSON's specific structure still needs to be shared with the documentation agent: "which I can also share with you. Maybe take a note that you need this information."

### Transcription and placement notes

- (1.28.0) Unclear whether "we" (Aragon) or "they" (the user) is the one claiming the name via the registry contract, or whether both happen in sequence — both statements ("we claim it" / "they claim it") are preserved as dictated.
- (1.28.0) The profile-setup ordering was self-corrected multiple times in the original dictation ("you set up your profile after making it your... after you say, hey, this is... after we realize that you have an ENS"); resolved in the cleaned source to: profile setup happens after the app realizes the user has an ENS.
- (1.28.0) The deletion-flow sentence — "And if you want any of this information to be released and like made, you know, essentially deleting all of your data from ENS" — contains an incomplete clause ("and like made...") and it's ambiguous whether "released" means published or relinquished; surrounding text describes a deletion flow.
- (1.28.0) The mainnet-only sentence was dictated with an abandoned fragment: "Also, maybe it's important to point out that the, you need to, all of this claiming and stuff for Aragon names happens on Ethereum mainnet" — the fragment "that the, you need to," was dropped as an abandoned false start.
- (1.26) Orchestrator note on this entry's own version tag: dictated as "In app 1.23, sorry, in 1.26" — the author self-corrects to 1.26 and notes 1.23 was already covered elsewhere.
- (1.27) Unclear whether "this is tied to a plugin, like a voting plugin" refers to the featured-delegates feature as a whole or specifically to the members-list tab; preserved as stated without resolving.
- Placement call: the 1.0.0 token panel's hiding of delegation logic when an imported token lacks a delegation function, and its open question about whether that "could break delegate profile pages," touches member/delegate profile pages but is treated as centrally belonging to category 8 (token panel), per the category definitions — flagged here rather than duplicated in substance.
- Placement call: the DAO's own ENS subname (dao.eth, 1.3.0/1.4) and DAO-level metadata/name display with address fallback (the 1.20.22-labeled chunk, likely 1.22) are DAO-level identity/presentation facts, not member-facing identity, and are treated as belonging to category 2 — not included here in substance despite the topical adjacency (ENS, metadata).

## App CMS content configuration

### Features and mechanics

- (1.0.0) The Explore page's "featured DAOs" carousel — a carousel of DAOs that the team manually chooses to feature — is controlled by the app CMS repo.
- (1.21) A manual override to filter out specific spam tokens (used when somebody reports one) was added; this override lives in the app CMS. Cross-reference: the general, imperfect spam-token detection heuristics themselves are category 17 territory (1.19).
- (1.24) Via the app CMS, added the ability to hide plugins from the datalist pages.
- (1.25) In the app CMS, created the ability to override or hide certain things in the nav bar — for example, if gauges are installed on a DAO but people shouldn't see them, they can just be hidden.
- (1.27) Added a feature that also looks at the app CMS, which supports featured delegates: if you specify addresses in the featured-delegates area of the app CMS, those featured delegates show first on the DAO dashboard, and featured delegates also show as the first tab in the members list — the first tab people see when they go there. This is tied to a plugin, like a voting plugin. Featured delegates don't actually have to have voting power or anything like that — the project will just tell Aragon, "these are some featured delegates."

### Commentary and rationale

- (1.24) Rationale for the plugin-hiding-from-datalists override: it ties back to being able to reuse bodies (there can be other reasons too, but this is one of them). You might have one group of stakeholders — "the same sort of census, if you will." There's no formal concept of a census, but that's part of what a plugin is: a census coupled to the governance plugin. You can have two plugins that both represent governing bodies but use the same token — is it the same body because it's the same census? Maybe they want different governance parameters: in one process certain parameters, in another process different ones, but it's technically the same people involved in both.
- (1.24) The concrete trigger for the override: feedback from some people that it was weird that the members page listed the same set of members twice. So the ability to manually override that in the app CMS was added — you just say "hide this plugin" and one of them gets hidden. Called "mildly sneaky, but not too bad" — the client is fine with it, and it makes things a little simpler for people to do and see.
- (1.25) On nav-bar hiding: "Because normally everything's programmatic." Described as a core — "I don't know if it's like a philosophy, but it's kind of like a design principle" — because code is law, everything should kind of percolate up.

### Open questions and follow-ups

- (1.24) The author said they'd quickly explain why the hide-plugin thing was done, and flagged that if it's complicated, a whole separate topic — possibly a guide or explanation — might be needed for it later.

### Transcription and placement notes

- (1.27) "This is tied to a plugin, like a voting plugin" — the dictation doesn't make clear whether "it's" refers to the featured-delegates feature as a whole or specifically to the members-list tab. Preserved as stated without resolving.
- (spans 1.0.0, 1.21, 1.24, 1.25, 1.27 — meta note, not itself a release item) Per this category's scope, this file covers the app-CMS mechanism itself, not the individual features it configures. Those features stay centrally in their own categories and are only cross-referenced here: the Explore page featured-DAOs carousel (category 1); plugin-hiding on datalists together with its reused-body/shared-census rationale (also touches category 3's discussion of reusing a plugin as a body across multiple processes, 1.9, and category 10, gauge voting, since duplicate-listing across shared-census plugins is the kind of thing gauge/token-voting reuse produces); nav-bar hiding of gauges specifically (also touches category 10); featured delegates (also touches category 14, member identity, whose own scope explicitly includes "featured delegates configured via the app CMS"); and manual spam-token filtering (also touches category 17, platform infrastructure, where the general spam-token detection heuristics of 1.19 live).

## Linked accounts

### Features and mechanics

- (1.21) Linked accounts: a bi-directional on-chain permission signal that acknowledges one DAO from the other.
- (1.21) From a linked account, you can see the governance processes all together, and see which plugin is pointing to which DAO — or, as the author self-corrected mid-dictation, "governance process rather." Since a linked account is a link between two DAOs, both readings ("which DAO" and "which governance process") are substantively different and are preserved here (see Transcription and placement notes).

### Open questions and follow-ups

- (1.21) "I think I've mentioned linked accounts before, but we probably need to do a breakdown" — the author flagged that a fuller breakdown of linked accounts is still needed, and promised: "I'll give you more information about linked accounts later, I guess."
- (1.21) The author declined to elaborate further on linked accounts in this dictation ("I'm not going to go into it here"), instructing that if the documentation agent has a bunch of questions, a task should be created for the author to get more into it. The author also offered to share the marketing brain dump on linked accounts.

### Transcription and placement notes

- (1.21) Orchestrator note on versioning: dictated as "In app 21, 121"; rendered as 1.21 since it follows the 1.20 entry and precedes the 1.20.22 and 1.23 entries.
- (1.21) Self-correction preserved rather than silently resolved: the author said "which plugin is pointing to which DAO, or governance process rather" — voicing "DAO" before retracting to "governance process." Since a linked account is a link between two DAOs, "which DAO" and "which governance process" are substantively different readings, so both are kept in the Features and mechanics bullet above.

## Platform infrastructure: networks, contract upgrades & third-party integrations

### Features and mechanics

- (1.0.0) The assets/transfers page includes a little link out to a financial site called Octav, showing the DAO there so users "can see more assets there" — Aragon's own asset view is deliberately limited, "because we have a limited asset view because this isn't a financial app."
- (1.2.0) Additional network support was added: "the main ones" cited are Ethereum Sepolia, Ethereum Mainnet, Polygon, Arbitron, Optimism, "etc." — but "there are way more" than that list, and users "need to go to the app to actually see that" (the full set isn't enumerated anywhere else in the dictation).
- (1.4) OSx smart contracts have an upgrade feature, which allows DAOs to upgrade their smart contracts.
- (1.5.0) An upgrading flow was added that lets you upgrade the smart contracts for your DAO and for your various plugins; this flow is available directly from within the application.
- (Third-party dependencies aside — no release number given in the dictation; positioned between the 1.17 and 1.19 entries) Some of Aragon's third-party dependencies have "changed a little bit"; token prices come from CoinGecko, "a user might be interested in where those prices come from."
- (Third-party dependencies aside) The indexer uses different indexing techniques for different chains, depending on the chain.
- (Third-party dependencies aside) Block explorers, for getting contract code, also depend on the chain; Etherscan and Etherscan forks are used whenever possible.
- (1.19) Logic was added to detect whether or not a token is spam: "There's a bunch of heuristics involved, and it's not perfect."
- (1.21) A related, later control: an ability to manually filter out specific spam tokens (once somebody reports one) was added via the app CMS — a continuation of the 1.19 detection-heuristics item above. (Placement judgment call — see Transcription and placement notes.)

### Commentary and rationale

- (1.0.0) The Octav link was just a way to "kind of get cozy with them" by linking out.
- (1.4) The smart-contract upgrade feature isn't something to push on everyone: "I don't necessarily encourage the smart contract upgrade feature for everyone all the time, because it just adds unnecessary risk." Most upgrades are Aragon adding new features, so if a DAO isn't using those features, it doesn't need to upgrade.
- (1.5.0) Likewise, the in-app upgrading flow isn't pushed or driven: "we don't necessarily push or drive the upgrading flow, because most of the upgrades are for new features — if people don't have the new features, they don't need them, so who cares? No need to do significant contract changes." (This closely parallels the 1.4 rationale above — see Transcription and placement notes.)

### Open questions and follow-ups

- (1.2.0) The wiki probably shouldn't list the supported networks directly — instead it should say to go to the Create DAO flow, where you can see the networks supported.
- (1.2.0) Alternative thought on documenting the network list: maybe you need to go through the app, load it, and try to figure it out yourself; or you could just look at the app repo — "a sister repo to the repo you're in right now" — and pull all of that in.
- (1.19) If anybody sees a bunch of spam, they can reach out to the team, and the team will try to improve this filter.

### Transcription and placement notes

- (1.0.0) The link's name is spelled "Octav" in the Features text and "Octave" in the Commentary text — both spellings preserved verbatim from the source; not resolved here.
- (1.2.0) "Arbitron" (in the supported-networks list, alongside Ethereum Sepolia, Ethereum Mainnet, Polygon, and Optimism) may be a mis-transcription of a different network name — kept exactly as dictated since it couldn't be verified against a source.
- (1.4) "OSX smart contracts" is preserved as dictated; it's unclear whether "OSX" is the term the author intended or a mishearing/garbling of something else.
- (1.4 / 1.5.0) These two entries describe what may be the same overall upgrade capability (an OSx-level feature and its in-app flow) with near-identical "we don't push this" rationale given for both — kept as two separate release-tagged bullets rather than merged, since the source presents them as two distinct dated entries and it's not certain they're the same underlying work.
- (Third-party dependencies aside) Not tied to a release number in the dictation; the source's own orchestrator note places it between the 1.17 and 1.19 entries.
- (1.21, placement note) The manual spam-token-filter override via the app CMS is centrally a category 15 (App CMS content configuration) item per the category brief, since the mechanism itself is an app-CMS override — that category's file covers it in full and cross-references the general detection heuristics back to this category. Included above too since it directly continues this category's 1.19 thread; not duplicated in full here.

## General UI infrastructure, wallet safety & miscellaneous notes

### Features and mechanics

- (1.0.0) Whenever a page is loading, a blue bar displays across the top of the page to make clear that it's loading. The app runs on Vercel, which is why pages load decently quickly.
- (1.0.0) The Wallet Connect dialog — the dialog shown when connecting your wallet to the app — presents the terms and conditions as links, and you have to agree to them before you can connect your wallet. (This is distinct from the action builder's Wallet Connect feature, formerly called Dapp Connect, which imports actions from another connected app via that app's Wallet Connect QR code — that feature's substance belongs to category 6; noted here only as a cross-reference.)
- (1.33) Across wizards generally (e.g., when creating a proposal), whenever something is sent to the wallet the app remembers that it was sent. This guards against a general technical problem: if a transaction is sent to a wallet and doesn't go through, or the wallet provider has issues and "messes up," the app doesn't actually know the resulting state — the transaction might have gone through anyway even though it looks like it didn't — and if the user tries again without knowing that, they could accidentally create two proposals. To guard against this, the app gives the user a warning telling them to go check the block explorer and figure out the actual state before retrying.

### Commentary and rationale

- (1.0.0) The source's commentary notes restate the loading/hosting point explicitly: "we're running on Vercel," cited there as the reason pages load decently quickly — the same fact as the loading-indicator item above, called out again as its own commentary line.
- (1.20) Nothing shippable came out of app release 1.20: "we did a bunch of stuff that's not relevant and that we never released."
- (1.33) The wallet transaction-state warning is framed as answering a general technical question the team is "really doing our best on," applicable broadly across wizards, not just proposal creation.
- (1.33) Author's hedge on the wallet-state warning: "I think this is us just being nice. I don't really know."
- (1.25) Judgment call / placement note: while explaining why the nav bar sometimes needs manual overriding or hiding via the app CMS (the feature itself is category 15's), the author frames it against a general principle — "because normally everything's programmatic" — "I don't know if it's like a philosophy, but it's kind of like a design principle" — "because code is law, everything should kind of percolate up." Included here as a general-infrastructure/design-philosophy statement rather than an app-CMS-specific fact; see the placement note below.

### Open questions and follow-ups

- (1.0.0) General open question on page/error handling: "maybe we should have some questions around what happens if a page fails within the app." The team tries to scope the errors effectively, and there's an open question of how to show things in the UI when certain data is missing.

### Transcription and placement notes

- (1.0.0) The source flags that "Wallet Connect" is used for two apparently different things: (1) the dialog shown when connecting your wallet to the app, where the terms and conditions are presented (the item captured above, in this category); and (2) a distinct named feature in the action builder (formerly "Dapp Connect") that imports actions from another connected app via a Wallet Connect QR code (category 6's item). Both are preserved exactly as dictated in the source, which flags them in case they need to be disambiguated later. Cross-reference only — the action-builder feature's substance lives in category 6.
- Placement judgment call: the 1.25 "everything's programmatic" / "code is law" design-principle commentary (captured above) is dictated specifically while explaining the app-CMS nav-bar-hiding override, which is centrally category 15's territory. It's included here too, on the judgment call that it reads as a general UI-infrastructure/design-philosophy statement rather than a purely nav-bar-specific fact — flagging in case it should live solely with category 15 instead.
