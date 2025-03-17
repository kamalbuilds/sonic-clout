use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use std::mem::size_of;

declare_id!("6vQd5xYpSYgVksYas7H8KNy6jVxS4kf8BH5Sd6PNGNJ6");

#[program]
pub mod sonic_bonds {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let bonds_state = &mut ctx.accounts.bonds_state;
        bonds_state.authority = ctx.accounts.authority.key();
        bonds_state.bond_counter = 0;
        Ok(())
    }

    pub fn create_bond(
        ctx: Context<CreateBond>,
        name: String,
        description: String,
        category: String,
        metric: String,
        total_supply: u64,
        initial_price: u64,
    ) -> Result<()> {
        require!(
            category == "game" || category == "social" || category == "content",
            BondError::InvalidCategory
        );

        require!(total_supply > 0, BondError::InvalidSupply);
        require!(initial_price > 0, BondError::InvalidPrice);

        // Increment bond counter
        let bonds_state = &mut ctx.accounts.bonds_state;
        bonds_state.bond_counter += 1;
        let bond_id = bonds_state.bond_counter;

        // Initialize bond data
        let bond = &mut ctx.accounts.bond;
        bond.id = bond_id;
        bond.creator = ctx.accounts.creator.key();
        bond.name = name.clone();
        bond.description = description;
        bond.category = category;
        bond.metric = metric;
        bond.total_supply = total_supply;
        bond.current_supply = total_supply;
        bond.price = initial_price;
        bond.oracle = ctx.accounts.oracle.key();
        bond.current_value = 0;
        bond.last_update = Clock::get()?.unix_timestamp;
        bond.active = true;

        // Initialize market data
        let market = &mut ctx.accounts.market;
        market.bond = bond.key();
        market.total_volume = 0;
        market.last_price = initial_price;
        market.price_change_24h = 0;
        market.market_cap = initial_price.checked_mul(total_supply).unwrap();

        // Add to creator's bonds
        let creator_bonds = &mut ctx.accounts.creator_bonds;
        creator_bonds.creator = ctx.accounts.creator.key();
        creator_bonds.bond_ids.push(bond_id);

        // Emit event
        emit!(BondCreatedEvent {
            bond_id,
            creator: ctx.accounts.creator.key(),
            name,
            total_supply,
            initial_price,
        });

        Ok(())
    }

    pub fn update_metric(ctx: Context<UpdateMetric>, new_value: u64) -> Result<()> {
        let bond = &mut ctx.accounts.bond;
        
        // Only oracle can update metrics
        require!(
            ctx.accounts.oracle.key() == bond.oracle,
            BondError::InvalidOracle
        );

        let old_value = bond.current_value;
        bond.current_value = new_value;
        bond.last_update = Clock::get()?.unix_timestamp;

        // Update price based on metric change
        if old_value > 0 {
            let price_change = if new_value > old_value {
                // Positive change - price increases
                ((new_value - old_value) * bond.price) / old_value
            } else {
                // Negative change - price decreases
                ((old_value - new_value) * bond.price) / old_value
            };

            let market = &mut ctx.accounts.market;
            market.last_price = bond.price;
            
            if new_value > old_value {
                bond.price = bond.price.checked_add(price_change).unwrap();
            } else {
                bond.price = bond.price.checked_sub(price_change).unwrap();
            }

            // Update market data
            market.market_cap = bond.price.checked_mul(bond.current_supply).unwrap();
            
            // Calculate 24h price change
            market.price_change_24h = ((bond.price as i64 - market.last_price as i64) * 10000) 
                / market.last_price as i64;
        }

        emit!(MetricUpdatedEvent {
            bond_id: bond.id,
            old_value,
            new_value,
            new_price: bond.price,
        });

        Ok(())
    }

    pub fn trade_bond(
        ctx: Context<TradeBond>,
        amount: u64,
        is_buy: bool,
    ) -> Result<()> {
        let bond = &mut ctx.accounts.bond;
        require!(bond.active, BondError::BondInactive);

        let market = &mut ctx.accounts.market;
        
        if is_buy {
            require!(
                amount <= bond.current_supply,
                BondError::InsufficientSupply
            );

            // Transfer payment
            let payment_amount = amount.checked_mul(bond.price).unwrap();
            let cpi_accounts = Transfer {
                from: ctx.accounts.buyer_token_account.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
            token::transfer(cpi_ctx, payment_amount)?;

            // Update bond state
            bond.current_supply = bond.current_supply.checked_sub(amount).unwrap();
            
            // Update market data
            market.total_volume = market.total_volume.checked_add(payment_amount).unwrap();
        } else {
            // Selling bonds
            let holder_bonds = &mut ctx.accounts.holder_bonds;
            require!(
                amount <= holder_bonds.amount,
                BondError::InsufficientBonds
            );

            // Calculate payment
            let payment_amount = amount.checked_mul(bond.price).unwrap();
            
            // Transfer payment from vault to seller
            let vault_authority_seeds = &[
                b"vault_authority".as_ref(),
                &[ctx.bumps.vault_authority]
            ];
            let signer = &[&vault_authority_seeds[..]];

            let cpi_accounts = Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.seller_token_account.to_account_info(),
                authority: ctx.accounts.vault_authority.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
            token::transfer(cpi_ctx, payment_amount)?;

            // Update bond state
            bond.current_supply = bond.current_supply.checked_add(amount).unwrap();
            holder_bonds.amount = holder_bonds.amount.checked_sub(amount).unwrap();
            
            // Update market data
            market.total_volume = market.total_volume.checked_add(payment_amount).unwrap();
        }

        emit!(BondTradedEvent {
            bond_id: bond.id,
            trader: ctx.accounts.buyer.key(),
            amount,
            price: bond.price,
            is_buy,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + size_of::<BondsState>()
    )]
    pub bonds_state: Account<'info, BondsState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String, description: String, category: String, metric: String)]
pub struct CreateBond<'info> {
    #[account(mut)]
    pub bonds_state: Account<'info, BondsState>,
    
    #[account(
        init,
        payer = creator,
        space = 8 + size_of::<Bond>() +
                4 + 32 + // name: String (max 32 chars)
                4 + 256 + // description: String (max 256 chars)
                4 + 16 + // category: String (max 16 chars)
                4 + 32 // metric: String (max 32 chars)
    )]
    pub bond: Account<'info, Bond>,
    
    #[account(
        init,
        payer = creator,
        space = 8 + size_of::<Market>()
    )]
    pub market: Account<'info, Market>,
    
    #[account(
        init,
        payer = creator,
        space = 8 + size_of::<CreatorBonds>() +
                4 + (8 * 50), // bond_ids: Vec<u64> (max 50 bonds)
        seeds = [b"creator_bonds", creator.key().as_ref()],
        bump
    )]
    pub creator_bonds: Account<'info, CreatorBonds>,
    
    /// CHECK: Oracle account that will provide metric updates
    pub oracle: AccountInfo<'info>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateMetric<'info> {
    #[account(mut)]
    pub bond: Account<'info, Bond>,
    
    #[account(mut)]
    pub market: Account<'info, Market>,
    
    /// CHECK: Verified in instruction
    pub oracle: Signer<'info>,
}

