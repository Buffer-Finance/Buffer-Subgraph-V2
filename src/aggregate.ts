import { BigInt } from "@graphprotocol/graph-ts";
import { convertARBToUSDC, convertBFRToUSDC } from "./convertToUSDC";
import { updateOptionContractData } from "./core";
import {
  logOpenInterest,
  logVolumeAndSettlementFeePerContract,
  updateDashboardOverviewStats,
} from "./dashboard";
import { _getHourId } from "./helpers";
import { ZERO } from "./initialize";
import { updateDailyAndWeeklyRevenue, updateLeaderboards } from "./leaderboard";
import {
  logVolume,
  saveSettlementFeeDiscount,
  storeFees,
  storePnl,
  storePnlPerContract,
  updateOpenInterest,
} from "./stats";
import {
  updateTradeClosingStatsForUser,
  updateTradeOpenStatsForUser,
} from "./userStats";

export function updateOpeningStats(
  token: string,
  timestamp: BigInt,
  totalFee: BigInt,
  settlementFee: BigInt,
  contractAddress: string,
  poolToken: string,
  userAddress: string
): void {
  // updateUserTotalStat(userAddress, userAddress, contractAddress, token);

  if (token == "USDC") {
    updateTradeOpenStatsForUser(
      totalFee,
      totalFee,
      userAddress,
      contractAddress,
      token
    );

    // Dashboard Page - overview
    updateDashboardOverviewStats(totalFee, settlementFee, poolToken);
    updateDashboardOverviewStats(totalFee, settlementFee, "total");

    // Update daily and weekly volume and fees
    updateDailyAndWeeklyRevenue(totalFee, timestamp, settlementFee, "total");
    updateDailyAndWeeklyRevenue(totalFee, timestamp, settlementFee, token);

    // Dashboard Page - markets table
    logVolumeAndSettlementFeePerContract(
      _getHourId(timestamp),
      "hourly",
      timestamp,
      contractAddress,
      token,
      totalFee,
      settlementFee
    );
    logVolumeAndSettlementFeePerContract(
      _getHourId(timestamp),
      "hourly",
      timestamp,
      contractAddress,
      "total",
      totalFee,
      settlementFee
    );

    // Update daily & total fees
    storeFees(timestamp, settlementFee, ZERO, settlementFee, ZERO);

    // Update daily & total volume
    logVolume(timestamp, totalFee, ZERO, totalFee, ZERO);

    // Update daily & total open interest
    updateOpenInterest(timestamp, true, totalFee);

    // Updates referral & NFT discounts tracking
    saveSettlementFeeDiscount(timestamp, totalFee, settlementFee);

    logOpenInterest(token, totalFee, true);
    logOpenInterest("total", totalFee, true);
  } else if (token == "ARB") {
    let totalFeeUSDC = convertARBToUSDC(totalFee);
    let settlementFeeUSDC = convertARBToUSDC(settlementFee);

    updateTradeOpenStatsForUser(
      totalFee,
      totalFeeUSDC,
      userAddress,
      contractAddress,
      token
    );

    // Dashboard Page - overview
    updateDashboardOverviewStats(totalFee, settlementFee, poolToken);
    updateDashboardOverviewStats(totalFeeUSDC, settlementFeeUSDC, "total");

    // Update daily and weekly volume and fees
    updateDailyAndWeeklyRevenue(
      totalFeeUSDC,
      timestamp,
      settlementFeeUSDC,
      "total"
    );
    updateDailyAndWeeklyRevenue(totalFee, timestamp, settlementFee, token);

    // Dashboard Page - markets table
    logVolumeAndSettlementFeePerContract(
      _getHourId(timestamp),
      "hourly",
      timestamp,
      contractAddress,
      token,
      totalFee,
      settlementFee
    );
    // Dashboard Page - markets table
    logVolumeAndSettlementFeePerContract(
      _getHourId(timestamp),
      "hourly",
      timestamp,
      contractAddress,
      "total",
      totalFeeUSDC,
      settlementFeeUSDC
    );

    // Update daily & total fees
    storeFees(timestamp, settlementFeeUSDC, settlementFeeUSDC, ZERO, ZERO);

    // Update daily & total volume
    logVolume(timestamp, totalFeeUSDC, totalFeeUSDC, ZERO, ZERO);

    // Update daily & total open interest
    updateOpenInterest(timestamp, true, totalFeeUSDC);

    // Updates referral & NFT discounts tracking
    saveSettlementFeeDiscount(timestamp, totalFeeUSDC, settlementFeeUSDC);

    logOpenInterest(token, totalFee, true);
    logOpenInterest("total", totalFeeUSDC, true);
  } else if (token == "BFR") {
    let totalFeeUSDC = convertBFRToUSDC(totalFee);
    let settlementFeeUSDC = convertBFRToUSDC(settlementFee);

    updateTradeOpenStatsForUser(
      totalFee,
      totalFeeUSDC,
      userAddress,
      contractAddress,
      token
    );

    // Dashboard Page - overview
    updateDashboardOverviewStats(totalFee, settlementFee, poolToken);
    updateDashboardOverviewStats(totalFeeUSDC, settlementFeeUSDC, "total");

    // Update daily and weekly volume and fees
    updateDailyAndWeeklyRevenue(
      totalFeeUSDC,
      timestamp,
      settlementFeeUSDC,
      "total"
    );
    updateDailyAndWeeklyRevenue(totalFee, timestamp, settlementFee, token);

    // Dashboard Page - markets table
    logVolumeAndSettlementFeePerContract(
      _getHourId(timestamp),
      "hourly",
      timestamp,
      contractAddress,
      token,
      totalFee,
      settlementFee
    );
    // Dashboard Page - markets table
    logVolumeAndSettlementFeePerContract(
      _getHourId(timestamp),
      "hourly",
      timestamp,
      contractAddress,
      "total",
      totalFeeUSDC,
      settlementFeeUSDC
    );

    // Update daily & total fees
    storeFees(timestamp, settlementFeeUSDC, ZERO, ZERO, settlementFeeUSDC);

    // Update daily & total volume
    logVolume(timestamp, totalFeeUSDC, ZERO, ZERO, totalFeeUSDC);

    // Update daily & total open interest
    updateOpenInterest(timestamp, true, totalFeeUSDC);

    // Updates referral & NFT discounts tracking
    saveSettlementFeeDiscount(timestamp, totalFeeUSDC, settlementFeeUSDC);

    logOpenInterest(token, totalFee, true);
    logOpenInterest("total", totalFeeUSDC, true);
  }
}

