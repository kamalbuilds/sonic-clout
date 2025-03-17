---
description: Learn how to use skill-based vesting for content tokens
---

# Skill-Based Vesting

Skill-based vesting is an innovative feature of SonicClout that allows creators to unlock tokens based on their social performance metrics. This creates incentives for creators to grow their audience while providing investors with protection through milestone-based token unlocking.

## What is Skill-Based Vesting?

Unlike traditional time-based vesting, skill-based vesting unlocks tokens when creators reach specific social metric milestones, such as:

- Number of followers
- Content views
- Engagement rates
- Likes or comments
- Other platform-specific metrics

This system benefits both creators and investors:
- **Creators** receive motivation to grow their social presence
- **Investors** gain protection as tokens only unlock when real value is created

## How It Works

SonicClout's skill-based vesting is powered by the Skill Vesting Anchor program on Solana:

1. **Schedule Creation**: Creator establishes a vesting schedule with specific metrics and milestones
2. **Token Allocation**: Tokens are locked in a vault contract
3. **Oracle Integration**: External oracles verify when social metrics reach milestones
4. **Milestone Verification**: The contract verifies milestones are reached
5. **Token Unlocking**: Tokens are released according to the vesting schedule

## Setting Up a Vesting Schedule

### Prerequisites

- Created content tokens (see [Content Tokenization](content-tokenization.md))
- Connected wallet with tokens to vest
- Clear goals for social metrics

### Step-by-Step Process

1. Navigate to the "Vesting" section in your profile
2. Click "Create New Vesting Schedule"
3. Select tokens and amount to vest
4. Choose the metric type (followers, views, etc.)
5. Set milestone thresholds:
   ```
   Example: 
   1,000 followers = 20% unlock
   5,000 followers = 30% unlock 
   10,000 followers = 50% unlock
   ```
6. Review the vesting schedule details
7. Confirm by approving the transaction in your wallet

## Monitoring and Claiming

### Checking Milestone Progress

1. Visit your "Vesting" dashboard
2. View current metrics and progress toward milestones
3. See percentage of tokens currently unlocked

### Claiming Unlocked Tokens

When you reach a milestone:

1. Go to your "Vesting" dashboard
2. Click "Check Milestones" to verify your current metrics
3. If milestones are reached, the "Withdraw Unlocked" button will be enabled
4. Click to claim your tokens
5. Approve the transaction in your wallet

## Technical Implementation

The Skill Vesting program utilizes:

- **Vesting State**: Tracks all vesting schedules in the system
- **Vesting Schedule**: Contains the specific details of each schedule
- **Oracle Integration**: Verifies social metrics from external sources
- **Token Vault**: Securely holds tokens until milestones are reached
- **Milestone Verification**: Logic to check if metrics meet thresholds

## Example Use Cases

### Growth-Based Vesting

A creator locks 100,000 tokens with the following milestones:
- 1,000 followers: 20,000 tokens unlock (20%)
- 5,000 followers: 30,000 additional tokens unlock (30%)
- 10,000 followers: 50,000 remaining tokens unlock (50%)

### Engagement-Based Vesting

A creator focuses on quality over quantity:
- 10,000 views: 25% of tokens unlock
- 1,000 likes: 25% of tokens unlock
- 500 comments: 25% of tokens unlock
- 100 shares: 25% of tokens unlock

## Best Practices

- Set realistic but challenging milestones
- Choose metrics that align with your content strategy
- Create a balanced vesting schedule (not too easy or too difficult)
- Consider using multiple metric types for diversified goals
- Regularly engage with your audience to maintain growth

## Troubleshooting

- **Metrics Not Updating**: Oracle data may have a delay of up to 24 hours
- **Transaction Failed**: Ensure you have SOL for transaction fees
- **Unable to Withdraw**: Verify all milestone conditions are met

## Next Steps

- Learn about [trading features](trading-features.md) for your tokens
- Explore [bonds and derivatives](bonds-derivatives.md) for advanced monetization
- Understand the [smart contracts](smart-contracts.md) behind vesting 