#[derive(Accounts)]
pub struct TradeBond<'info> {
    #[account(mut)]
    pub bond: Account<'info, Bond>,
    
    #[account(mut)]
    pub market: Account<'info, Market>,
    
    #[account(
        mut,
        seeds = [b"holder_bonds", bond.key().as_ref(), buyer.key().as_ref()],
        bump
    )]
    pub holder_bonds: Account<'info, HolderBonds>,
    
    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,
    
    /// CHECK: PDA that controls the vault
    #[account(
        seeds = [b"vault_authority"],
        bump
    )]
    pub vault_authority: AccountInfo<'info>,
    
    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,
    
    pub buyer: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct BondsState {
    pub authority: Pubkey,
    pub bond_counter: u64,
}

#[account]
pub struct Bond {
    pub id: u64,
    pub creator: Pubkey,
    pub name: String,
    pub description: String,
    pub category: String,
    pub metric: String,
    pub total_supply: u64,
    pub current_supply: u64,
    pub price: u64,
    pub oracle: Pubkey,
    pub current_value: u64,
    pub last_update: i64,
    pub active: bool,
}

#[account]
pub struct Market {
    pub bond: Pubkey,
    pub total_volume: u64,
    pub last_price: u64,
    pub price_change_24h: i64,
    pub market_cap: u64,
}

#[account]
pub struct CreatorBonds {
    pub creator: Pubkey,
    pub bond_ids: Vec<u64>,
}

#[account]
pub struct HolderBonds {
    pub holder: Pubkey,
    pub bond: Pubkey,
    pub amount: u64,
}

#[event]
pub struct BondCreatedEvent {
    pub bond_id: u64,
    pub creator: Pubkey,
    pub name: String,
    pub total_supply: u64,
    pub initial_price: u64,
}

#[event]
pub struct MetricUpdatedEvent {
    pub bond_id: u64,
    pub old_value: u64,
    pub new_value: u64,
    pub new_price: u64,
}

#[event]
pub struct BondTradedEvent {
    pub bond_id: u64,
    pub trader: Pubkey,
    pub amount: u64,
    pub price: u64,
    pub is_buy: bool,
}

#[error_code]
pub enum BondError {
    #[msg("Invalid bond category")]
    InvalidCategory,
    #[msg("Invalid bond supply")]
    InvalidSupply,
    #[msg("Invalid bond price")]
    InvalidPrice,
    #[msg("Bond is inactive")]
    BondInactive,
    #[msg("Insufficient bond supply")]
    InsufficientSupply,
    #[msg("Insufficient bonds held")]
    InsufficientBonds,
    #[msg("Invalid oracle")]
    InvalidOracle,
}