export function updateClosingStatsV2(
  token: string,
  timestamp: BigInt,
  totalFee: BigInt,
  user: string,
  isExercised: boolean,
  netPnL: BigInt,
  contractAddress: string,
  payout: BigInt
): void {
  let positiveNetPnl = netPnL;
  if (netPnL.lt(ZERO)) {
    positiveNetPnl = ZERO.minus(netPnL);
  }
  if (token == "USDC") {
    updateTradeClosingStatsForUser(
      user,
      totalFee,
      payout,
      payout,
      netPnL,
      netPnL,
      isExercised && netPnL.gt(ZERO),
      contractAddress,
      token
    );

    // Update daily & total open interest
    updateOpenInterest(timestamp, false, totalFee);

    // Update Leaderboards
    updateLeaderboards(
      totalFee,
      timestamp,
      user,
      isExercised && netPnL.gt(ZERO),
      ZERO,
      false,
      totalFee,
      true,
      positiveNetPnl,
      ZERO,
      positiveNetPnl,
      ZERO,
      false,
      ZERO
    );

    updateOptionContractData(false, totalFee, contractAddress);
    logOpenInterest(token, totalFee, false);
    logOpenInterest("total", totalFee, false);
  } else if (token == "ARB") {
    let totalFeeUSDC = convertARBToUSDC(totalFee);
    let positiveNetPnlUSDC = convertARBToUSDC(positiveNetPnl);
    const payoutUSDC = convertARBToUSDC(payout);

    updateTradeClosingStatsForUser(
      user,
      totalFee,
      payout,
      payoutUSDC,
      netPnL,
      positiveNetPnlUSDC,
      isExercised && netPnL.gt(ZERO),
      contractAddress,
      token
    );
    // Update daily & total open interest
    updateOpenInterest(timestamp, false, totalFeeUSDC);

    // Update Leaderboards
    updateLeaderboards(
      totalFeeUSDC,
      timestamp,
      user,
      isExercised && netPnL.gt(ZERO),
      totalFee,
      true,
      ZERO,
      false,
      positiveNetPnlUSDC,
      positiveNetPnl,
      ZERO,
      ZERO,
      false,
      ZERO
    );

    updateOptionContractData(false, totalFee, contractAddress);
    logOpenInterest(token, totalFee, false);
    logOpenInterest("total", totalFeeUSDC, false);
  } else if (token == "BFR") {
    let totalFeeUSDC = convertBFRToUSDC(totalFee);
    let positiveNetPnlUSDC = convertARBToUSDC(positiveNetPnl);
    const payoutUSDC = convertARBToUSDC(payout);

    updateTradeClosingStatsForUser(
      user,
      totalFee,
      payout,
      payoutUSDC,
      netPnL,
      positiveNetPnlUSDC,
      isExercised && netPnL.gt(ZERO),
      contractAddress,
      token
    );
    // Update daily & total open interest
    updateOpenInterest(timestamp, false, totalFeeUSDC);

    // Update Leaderboards
    updateLeaderboards(
      totalFeeUSDC,
      timestamp,
      user,
      isExercised && netPnL.gt(ZERO),
      ZERO,
      false,
      ZERO,
      false,
      positiveNetPnlUSDC,
      ZERO,
      ZERO,
      positiveNetPnl,
      true,
      totalFee
    );

    updateOptionContractData(false, totalFee, contractAddress);
    logOpenInterest(token, totalFee, false);
    logOpenInterest("total", totalFeeUSDC, false);
  }
}

