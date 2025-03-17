use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use std::mem::size_of;

declare_id!("SkLvStvncgAwXjKWnNVEF7MWZXkAF1MJ6Wkdynds8nqN");

#[program]
pub mod skill_vesting {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let vesting_state = &mut ctx.accounts.vesting_state;
        vesting_state.authority = ctx.accounts.authority.key();
        vesting_state.vesting_id_counter = 0;
        Ok(())
    }

    pub fn create_vesting(
        ctx: Context<CreateVesting>,
        amount: u64,
        metric_type: String,
        thresholds: Vec<u64>,
        unlock_percentages: Vec<u64>,
    ) -> Result<()> {
        // Validate inputs
        require!(
            thresholds.len() == unlock_percentages.len(),
            VestingError::ArrayLengthMismatch
        );
        require!(
            !thresholds.is_empty(),
            VestingError::NoMilestones
        );

        // Check total percentage
        let mut total_percentage = 0;
        for percentage in &unlock_percentages {
            total_percentage += percentage;
        }
        require!(
            total_percentage <= 10000,
            VestingError::TotalPercentageExceeded
        );

        // Transfer tokens to the vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.token_from.to_account_info(),
            to: ctx.accounts.token_vault.to_account_info(),
            authority: ctx.accounts.creator.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        // Increment vesting ID counter
        let vesting_state = &mut ctx.accounts.vesting_state;
        vesting_state.vesting_id_counter += 1;
        let vesting_id = vesting_state.vesting_id_counter;

        // Initialize vesting schedule
        let vesting_schedule = &mut ctx.accounts.vesting_schedule;
        vesting_schedule.creator = ctx.accounts.creator.key();
        vesting_schedule.token_mint = ctx.accounts.token_mint.key();
        vesting_schedule.total_amount = amount;
        vesting_schedule.unlocked_amount = 0;
        vesting_schedule.oracle_address = ctx.accounts.oracle.key();
        vesting_schedule.metric_type = metric_type;
        vesting_schedule.active = true;
        vesting_schedule.vesting_id = vesting_id;

        // Add milestones
        for i in 0..thresholds.len() {
            vesting_schedule.milestones.push(Milestone {
                threshold: thresholds[i],
                unlock_percentage: unlock_percentages[i],
                reached: false,
            });
        }

        // Add to creator's vestings
        let creator_vestings = &mut ctx.accounts.creator_vestings;
        creator_vestings.creator = ctx.accounts.creator.key();
        creator_vestings.vesting_ids.push(vesting_id);

        // Emit event
        emit!(VestingCreatedEvent {
            vesting_id,
            creator: ctx.accounts.creator.key(),
            token_address: ctx.accounts.token_mint.key(),
            total_amount: amount,
        });

        Ok(())
    }

    pub fn check_milestones(ctx: Context<CheckMilestones>) -> Result<()> {
        let vesting_schedule = &mut ctx.accounts.vesting_schedule;
        require!(vesting_schedule.active, VestingError::VestingNotActive);

        // Get current metric value from oracle
        // In a real implementation, this would call the oracle
        // For now, we'll use a mock value from the oracle account
        let oracle_data = ctx.accounts.oracle.try_borrow_data()?;
        let current_value = u64::from_le_bytes(oracle_data[0..8].try_into().unwrap());
        drop(oracle_data);

        let mut new_milestone_reached = false;

        // Check each milestone
        for (i, milestone) in vesting_schedule.milestones.iter_mut().enumerate() {
            if !milestone.reached && current_value >= milestone.threshold {
                milestone.reached = true;

                // Calculate tokens to unlock
                let unlock_amount = (vesting_schedule.total_amount * milestone.unlock_percentage) / 10000;
                vesting_schedule.unlocked_amount += unlock_amount;

                // Emit event
                emit!(MilestoneReachedEvent {
                    vesting_id: vesting_schedule.vesting_id,
                    milestone_index: i as u64,
                    unlocked_amount: unlock_amount,
                });

                new_milestone_reached = true;
            }
        }

        require!(new_milestone_reached, VestingError::NoNewMilestonesReached);

        Ok(())
    }

    pub fn withdraw_unlocked(ctx: Context<WithdrawUnlocked>) -> Result<()> {
        let vesting_schedule = &mut ctx.accounts.vesting_schedule;
        
        require!(
            ctx.accounts.creator.key() == vesting_schedule.creator,
            VestingError::OnlyCreatorCanWithdraw
        );
        require!(vesting_schedule.active, VestingError::VestingNotActive);

        // Try to check milestones first (this might fail if no new milestones are reached)
        let _ = check_milestones(ctx.accounts.into());

        let unlock_amount = vesting_schedule.unlocked_amount;
        require!(unlock_amount > 0, VestingError::NoTokensToWithdraw);

        // Reset unlocked amount
        vesting_schedule.unlocked_amount = 0;

        // Transfer tokens from vault to creator
        let seeds = &[
            b"token_vault",
            &vesting_schedule.vesting_id.to_le_bytes(),
            &[ctx.bumps.token_vault],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.token_vault.to_account_info(),
            to: ctx.accounts.token_to.to_account_info(),
            authority: ctx.accounts.token_vault_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, unlock_amount)?;

        // Emit event
        emit!(TokensWithdrawnEvent {
            vesting_id: vesting_schedule.vesting_id,
            creator: vesting_schedule.creator,
            amount: unlock_amount,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + size_of::<VestingState>()
    )]
    pub vesting_state: Account<'info, VestingState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateVesting<'info> {
    #[account(mut)]
    pub vesting_state: Account<'info, VestingState>,
    
    #[account(
        init,
        payer = creator,
        space = 8 + size_of::<VestingSchedule>() + 
                4 + 16 + // metric_type: String (max 16 chars)
                4 + (size_of::<Milestone>() * 10) // milestones: Vec<Milestone> (max 10 milestones)
    )]
    pub vesting_schedule: Account<'info, VestingSchedule>,
    
    #[account(
        init_if_needed,
        payer = creator,
        space = 8 + size_of::<CreatorVestings>() + 
                4 + (8 * 10), // vesting_ids: Vec<u64> (max 10 vestings)
        seeds = [b"creator_vestings", creator.key().as_ref()],
        bump
    )]
    pub creator_vestings: Account<'info, CreatorVestings>,
    
    pub token_mint: Account<'info, anchor_spl::token::Mint>,
    
    #[account(
        mut,
        constraint = token_from.mint == token_mint.key(),
        constraint = token_from.owner == creator.key()
    )]
    pub token_from: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = creator,
        token::mint = token_mint,
        token::authority = token_vault_authority,
        seeds = [b"token_vault", vesting_state.vesting_id_counter.checked_add(1).unwrap().to_le_bytes().as_ref()],
        bump
    )]
    pub token_vault: Account<'info, TokenAccount>,
    
    /// CHECK: This is the PDA that will own the token vault
    #[account(
        seeds = [b"vault_authority", vesting_state.vesting_id_counter.checked_add(1).unwrap().to_le_bytes().as_ref()],
        bump
    )]
    pub token_vault_authority: AccountInfo<'info>,
    
    /// CHECK: This is the oracle account that will provide metric data
    pub oracle: AccountInfo<'info>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CheckMilestones<'info> {
    #[account(mut)]
    pub vesting_schedule: Account<'info, VestingSchedule>,
    
    /// CHECK: This is the oracle account that will provide metric data
    pub oracle: AccountInfo<'info>,
    
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct WithdrawUnlocked<'info> {
    #[account(mut)]
    pub vesting_schedule: Account<'info, VestingSchedule>,
    
    #[account(
        mut,
        seeds = [b"token_vault", vesting_schedule.vesting_id.to_le_bytes().as_ref()],
        bump
    )]
    pub token_vault: Account<'info, TokenAccount>,
    
    /// CHECK: This is the PDA that owns the token vault
    #[account(
        seeds = [b"vault_authority", vesting_schedule.vesting_id.to_le_bytes().as_ref()],
        bump
    )]
    pub token_vault_authority: AccountInfo<'info>,
    
    #[account(
        mut,
        constraint = token_to.mint == token_vault.mint,
        constraint = token_to.owner == creator.key()
    )]
    pub token_to: Account<'info, TokenAccount>,
    
    /// CHECK: This is the oracle account that will provide metric data
    pub oracle: AccountInfo<'info>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct VestingState {
    pub authority: Pubkey,
    pub vesting_id_counter: u64,
}

