---
'@aragon/app': patch
---

Stop two Safe surfaces from claiming more than they can deliver. The body card no longer promises that a vote counts "at any time" without saying that an advance ends it, and a result recorded after its stage advanced now says it had no effect instead of showing a bare verdict with a checkmark. The transaction review dialog refuses a delegate call to an address holding no code: that shape consumes a Safe nonce, reports success, and runs none of the calls listed below it.