export function updateLpProfitAndLoss(
  token: string,
  timestamp: BigInt,
  contractAddress: string,
  isExercised: boolean,
  netPnL: BigInt
): void {
  if (token == "USDC") {
    // Update daily & total PnL for stats page
    storePnl(timestamp, netPnL, isExercised, netPnL, ZERO, ZERO);
    // Update daily & total PnL per contracts for stats page
    storePnlPerContract(timestamp, netPnL, isExercised, contractAddress);
  } else if (token == "ARB") {
    let netPnLUSDC = convertARBToUSDC(netPnL);

    // Update daily & total PnL for stats page
    storePnl(timestamp, netPnLUSDC, isExercised, ZERO, netPnLUSDC, ZERO);
    // Update daily & total PnL per contracts for stats page
    storePnlPerContract(timestamp, netPnLUSDC, isExercised, contractAddress);
  } else if (token == "BFR") {
    let netPnLUSDC = convertBFRToUSDC(netPnL);

    // Update daily & total PnL for stats page
    storePnl(timestamp, netPnLUSDC, isExercised, ZERO, ZERO, netPnLUSDC);
    // Update daily & total PnL per contracts for stats page
    storePnlPerContract(timestamp, netPnLUSDC, isExercised, contractAddress);
  }
}

export function updateClosingStats(
  token: string,
  timestamp: BigInt,
  totalFee: BigInt,
  settlementFee: BigInt,
  user: string,
  contractAddress: string,
  isExercised: boolean,
  netPnL: BigInt,
  payout: BigInt
): void {
  if (token == "USDC") {
    updateTradeClosingStatsForUser(
      user,
      totalFee,
      payout,
      payout,
      netPnL,
      netPnL,
      isExercised,
      contractAddress,
      token
    );
    // Update daily & total open interest
    updateOpenInterest(timestamp, false, totalFee);
    // Update daily & total PnL for stats page
    storePnl(
      timestamp,
      totalFee.minus(settlementFee),
      isExercised,
      totalFee.minus(settlementFee),
      ZERO,
      ZERO
    );
    // Update daily & total PnL per contracts for stats page
    storePnlPerContract(
      timestamp,
      totalFee.minus(settlementFee),
      isExercised,
      contractAddress
    );
    // Update Leaderboards
    updateLeaderboards(
      totalFee,
      timestamp,
      user,
      isExercised,
      ZERO,
      false,
      totalFee,
      true,
      netPnL,
      ZERO,
      netPnL,
      ZERO,
      false,
      ZERO
    );
    updateOptionContractData(false, totalFee, contractAddress);
    logOpenInterest(token, totalFee, false);
    logOpenInterest("total", totalFee, false);
  } else if (token == "ARB") {
    const totalFeeUSDC = convertARBToUSDC(totalFee);
    const settlementFeeUSDC = convertARBToUSDC(settlementFee);
    const netPnLUSDC = convertARBToUSDC(netPnL);
    const payoutUSDC = convertARBToUSDC(payout);

    updateTradeClosingStatsForUser(
      user,
      totalFee,
      payout,
      payoutUSDC,
      netPnL,
      netPnLUSDC,
      isExercised,
      contractAddress,
      token
    );
    // Update daily & total open interest
    updateOpenInterest(timestamp, false, totalFeeUSDC);
    // Update daily & total PnL for stats page
    storePnl(
      timestamp,
      totalFeeUSDC.minus(settlementFeeUSDC),
      isExercised,
      ZERO,
      totalFeeUSDC.minus(settlementFeeUSDC),
      ZERO
    );
    // Update daily & total PnL per contracts for stats page
    storePnlPerContract(
      timestamp,
      totalFeeUSDC.minus(settlementFeeUSDC),
      isExercised,
      contractAddress
    );
    // Update Leaderboards
    updateLeaderboards(
      totalFeeUSDC,
      timestamp,
      user,
      isExercised,
      totalFee,
      true,
      ZERO,
      false,
      netPnLUSDC,
      netPnL,
      ZERO,
      ZERO,
      false,
      ZERO
    );
    updateOptionContractData(false, totalFee, contractAddress);
    logOpenInterest(token, totalFee, false);
    logOpenInterest("total", totalFeeUSDC, false);
  } else if (token == "BFR") {
    let totalFeeUSDC = convertBFRToUSDC(totalFee);
    let settlementFeeUSDC = convertBFRToUSDC(settlementFee);
    let netPnLUSDC = convertBFRToUSDC(netPnL);
    const payoutUSDC = convertARBToUSDC(payout);

    updateTradeClosingStatsForUser(
      user,
      totalFee,
      payout,
      payoutUSDC,
      netPnL,
      netPnLUSDC,
      isExercised,
      contractAddress,
      token
    );

    // Update daily & total open interest
    updateOpenInterest(timestamp, false, totalFeeUSDC);
    // Update daily & total PnL for stats page
    storePnl(
      timestamp,
      totalFeeUSDC.minus(settlementFeeUSDC),
      isExercised,
      ZERO,
      ZERO,
      totalFeeUSDC.minus(settlementFeeUSDC)
    );
    // Update daily & total PnL per contracts for stats page
    storePnlPerContract(
      timestamp,
      totalFeeUSDC.minus(settlementFeeUSDC),
      isExercised,
      contractAddress
    );
    // Update Leaderboards
    updateLeaderboards(
      totalFeeUSDC,
      timestamp,
      user,
      isExercised,
      ZERO,
      false,
      ZERO,
      false,
      netPnLUSDC,
      ZERO,
      ZERO,
      netPnL,
      true,
      totalFee
    );
    updateOptionContractData(false, totalFee, contractAddress);
    logOpenInterest(token, totalFee, false);
    logOpenInterest("total", totalFeeUSDC, false);
  }
}
