use anchor_lang::prelude::*;
use anchor_lang::solana_program::{system_instruction, program::invoke};

declare_id!("Hs68KZpxy8yxem4VhMXerpBQFK2YWJCbXMcYCDTNJTF3");

const MAX_DESCRIPTION_LENGTH: usize = 500;
const MIN_WITHDRAW_AMOUNT: u64 = 100_000;

/// ✅ Solclassis 프로그램
#[program]
pub mod solclassis {
    use super::*;

    /// ✅ 캠페인 생성
    pub fn create_campaign(
        ctx: Context<CreateCampaign>,
        title: String,
        description: String,
        goal: u64,
        donation_amount: u64,
        end_date: i64,
    ) -> Result<()> {
        if description.len() > MAX_DESCRIPTION_LENGTH {
            return Err(ErrorCode::DescriptionTooLong.into());
        }
        if donation_amount == 0 {
            return Err(ErrorCode::InvalidGoalAmount.into());
        }
        if goal % donation_amount != 0 {
            return Err(ErrorCode::InvalidGoalAmount.into());
        }

        let campaign = &mut ctx.accounts.campaign;
        campaign.creator = *ctx.accounts.creator.key;
        campaign.foundation = *ctx.accounts.foundation.key;
        campaign.title = title.clone();
        campaign.description = description;
        campaign.goal = goal;
        campaign.donation_amount = donation_amount;
        campaign.raised = 0;
        campaign.end_date = end_date;
        campaign.complete = false;
        campaign.failed = false;

        emit!(CampaignCreated {
            campaign: *campaign.to_account_info().key,
            title,
            goal,
        });
        Ok(())
    }

    /// ✅ 후원자 PDA 생성
    pub fn create_donation_pda(ctx: Context<CreateDonationPda>) -> Result<()> {
        let donation = &mut ctx.accounts.donation;
        donation.donor = *ctx.accounts.donor.key;
        donation.amount = 0;
        Ok(())
    }

    /// ✅ 펀딩 참여
    pub fn donate(ctx: Context<Donate>, amount: u64) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let donor = &ctx.accounts.donor;
        let donation = &mut ctx.accounts.donation;

        if Clock::get()?.unix_timestamp >= campaign.end_date {
            return Err(ErrorCode::CampaignEnded.into());
        }
        if amount != campaign.donation_amount {
            return Err(ErrorCode::InvalidDonationAmount.into());
        }
        if donation.amount > 0 {
            return Err(ErrorCode::AlreadyDonated.into());
        }

        let transfer_instruction = system_instruction::transfer(
            &donor.key(),
            &campaign.key(),
            amount,
        );
        invoke(
            &transfer_instruction,
            &[
                donor.to_account_info(),
                campaign.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        campaign.raised = campaign.raised.checked_add(amount).ok_or(ErrorCode::OverflowError)?;
        donation.amount = amount;

        emit!(DonationReceived {
            campaign: *campaign.to_account_info().key,
            donor: *donor.key,
            amount,
        });

        if campaign.raised >= campaign.goal {
            campaign.complete = true;
            emit!(CampaignCompleted {
                campaign: *campaign.to_account_info().key,
                raised: campaign.raised,
            });
        }
        Ok(())
    }

    /// ✅ 캠페인 종료 (Cloudflare Worker로 자동 호출 예정)
    pub fn end_campaign(ctx: Context<EndCampaign>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let current_time = Clock::get()?.unix_timestamp;

        if current_time < campaign.end_date {
            return Err(ErrorCode::CampaignNotEnded.into());
        }
        if campaign.complete || campaign.failed {
            return Err(ErrorCode::CampaignAlreadyComplete.into());
        }

        if campaign.raised < campaign.goal {
            campaign.failed = true;
            emit!(CampaignFailed {
                campaign: *campaign.to_account_info().key,
                raised: campaign.raised,
            });
        } else {
            campaign.complete = true;
            emit!(CampaignCompleted {
                campaign: *campaign.to_account_info().key,
                raised: campaign.raised,
            });
        }
        Ok(())
    }

    /// ✅ 자금 인출 (재단 지갑으로 전송)
    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let foundation = &ctx.accounts.foundation;

        if !campaign.complete {
            return Err(ErrorCode::CampaignNotComplete.into());
        }

        let rent_balance = Rent::get()?.minimum_balance(campaign.to_account_info().data_len());
        let available_balance = **campaign.to_account_info().lamports.borrow() - rent_balance;

        if available_balance == 0 {
            return Err(ErrorCode::NoFundsAvailable.into());
        }
        if available_balance < MIN_WITHDRAW_AMOUNT {
            return Err(ErrorCode::WithdrawAmountTooSmall.into());
        }

        **campaign.to_account_info().try_borrow_mut_lamports()? -= available_balance;
        **foundation.to_account_info().try_borrow_mut_lamports()? += available_balance;

        Ok(())
    }

    /// ✅ 환불 (기부자가 직접 호출)
    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        let campaign = &mut ctx.accounts.campaign;
        let donation = &mut ctx.accounts.donation;

