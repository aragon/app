---
"@aragon/gov-ui-kit": minor
---

`Dropdown.Item` defaults to the external-link icon only for links opening in a new tab (`target="_blank"`). A link opening in the same tab gets no default icon, or the checkmark when `selected`. Pass `icon={IconType.LINK_EXTERNAL}` to keep the previous icon on a same-tab link.
