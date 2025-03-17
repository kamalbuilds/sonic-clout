use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use std::mem::size_of;

declare_id!("AVm9YvzuJqqKCJY6YCwkFiEVes9WX2qpsvmkJAPeNkWF");

#[program]
pub mod token_factory {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, mint_fee: u64, fee_receiver: Pubkey) -> Result<()> {
        let factory_state = &mut ctx.accounts.factory_state;
        factory_state.authority = ctx.accounts.authority.key();
        factory_state.token_counter = 0;
        factory_state.mint_fee = mint_fee;
        factory_state.fee_receiver = fee_receiver;
        Ok(())
    }

    pub fn create_token(
        ctx: Context<CreateToken>,
        name: String,
        symbol: String,
        initial_supply: u64,
        content_type: String,
        content_hash: String,
        decimals: u8,
    ) -> Result<()> {
        // Check if the fee is sufficient
        require!(
            ctx.accounts.payment.lamports() >= ctx.accounts.factory_state.mint_fee,
            TokenFactoryError::InsufficientFee
        );

        // Check if content is already tokenized
        let content_hash_bytes = content_hash.as_bytes();
        let content_hash_seed = &[b"content_hash", content_hash_bytes].concat()[..];
        let (content_hash_pda, _) = Pubkey::find_program_address(&[content_hash_seed], ctx.program_id);

        require!(
            ctx.accounts.content_hash_account.key() == content_hash_pda,
            TokenFactoryError::InvalidContentHashAccount
        );

        // Transfer fee to receiver
        let transfer_instruction = anchor_lang::system_program::Transfer {
            from: ctx.accounts.payer.to_account_info(),
            to: ctx.accounts.fee_receiver.to_account_info(),
        };
        
        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            transfer_instruction,
        );
        
        anchor_lang::system_program::transfer(cpi_ctx, ctx.accounts.payment.lamports())?;

        // Initialize the content token metadata
        let token_metadata = &mut ctx.accounts.token_metadata;
        token_metadata.name = name;
        token_metadata.symbol = symbol;
        token_metadata.content_type = content_type.clone();
        token_metadata.content_hash = content_hash.clone();
        token_metadata.creator = ctx.accounts.payer.key();
        token_metadata.creation_time = Clock::get()?.unix_timestamp;

        // Initialize the content hash account
        let content_hash_account = &mut ctx.accounts.content_hash_account;
        content_hash_account.token_id = ctx.accounts.factory_state.token_counter + 1;
        content_hash_account.token_metadata = ctx.accounts.token_metadata.key();

        // Mint tokens to the creator
        let cpi_accounts = token::MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.payer.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::mint_to(cpi_ctx, initial_supply * 10u64.pow(decimals as u32))?;

        // Increment token counter
        ctx.accounts.factory_state.token_counter += 1;

        // Emit event
        emit!(TokenCreatedEvent {
            token_id: ctx.accounts.factory_state.token_counter,
            token_address: ctx.accounts.mint.key(),
            content_type: content_type,
            content_hash: content_hash,
            creator: ctx.accounts.payer.key(),
        });

        Ok(())
    }

    pub fn set_mint_fee(ctx: Context<UpdateFactory>, new_fee: u64) -> Result<()> {
        let factory_state = &mut ctx.accounts.factory_state;
        require!(
            ctx.accounts.authority.key() == factory_state.authority,
            TokenFactoryError::Unauthorized
        );
        
        factory_state.mint_fee = new_fee;
        Ok(())
    }

    pub fn set_fee_receiver(ctx: Context<UpdateFactory>, new_receiver: Pubkey) -> Result<()> {
        let factory_state = &mut ctx.accounts.factory_state;
        require!(
            ctx.accounts.authority.key() == factory_state.authority,
            TokenFactoryError::Unauthorized
        );
        
        factory_state.fee_receiver = new_receiver;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + size_of::<FactoryState>()
    )]
    pub factory_state: Account<'info, FactoryState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateToken<'info> {
    #[account(mut)]
    pub factory_state: Account<'info, FactoryState>,
    
    #[account(
        init,
        payer = payer,
        space = 8 + size_of::<TokenMetadata>() + 
                4 + 32 + // name: String (max 32 chars)
                4 + 8 +  // symbol: String (max 8 chars)
                4 + 16 + // content_type: String (max 16 chars)
                4 + 64   // content_hash: String (max 64 chars)
    )]
    pub token_metadata: Account<'info, TokenMetadata>,
    
    #[account(
        init,
        payer = payer,
        space = 8 + size_of::<ContentHashAccount>()
    )]
    pub content_hash_account: Account<'info, ContentHashAccount>,
    
    #[account(
        init,
        payer = payer,
        mint::decimals = 9,
        mint::authority = payer,
    )]
    pub mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = payer,
        token::mint = mint,
        token::authority = payer,
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    /// CHECK: This is the fee receiver account
    #[account(mut, address = factory_state.fee_receiver)]
    pub fee_receiver: AccountInfo<'info>,
    
    /// CHECK: This is the payment amount
    #[account(mut)]
    pub payment: AccountInfo<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct UpdateFactory<'info> {
    #[account(mut)]
    pub factory_state: Account<'info, FactoryState>,
    
    pub authority: Signer<'info>,
}

#[account]
pub struct FactoryState {
    pub authority: Pubkey,
    pub token_counter: u64,
    pub mint_fee: u64,
    pub fee_receiver: Pubkey,
}

#[account]
pub struct TokenMetadata {
    pub name: String,
    pub symbol: String,
    pub content_type: String,
    pub content_hash: String,
    pub creator: Pubkey,
    pub creation_time: i64,
}

#[account]
pub struct ContentHashAccount {
    pub token_id: u64,
    pub token_metadata: Pubkey,
}

#[event]
pub struct TokenCreatedEvent {
    pub token_id: u64,
    pub token_address: Pubkey,
    pub content_type: String,
    pub content_hash: String,
    pub creator: Pubkey,
}

#[error_code]
pub enum TokenFactoryError {
    #[msg("Insufficient fee for token creation")]
    InsufficientFee,
    #[msg("Content has already been tokenized")]
    ContentAlreadyTokenized,
    #[msg("Invalid content hash account")]
    InvalidContentHashAccount,
    #[msg("Unauthorized access")]
    Unauthorized,
} 