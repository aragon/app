---
"@aragon/assistant": patch
"@aragon/assistant-contracts": patch
---

Stream every reply against the incoming history, so an approval resume continues the assistant message the draft lives in instead of opening a second one — the sentence written before the tool call was shown again under the created ticket. Attachments now reach the model as a line inside the message that carried them (a `data-attachment` part on the wire, named in the contracts), replacing the positionless "N files are attached" note the model could not place in time: it kept asking for a screenshot the user had just sent.
