---
"@aragon/assistant": patch
---

Strip invisible format characters from attachment filenames. A right-to-left override made `invoice<RLO>gnp.exe` render as `invoiceexe.png` to whoever opened the support ticket; zero-width characters could likewise make two files carry the same visible name.