#[account]
pub struct VestingSchedule {
    pub creator: Pubkey,
    pub token_mint: Pubkey,
    pub total_amount: u64,
    pub unlocked_amount: u64,
    pub oracle_address: Pubkey,
    pub metric_type: String,
    pub active: bool,
    pub vesting_id: u64,
    pub milestones: Vec<Milestone>,
}

#[account]
pub struct CreatorVestings {
    pub creator: Pubkey,
    pub vesting_ids: Vec<u64>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Milestone {
    pub threshold: u64,
    pub unlock_percentage: u64, // in basis points (1/100 of a percent) - 10000 = 100%
    pub reached: bool,
}

#[event]
pub struct VestingCreatedEvent {
    pub vesting_id: u64,
    pub creator: Pubkey,
    pub token_address: Pubkey,
    pub total_amount: u64,
}

#[event]
pub struct MilestoneReachedEvent {
    pub vesting_id: u64,
    pub milestone_index: u64,
    pub unlocked_amount: u64,
}

#[event]
pub struct TokensWithdrawnEvent {
    pub vesting_id: u64,
    pub creator: Pubkey,
    pub amount: u64,
}

#[error_code]
pub enum VestingError {
    #[msg("Arrays must be the same length")]
    ArrayLengthMismatch,
    #[msg("Must have at least one milestone")]
    NoMilestones,
    #[msg("Total percentage cannot exceed 100%")]
    TotalPercentageExceeded,
    #[msg("Vesting schedule not active")]
    VestingNotActive,
    #[msg("No new milestones reached")]
    NoNewMilestonesReached,
    #[msg("Only creator can withdraw")]
    OnlyCreatorCanWithdraw,
    #[msg("No tokens to withdraw")]
    NoTokensToWithdraw,
} 