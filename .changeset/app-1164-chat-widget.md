---
"@aragon/assistant-chat": patch
"@aragon/app": patch
---

Fix two support chat glitches from the feedback round. A documentation lookup showed two spinners at once (assistant-ui keeps the empty-message spinner up next to a trailing tool part, and each running tool part drew its own) and none while the model read the results: the reply now shows a single spinner from the send until the answer starts streaming, through every lookup in between. And a message longer than the service accepts used to leave as usual and come back as a generic failure: the composer now stops at the limit (8,000 characters, a longer paste is clipped) and shows the count once a message gets close to it.