        if !campaign.failed {
            return Err(ErrorCode::CampaignNotFailed.into());
        }

        let refund_amount = donation.amount;
        if refund_amount == 0 {
            return Err(ErrorCode::NoFundsAvailable.into());
        }

        donation.amount = 0; // 중복 환불 방지
        **campaign.to_account_info().try_borrow_mut_lamports()? -= refund_amount;
        **ctx.accounts.donor.to_account_info().try_borrow_mut_lamports()? += refund_amount;

        emit!(RefundProcessed {
            campaign: *campaign.to_account_info().key,
            donor: *ctx.accounts.donor.key,
            amount: refund_amount,
        });
        Ok(())
    }

    /// ✅ 캠페인 상태 조회 (디버깅용)
    pub fn get_campaign_status(ctx: Context<GetCampaignStatus>) -> Result<()> {
        let campaign = &ctx.accounts.campaign;
        msg!(
            "📢 Campaign '{}' Status: Goal: {}, Raised: {}, Complete: {}, Failed: {}",
            campaign.title,
            campaign.goal,
            campaign.raised,
            campaign.complete,
            campaign.failed
        );
        Ok(())
    }
}

/// ✅ 이벤트 정의
#[event]
pub struct CampaignCreated {
    pub campaign: Pubkey,
    pub title: String,
    pub goal: u64,
}

#[event]
pub struct DonationReceived {
    pub campaign: Pubkey,
    pub donor: Pubkey,
    pub amount: u64,
}

#[event]
pub struct CampaignCompleted {
    pub campaign: Pubkey,
    pub raised: u64,
}

#[event]
pub struct CampaignFailed {
    pub campaign: Pubkey,
    pub raised: u64,
}

#[event]
pub struct RefundProcessed {
    pub campaign: Pubkey,
    pub donor: Pubkey,
    pub amount: u64,
}

/// ✅ 데이터 구조체
#[account]
pub struct Campaign {
    pub creator: Pubkey,
    pub foundation: Pubkey, // 재단 지갑
    pub title: String,
    pub description: String,
    pub goal: u64,
    pub donation_amount: u64,
    pub raised: u64,
    pub end_date: i64,
    pub complete: bool,
    pub failed: bool,
}

#[account]
pub struct Donation {
    pub donor: Pubkey,
    pub amount: u64,
}

/// ✅ 계정 구조체
#[derive(Accounts)]
pub struct CreateCampaign<'info> {
    #[account(init, payer = creator, space = 8 + 700)] // 공간 최적화
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub creator: Signer<'info>,
    /// CHECK: This is the foundation wallet, no further validation needed as it's set by the creator
    pub foundation: AccountInfo<'info>, // 재단 지갑 추가
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateDonationPda<'info> {
    #[account(init, payer = donor, space = 8 + 40, seeds = [b"donation", donor.key().as_ref(), campaign.key().as_ref()], bump)]
    pub donation: Account<'info, Donation>,
    #[account(mut)]
    pub donor: Signer<'info>,
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Donate<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub donor: Signer<'info>,
    #[account(mut, has_one = donor, seeds = [b"donation", donor.key().as_ref(), campaign.key().as_ref()], bump)]
    pub donation: Account<'info, Donation>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EndCampaign<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub admin: Signer<'info>, // Cloudflare Worker가 호출할 예정
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut, has_one = foundation)]
    pub campaign: Account<'info, Campaign>,
    /// CHECK: This is the foundation wallet, validated by the 'has_one' constraint in campaign
    #[account(mut)]
    pub foundation: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Refund<'info> {
    #[account(mut)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut, has_one = donor, seeds = [b"donation", donor.key().as_ref(), campaign.key().as_ref()], bump)]
    pub donation: Account<'info, Donation>,
    #[account(mut)]
    pub donor: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetCampaignStatus<'info> {
    #[account()]
    pub campaign: Account<'info, Campaign>,
}

/// ✅ 에러 코드
#[error_code]
pub enum ErrorCode {
    #[msg("Overflow error occurred.")]
    OverflowError,
    #[msg("The campaign has already ended.")]
    CampaignEnded,
    #[msg("The campaign has not reached its goal.")]
    CampaignNotComplete,
    #[msg("No funds available for withdrawal or refund.")]
    NoFundsAvailable,
    #[msg("Invalid donation amount.")]
    InvalidDonationAmount,
    #[msg("Campaign description is too long.")]
    DescriptionTooLong,
    #[msg("Withdrawal amount is too small.")]
    WithdrawAmountTooSmall,
    #[msg("Invalid goal amount.")]
    InvalidGoalAmount,
    #[msg("You have already donated to this campaign.")]
    AlreadyDonated,
    #[msg("The campaign has not failed.")]
    CampaignNotFailed,
    #[msg("The campaign cannot be ended before its end date.")]
    CampaignNotEnded,
    #[msg("The campaign is already complete or failed.")]
    CampaignAlreadyComplete,
}