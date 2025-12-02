import * as anchor from "@coral-xyz/anchor"; // Anchor 라이브러리
import { Program, BN } from "@coral-xyz/anchor"; // Program, BN 등
import { Solclassis } from "../target/types/solclassis"; // 빌드된 IDL 타입 불러오기
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js"; // Solana web3 모듈
import { assert } from "chai"; // 테스트 검증용
import * as dotenv from "dotenv"; // 환경변수 로드
dotenv.config();

describe("solclassis", () => {
  // 프로그램 및 provider 설정
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Solclassis as Program<Solclassis>;
  const connection = provider.connection;
  const creator = provider.wallet; // 기본 제공 지갑 (캠페인 생성자)

  // 기본 테스트에 사용할 계정: 기부자와 재단
  const donor = Keypair.generate();
  const foundation = Keypair.generate();

  // 모든 테스트 전에 한 번 실행: airdrop을 통해 기본 기부자와 재단에 충분한 SOL 지급
  before(async () => {
    console.log("Program ID:", program.programId.toString());
    console.log("Creator:", creator.publicKey.toString());
    console.log("Donor:", donor.publicKey.toString());
    console.log("Foundation:", foundation.publicKey.toString());

    await connection.requestAirdrop(donor.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.requestAirdrop(foundation.publicKey, 2 * LAMPORTS_PER_SOL);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });

  // ===================== 실패 케이스 (캠페인 실패 및 환불) =====================
  let campaignKeypair: Keypair;
  let donationPda: PublicKey;

  it("캠페인 생성 (실패 케이스 테스트용)", async () => {
    // 목표 1 SOL, 후원 0.5 SOL, 종료: 현재 + 5초 (한 번의 기부로 목표 미달)
    campaignKeypair = Keypair.generate();
    const title = "Test Campaign";
    const description = "This is a test campaign for Solclassis.";
    const goal = new BN(1 * LAMPORTS_PER_SOL);
    const donationAmount = new BN(0.5 * LAMPORTS_PER_SOL);
    const currentUnixTime = Math.floor(Date.now() / 1000);
    const endDate = new BN(currentUnixTime + 5);

    // 캠페인 생성 인스트럭션 호출
    await program.methods
      .createCampaign(title, description, goal, donationAmount, endDate)
      .accounts({
        campaign: campaignKeypair.publicKey,
        creator: creator.publicKey,
        foundation: foundation.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([campaignKeypair])
      .rpc();

    const campaignAccount = await program.account.campaign.fetch(campaignKeypair.publicKey);
    console.log("캠페인 생성 완료 (실패 케이스):", campaignAccount);
    assert.equal(campaignAccount.title, title);
    assert.equal(campaignAccount.goal.toString(), goal.toString());
    assert.equal(campaignAccount.raised.toString(), "0");
    console.log("캠페인 종료 시간:", campaignAccount.endDate.toString());
  });

  it("후원자 PDA 생성 (실패 케이스)", async () => {
    // "donation" seed, 기본 donor 및 실패 캠페인 계정을 이용하여 PDA 도출
    const [donationPdaTemp] = await PublicKey.findProgramAddress(
      [
        Buffer.from("donation"),
        donor.publicKey.toBuffer(),
        campaignKeypair.publicKey.toBuffer(),
      ],
      program.programId
    );
    donationPda = donationPdaTemp;
    console.log("후원자 PDA (실패 케이스):", donationPda.toString());

    // 후원자 PDA 생성 인스트럭션 호출
    await program.methods
      .createDonationPda()
      .accounts({
        donation: donationPda,
        donor: donor.publicKey,
        campaign: campaignKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([donor])
      .rpc();

    const donationAccount = await program.account.donation.fetch(donationPda);
    console.log("후원자 계정 생성 완료 (실패 케이스):", donationAccount);
    assert.equal(donationAccount.donor.toBase58(), donor.publicKey.toBase58());
  });

  it("펀딩 참여 (실패 케이스)", async () => {
    // 0.5 SOL 기부하여 raised 값 갱신
    const donationAmountLamports = 0.5 * LAMPORTS_PER_SOL;
    await program.methods
      .donate(new BN(donationAmountLamports))
      .accounts({
        campaign: campaignKeypair.publicKey,
        donor: donor.publicKey,
        donation: donationPda,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([donor])
      .rpc();

    const campaignAccount = await program.account.campaign.fetch(campaignKeypair.publicKey);
    console.log("펀딩 후 캠페인 상태 (실패 케이스):", campaignAccount);
    assert.equal(campaignAccount.raised.toString(), donationAmountLamports.toString());
  });

  it("캠페인 종료 (실패 처리)", async () => {
    // 종료시간 경과를 위해 약 6초 대기
    await new Promise((resolve) => setTimeout(resolve, 6000));

    await program.methods
      .endCampaign()
      .accounts({
        campaign: campaignKeypair.publicKey,
        admin: creator.publicKey,
      } as any)
      .rpc();

    const campaignAccount = await program.account.campaign.fetch(campaignKeypair.publicKey);
    console.log("캠페인 종료 후 상태 (실패 처리):", campaignAccount);
    assert.isTrue(campaignAccount.failed);
  });

  it("환불 요청", async () => {
    // 환불 전 기부자 잔액 조회 및 로그 출력
    const donorBalanceBefore = await connection.getBalance(donor.publicKey);
    console.log("환불 전 기부자 잔액:", donorBalanceBefore);
    await program.methods
      .refund()
      .accounts({
        campaign: campaignKeypair.publicKey,
        donation: donationPda,
        donor: donor.publicKey,
      } as any)
      .signers([donor])
      .rpc();

    const donorBalanceAfter = await connection.getBalance(donor.publicKey);
    console.log("환불 후 기부자 잔액:", donorBalanceAfter);
    assert.isTrue(donorBalanceAfter > donorBalanceBefore);
  });

  // ===================== 성공 케이스 (캠페인 성공 및 자금 인출) =====================
  let campaignSuccessKeypair: Keypair;
  let donationPdaSuccess: PublicKey;
  it("캠페인 생성 (성공 케이스 테스트용)", async () => {
    // 목표와 후원 금액 모두 1 SOL로 설정하여 단 한 번의 기부로 성공
    campaignSuccessKeypair = Keypair.generate();
    const title = "Successful Campaign";
    const description = "This campaign should succeed.";
    const donationAmount = new BN(1 * LAMPORTS_PER_SOL);
    const goal = new BN(1 * LAMPORTS_PER_SOL);
    const currentUnixTime = Math.floor(Date.now() / 1000);
    const endDate = new BN(currentUnixTime + 10);

    await program.methods
      .createCampaign(title, description, goal, donationAmount, endDate)
      .accounts({
        campaign: campaignSuccessKeypair.publicKey,
        creator: creator.publicKey,
        foundation: foundation.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([campaignSuccessKeypair])
      .rpc();

    const campaignAccount = await program.account.campaign.fetch(campaignSuccessKeypair.publicKey);
    console.log("성공 캠페인 생성 완료:", campaignAccount);
    assert.equal(campaignAccount.title, title);
  });

  it("후원자 PDA 생성 (성공 캠페인)", async () => {
    // 성공 캠페인용 후원자 PDA 생성
    const [donationPdaTemp] = await PublicKey.findProgramAddress(
      [
        Buffer.from("donation"),
        donor.publicKey.toBuffer(),
        campaignSuccessKeypair.publicKey.toBuffer(),
      ],
      program.programId
    );
    donationPdaSuccess = donationPdaTemp;

    await program.methods
      .createDonationPda()
      .accounts({
        donation: donationPdaSuccess,
        donor: donor.publicKey,
        campaign: campaignSuccessKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([donor])
      .rpc();

    const donationAccount = await program.account.donation.fetch(donationPdaSuccess);
    console.log("성공 캠페인 후원자 계정 생성 완료:", donationAccount);
    assert.equal(donationAccount.donor.toBase58(), donor.publicKey.toBase58());
  });

  it("펀딩 참여 (성공 캠페인)", async () => {
    // 성공 캠페인에 1 SOL 기부하여 목표 달성
    const donationAmountLamports = 1 * LAMPORTS_PER_SOL;
    await program.methods
      .donate(new BN(donationAmountLamports))
      .accounts({
        campaign: campaignSuccessKeypair.publicKey,
        donor: donor.publicKey,
        donation: donationPdaSuccess,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([donor])
      .rpc();

    const campaignAccount = await program.account.campaign.fetch(campaignSuccessKeypair.publicKey);
    console.log("성공 캠페인 펀딩 후 상태:", campaignAccount);
    assert.equal(campaignAccount.raised.toString(), donationAmountLamports.toString());
    assert.isTrue(campaignAccount.complete);
  });

  it("캠페인 종료 (성공 처리) 및 자금 인출", async () => {
    // 성공 캠페인은 이미 complete 상태임
    const campaignAccountBefore = await program.account.campaign.fetch(campaignSuccessKeypair.publicKey);
    console.log("인출 전 성공 캠페인 상태:", campaignAccountBefore);
    assert.isTrue(campaignAccountBefore.complete);

    const foundationBalanceBefore = await connection.getBalance(foundation.publicKey);
    console.log("인출 전 재단 잔액:", foundationBalanceBefore);
    await program.methods
      .withdraw()
      .accounts({
        campaign: campaignSuccessKeypair.publicKey,
        foundation: foundation.publicKey,
      } as any)
      .rpc();

    const foundationBalanceAfter = await connection.getBalance(foundation.publicKey);
    console.log("인출 후 재단 잔액:", foundationBalanceAfter);
    assert.isTrue(foundationBalanceAfter > foundationBalanceBefore);
  });

  // ===================== 추가 시나리오 =====================

  // 1. 중복 기부 방지 테스트 (독립된 기부자 사용)
  it("중복 기부 방지 테스트", async () => {
    // 새로운 기부자 계정 생성 및 충분한 SOL 확보
    const dupDonor = Keypair.generate();
    await connection.requestAirdrop(dupDonor.publicKey, 2 * LAMPORTS_PER_SOL);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("새 기부자 (dupDonor):", dupDonor.publicKey.toString());

    // 새로운 캠페인 생성 (목표: 3 SOL, 후원: 1 SOL)
    const dupCampaign = Keypair.generate();
    const title = "Duplicate Donation Test";
    const description = "Testing duplicate donation prevention.";
    const goal = new BN(3 * LAMPORTS_PER_SOL);
    const donationAmount = new BN(1 * LAMPORTS_PER_SOL);
    const currentUnixTime = Math.floor(Date.now() / 1000);
    const endDate = new BN(currentUnixTime + 20);
    await program.methods
      .createCampaign(title, description, goal, donationAmount, endDate)
      .accounts({
        campaign: dupCampaign.publicKey,
        creator: creator.publicKey,
        foundation: foundation.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([dupCampaign])
      .rpc();
    console.log("중복 기부 테스트 캠페인 생성 완료");

    // 중복 기부용 후원자 PDA 생성
    const [dupDonationPda] = await PublicKey.findProgramAddress(
      [
        Buffer.from("donation"),
        dupDonor.publicKey.toBuffer(),
        dupCampaign.publicKey.toBuffer(),
      ],
      program.programId
    );
    await program.methods
      .createDonationPda()
      .accounts({
        donation: dupDonationPda,
        donor: dupDonor.publicKey,
        campaign: dupCampaign.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([dupDonor])
      .rpc();
    console.log("중복 기부 테스트 후원자 PDA 생성 완료");

    // 첫 번째 기부 시도 (1 SOL)
    await program.methods
      .donate(new BN(1 * LAMPORTS_PER_SOL))
      .accounts({
        campaign: dupCampaign.publicKey,
        donor: dupDonor.publicKey,
        donation: dupDonationPda,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([dupDonor])
      .rpc();
    console.log("중복 기부 테스트: 첫 번째 기부 완료");

    // 두 번째 기부 시도 (중복 기부가 허용되면 안됨)
    try {
      await program.methods
        .donate(new BN(1 * LAMPORTS_PER_SOL))
        .accounts({
          campaign: dupCampaign.publicKey,
          donor: dupDonor.publicKey,
          donation: dupDonationPda,
          systemProgram: SystemProgram.programId,
        } as any)
        .signers([dupDonor])
        .rpc();
      assert.fail("중복 기부가 허용되면 안됨");
    } catch (err: any) {
      console.log("중복 기부 방지 테스트 오류 발생:", err.error.errorMessage);
      // 에러 메시지가 "already donated"를 포함하는지 검증
      assert.include(err.error.errorMessage, "already donated");
    }
  });

  // 2. 유효하지 않은 기부 금액 테스트
  it("유효하지 않은 기부 금액 테스트", async () => {
    // 새로운 캠페인 생성 (목표: 2 SOL, 후원: 1 SOL)
    const invalidDonCampaign = Keypair.generate();
    const title = "Invalid Donation Amount Test";
    const description = "Testing donation amount validation.";
    const goal = new BN(2 * LAMPORTS_PER_SOL);
    const donationAmount = new BN(1 * LAMPORTS_PER_SOL);
    const currentUnixTime = Math.floor(Date.now() / 1000);
    const endDate = new BN(currentUnixTime + 20);
    await program.methods
      .createCampaign(title, description, goal, donationAmount, endDate)
      .accounts({
        campaign: invalidDonCampaign.publicKey,
        creator: creator.publicKey,
        foundation: foundation.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([invalidDonCampaign])
      .rpc();
    console.log("유효하지 않은 기부 금액 테스트 캠페인 생성 완료");

    // 후원자 PDA 생성
    const [invalidDonationPda] = await PublicKey.findProgramAddress(
      [
        Buffer.from("donation"),
        donor.publicKey.toBuffer(),
        invalidDonCampaign.publicKey.toBuffer(),
      ],
      program.programId
    );
    await program.methods
      .createDonationPda()
      .accounts({
        donation: invalidDonationPda,
        donor: donor.publicKey,
        campaign: invalidDonCampaign.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([donor])
      .rpc();
    console.log("유효하지 않은 기부 금액 테스트 후원자 PDA 생성 완료");

    // 0.5 SOL 기부 시도 (요구 기부 금액과 다른 경우)
    try {
      await program.methods
        .donate(new BN(0.5 * LAMPORTS_PER_SOL))
        .accounts({
          campaign: invalidDonCampaign.publicKey,
          donor: donor.publicKey,
          donation: invalidDonationPda,
          systemProgram: SystemProgram.programId,
        } as any)
        .signers([donor])
        .rpc();
      assert.fail("유효하지 않은 기부 금액이 허용되면 안됨");
    } catch (err: any) {
      console.log("유효하지 않은 기부 금액 테스트 오류 발생:", err.error.errorMessage);
      assert.include(err.error.errorMessage, "Invalid donation amount");
    }
  });

  // 3. 캠페인 종료 이후 기부 테스트
  it("캠페인 종료 이후 기부 테스트", async () => {
    // 종료 시간이 짧은 캠페인 생성 (목표: 1 SOL, 후원: 1 SOL)
    const postEndCampaign = Keypair.generate();
    const title = "Post End Donation Test";
    const description = "Testing donation after campaign end.";
    const goal = new BN(1 * LAMPORTS_PER_SOL);
    const donationAmount = new BN(1 * LAMPORTS_PER_SOL);
    const currentUnixTime = Math.floor(Date.now() / 1000);
    const endDate = new BN(currentUnixTime + 3); // 3초 후 종료
    await program.methods
      .createCampaign(title, description, goal, donationAmount, endDate)
      .accounts({
        campaign: postEndCampaign.publicKey,
        creator: creator.publicKey,
        foundation: foundation.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([postEndCampaign])
      .rpc();
    console.log("캠페인 종료 이후 기부 테스트용 캠페인 생성 완료");

    // 종료 시간 대기를 위해 5초 대기
    await new Promise((resolve) => setTimeout(resolve, 5000));
    console.log("캠페인 종료 후 기부 시도");

    // 후원자 PDA 생성
    const [postEndDonationPda] = await PublicKey.findProgramAddress(
      [
        Buffer.from("donation"),
        donor.publicKey.toBuffer(),
        postEndCampaign.publicKey.toBuffer(),
      ],
      program.programId
    );
    await program.methods
      .createDonationPda()
      .accounts({
        donation: postEndDonationPda,
        donor: donor.publicKey,
        campaign: postEndCampaign.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([donor])
      .rpc();

    // 캠페인 종료 후 기부 시도 (오류 발생해야 함)
    try {
      await program.methods
        .donate(new BN(1 * LAMPORTS_PER_SOL))
        .accounts({
          campaign: postEndCampaign.publicKey,
          donor: donor.publicKey,
          donation: postEndDonationPda,
          systemProgram: SystemProgram.programId,
        } as any)
        .signers([donor])
        .rpc();
      assert.fail("캠페인 종료 후 기부가 허용되면 안됨");
    } catch (err: any) {
      console.log("캠페인 종료 이후 기부 테스트 오류 발생:", err.error.errorMessage);
      assert.include(err.error.errorMessage, "already ended");
    }
  });

  // 4. 캠페인 생성 입력 검증 테스트 - 너무 긴 설명
  it("캠페인 생성 입력 검증 테스트 - 너무 긴 설명", async () => {
    // MAX_DESCRIPTION_LENGTH가 500이므로 501 길이의 문자열 생성
    const longDescription = "a".repeat(501);
    const invalidDescCampaign = Keypair.generate();
    const title = "Invalid Description Test";
    const goal = new BN(1 * LAMPORTS_PER_SOL);
    const donationAmount = new BN(1 * LAMPORTS_PER_SOL);
    const currentUnixTime = Math.floor(Date.now() / 1000);
    const endDate = new BN(currentUnixTime + 20);

    try {
      await program.methods
        .createCampaign(title, longDescription, goal, donationAmount, endDate)
        .accounts({
          campaign: invalidDescCampaign.publicKey,
          creator: creator.publicKey,
          foundation: foundation.publicKey,
          systemProgram: SystemProgram.programId,
        } as any)
        .signers([invalidDescCampaign])
        .rpc();
      assert.fail("너무 긴 설명의 캠페인이 생성되면 안됨");
    } catch (err: any) {
      console.log("너무 긴 설명 테스트 오류 발생:", err.error.errorMessage);
      assert.include(err.error.errorMessage, "description is too long");
    }
  });

  // 5. 캠페인 생성 입력 검증 테스트 - 잘못된 목표 금액
  it("캠페인 생성 입력 검증 테스트 - 잘못된 목표 금액", async () => {
    // donationAmount = 1 SOL, 목표는 1.5 SOL (1500000000 lamports)
    const invalidGoalCampaign = Keypair.generate();
    const title = "Invalid Goal Test";
    const description = "Goal amount is not divisible by donation amount.";
    const donationAmount = new BN(1 * LAMPORTS_PER_SOL);
    const goal = new BN(1500000000);
    const currentUnixTime = Math.floor(Date.now() / 1000);
    const endDate = new BN(currentUnixTime + 20);

    try {
      await program.methods
        .createCampaign(title, description, goal, donationAmount, endDate)
        .accounts({
          campaign: invalidGoalCampaign.publicKey,
          creator: creator.publicKey,
          foundation: foundation.publicKey,
          systemProgram: SystemProgram.programId,
        } as any)
        .signers([invalidGoalCampaign])
        .rpc();
      assert.fail("잘못된 목표 금액으로 캠페인이 생성되면 안됨");
    } catch (err: any) {
      console.log("잘못된 목표 금액 테스트 오류 발생:", err.error.errorMessage);
      assert.include(err.error.errorMessage, "Invalid goal amount");
    }
  });

  // 6. 환불 중복 요청 테스트
  it("환불 중복 요청 테스트", async () => {
    // 새로운 실패 캠페인 생성 (목표: 1 SOL, 후원: 0.5 SOL)
    const dupRefundCampaign = Keypair.generate();
    const title = "Duplicate Refund Test";
    const description = "Testing duplicate refund prevention.";
    const goal = new BN(1 * LAMPORTS_PER_SOL);
    const donationAmount = new BN(0.5 * LAMPORTS_PER_SOL);
    const currentUnixTime = Math.floor(Date.now() / 1000);
    const endDate = new BN(currentUnixTime + 5);
    await program.methods
      .createCampaign(title, description, goal, donationAmount, endDate)
      .accounts({
        campaign: dupRefundCampaign.publicKey,
        creator: creator.publicKey,
        foundation: foundation.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([dupRefundCampaign])
      .rpc();
    console.log("환불 중복 테스트용 캠페인 생성 완료");

    // 후원자 PDA 생성
    const [dupRefundDonationPda] = await PublicKey.findProgramAddress(
      [
        Buffer.from("donation"),
        donor.publicKey.toBuffer(),
        dupRefundCampaign.publicKey.toBuffer(),
      ],
      program.programId
    );
    await program.methods
      .createDonationPda()
      .accounts({
        donation: dupRefundDonationPda,
        donor: donor.publicKey,
        campaign: dupRefundCampaign.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([donor])
      .rpc();
    console.log("환불 중복 테스트용 후원자 PDA 생성 완료");

    // 0.5 SOL 기부
    await program.methods
      .donate(new BN(0.5 * LAMPORTS_PER_SOL))
      .accounts({
        campaign: dupRefundCampaign.publicKey,
        donor: donor.publicKey,
        donation: dupRefundDonationPda,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([donor])
      .rpc();
    console.log("환불 중복 테스트: 기부 완료");

    // 종료 대기를 위해 6초 대기 후 캠페인 종료
    await new Promise((resolve) => setTimeout(resolve, 6000));
    await program.methods
      .endCampaign()
      .accounts({
        campaign: dupRefundCampaign.publicKey,
        admin: creator.publicKey,
      } as any)
      .rpc();
    console.log("환불 중복 테스트: 캠페인 종료 완료");

    // 첫 번째 환불 요청
    await program.methods
      .refund()
      .accounts({
        campaign: dupRefundCampaign.publicKey,
        donation: dupRefundDonationPda,
        donor: donor.publicKey,
      } as any)
      .signers([donor])
      .rpc();
    console.log("첫 번째 환불 요청 완료");

    // 두 번째 환불 요청 시도 (이미 환불되어 금액 0, 실패해야 함)
    try {
      await program.methods
        .refund()
        .accounts({
          campaign: dupRefundCampaign.publicKey,
          donation: dupRefundDonationPda,
          donor: donor.publicKey,
        } as any)
        .signers([donor])
        .rpc();
      assert.fail("환불 중복 요청이 허용되면 안됨");
    } catch (err: any) {
      console.log("환불 중복 요청 테스트 오류 발생:", err.error.errorMessage);
      assert.include(err.error.errorMessage, "No funds available");
    }
  });

  // 7. 다중 기부자 테스트
  it("다중 기부자 테스트", async () => {
    // 새로운 캠페인 생성 (목표: 3 SOL, 후원: 1 SOL)
    const multiDonCampaign = Keypair.generate();
    const title = "Multiple Donors Test";
    const description = "Testing multiple donors donations.";
    const donationAmount = new BN(1 * LAMPORTS_PER_SOL);
    const goal = new BN(3 * LAMPORTS_PER_SOL);
    const currentUnixTime = Math.floor(Date.now() / 1000);
    const endDate = new BN(currentUnixTime + 20);
    await program.methods
      .createCampaign(title, description, goal, donationAmount, endDate)
      .accounts({
         campaign: multiDonCampaign.publicKey,
         creator: creator.publicKey,
         foundation: foundation.publicKey,
         systemProgram: SystemProgram.programId,
      } as any)
      .signers([multiDonCampaign])
      .rpc();
    console.log("다중 기부자 테스트용 캠페인 생성 완료");

    // 두 개의 새로운 기부자 계정 생성 및 SOL 확보
    const donorA = Keypair.generate();
    const donorB = Keypair.generate();
    await connection.requestAirdrop(donorA.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.requestAirdrop(donorB.publicKey, 2 * LAMPORTS_PER_SOL);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("다중 기부자 테스트: donorA:", donorA.publicKey.toString());
    console.log("다중 기부자 테스트: donorB:", donorB.publicKey.toString());

    // donorA: 후원자 PDA 생성 후 1 SOL 기부
    const [donationPdaA] = await PublicKey.findProgramAddress(
      [
        Buffer.from("donation"),
        donorA.publicKey.toBuffer(),
        multiDonCampaign.publicKey.toBuffer(),
      ],
      program.programId
    );
    await program.methods
      .createDonationPda()
      .accounts({
         donation: donationPdaA,
         donor: donorA.publicKey,
         campaign: multiDonCampaign.publicKey,
         systemProgram: SystemProgram.programId,
      } as any)
      .signers([donorA])
      .rpc();
    await program.methods
      .donate(new BN(1 * LAMPORTS_PER_SOL))
      .accounts({
         campaign: multiDonCampaign.publicKey,
         donor: donorA.publicKey,
         donation: donationPdaA,
         systemProgram: SystemProgram.programId,
      } as any)
      .signers([donorA])
      .rpc();
    console.log("다중 기부자 테스트: donorA 기부 완료");

    // donorB: 후원자 PDA 생성 후 1 SOL 기부
    const [donationPdaB] = await PublicKey.findProgramAddress(
      [
        Buffer.from("donation"),
        donorB.publicKey.toBuffer(),
        multiDonCampaign.publicKey.toBuffer(),
      ],
      program.programId
    );
    await program.methods
      .createDonationPda()
      .accounts({
         donation: donationPdaB,
         donor: donorB.publicKey,
         campaign: multiDonCampaign.publicKey,
         systemProgram: SystemProgram.programId,
      } as any)
      .signers([donorB])
      .rpc();
    await program.methods
      .donate(new BN(1 * LAMPORTS_PER_SOL))
      .accounts({
         campaign: multiDonCampaign.publicKey,
         donor: donorB.publicKey,
         donation: donationPdaB,
         systemProgram: SystemProgram.programId,
      } as any)
      .signers([donorB])
      .rpc();
    console.log("다중 기부자 테스트: donorB 기부 완료");

    // 총 기부액 확인: donorA + donorB = 2 SOL
    const multiCampaignAccount = await program.account.campaign.fetch(multiDonCampaign.publicKey);
    console.log("다중 기부자 테스트: 캠페인 상태:", multiCampaignAccount);
    assert.equal(multiCampaignAccount.raised.toString(), (1 * LAMPORTS_PER_SOL * 2).toString());
  });

  // 8. 권한 테스트 - withdraw unauthorized (잘못된 foundation 계정)
  it("권한 테스트 - withdraw unauthorized", async () => {
    // 성공 캠페인(campaignSuccessKeypair)을 사용하여, 올바르지 않은 재단(fakeFoundation)으로 withdraw 호출 시도
    const fakeFoundation = Keypair.generate();
    await connection.requestAirdrop(fakeFoundation.publicKey, 2 * LAMPORTS_PER_SOL);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    try {
      await program.methods
        .withdraw()
        .accounts({
          campaign: campaignSuccessKeypair.publicKey,
          foundation: fakeFoundation.publicKey, // 올바르지 않은 재단 계정 사용
        } as any)
        .rpc();
      assert.fail("Unauthorized withdraw should fail");
    } catch (err: any) {
      console.log("권한 테스트 - withdraw unauthorized 오류 발생:", err.error.errorMessage);
      // 에러 메시지가 constraint 관련 에러임을 확인 (문구에 "constraint was violated" 포함)
      assert.include(err.error.errorMessage, "constraint was violated");
    }
  });

  // 9. 권한 테스트 - refund unauthorized (잘못된 기부자)
  it("권한 테스트 - refund unauthorized", async () => {
    // 새로운 캠페인 생성 (환불 권한 테스트용)
    const unauthorizedCampaign = Keypair.generate();
    const title = "Unauthorized Refund Test";
    const description = "Testing refund with wrong donor.";
    const goal = new BN(1 * LAMPORTS_PER_SOL);
    const donationAmount = new BN(0.5 * LAMPORTS_PER_SOL);
    const currentUnixTime = Math.floor(Date.now() / 1000);
    const endDate = new BN(currentUnixTime + 5);
    await program.methods
      .createCampaign(title, description, goal, donationAmount, endDate)
      .accounts({
        campaign: unauthorizedCampaign.publicKey,
        creator: creator.publicKey,
        foundation: foundation.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([unauthorizedCampaign])
      .rpc();
    console.log("권한 테스트 - refund unauthorized용 캠페인 생성 완료");

    // donation PDA 생성 (정상 donor 사용)
    const [unauthDonationPda] = await PublicKey.findProgramAddress(
      [
        Buffer.from("donation"),
        donor.publicKey.toBuffer(),
        unauthorizedCampaign.publicKey.toBuffer(),
      ],
      program.programId
    );
    await program.methods
      .createDonationPda()
      .accounts({
        donation: unauthDonationPda,
        donor: donor.publicKey,
        campaign: unauthorizedCampaign.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([donor])
      .rpc();
    // 정상 donor가 0.5 SOL 기부
    await program.methods
      .donate(new BN(0.5 * LAMPORTS_PER_SOL))
      .accounts({
        campaign: unauthorizedCampaign.publicKey,
        donor: donor.publicKey,
        donation: unauthDonationPda,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([donor])
      .rpc();
    // 캠페인 종료 대기를 위해 6초 대기 후 종료 호출
    await new Promise((resolve) => setTimeout(resolve, 6000));
    await program.methods
      .endCampaign()
      .accounts({
        campaign: unauthorizedCampaign.publicKey,
        admin: creator.publicKey,
      } as any)
      .rpc();
    console.log("권한 테스트 - refund unauthorized: 캠페인 종료 완료");

    // 잘못된 기부자(wrongDonor) 사용하여 환불 시도
    const wrongDonor = Keypair.generate();
    await connection.requestAirdrop(wrongDonor.publicKey, 2 * LAMPORTS_PER_SOL);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    try {
      await program.methods
        .refund()
        .accounts({
          campaign: unauthorizedCampaign.publicKey,
          donation: unauthDonationPda,
          donor: wrongDonor.publicKey,
        } as any)
        .signers([wrongDonor])
        .rpc();
      assert.fail("Refund with wrong donor should fail");
    } catch (err: any) {
      console.log("권한 테스트 - refund unauthorized 오류 발생:", err.error.errorMessage);
      // 에러 메시지가 constraint 관련 에러임을 확인 (문구에 "constraint was violated" 포함)
      assert.include(err.error.errorMessage, "constraint was violated");
    }
  });
});
