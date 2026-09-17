---
type: opportunity
title: Inspect the reward token and exact amount before claiming
tags: [governance, treasury, transparency]
status: candidate
source: consequential drill-down audit at released app@adad67873c8f9dd75e3ed340b70df3e985ae3557 and published @aragon/gov-ui-kit@2.11.4 (2026-09-13, see log.md)
---

# Inspect the reward token and exact amount before claiming

## User story

As a reward claimant, I want to inspect the payout token's address and my exact allocation before submitting a claim, so that I can verify which asset and amount I am accepting.

## Context + benefit

The [Capital Distributor](../../treasury/capital-distributor.md#rewards-page) campaign list and claim details shorten amounts for display. Claim details also show a symbol, estimated fiat value, recipient, resources, and any deadline, but offer no token-address link or exact-amount reveal and copy control. A shared token symbol cannot identify the contract, and a shortened amount cannot establish the precise allocation.

Settings lists installed contracts without identifying the selected campaign's token and allocation. Transaction links permit inspection after submission, and any additional wallet decoding varies by wallet. The candidate would make the network, distributor, campaign identifier, payout-token address, and exact amount inspectable before the claim, while retaining the compact default, recipient controls, and recorded claim-transaction route. It remains within Capital Distributor's existing client deployment arrangement.

Before ticketing, use allocations that lose precision in the compact display and tokens that share a symbol. Verify the token and amount against the selected campaign and the claimant's submitted proof amount, including any campaign-specific payout encoder. Check keyboard, pointer, and touch access and complete-value copying without changing the claim, and distinguish an allocation available to claim from an amount already paid.
