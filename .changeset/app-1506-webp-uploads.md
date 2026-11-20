---
"@aragon/app": patch
---

Accept WebP images in avatar and logo uploads. The upload check reads the file content, so a WebP image saved with a `.png` name failed to pin to IPFS.
