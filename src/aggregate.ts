import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
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
  storeDefillamaFees,
  storeFees,
  storePnl,
  storePnlPerContract,
  updateOpenInterest,
} from "./stats";

export function updateOpeningStats(
  token: string,
  timestamp: BigInt,
  totalFee: BigInt,
  settlementFee: BigInt,
  contractAddress: Bytes,
  poolToken: string
): void {
  if (token == "USDC") {
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
    storeDefillamaFees(timestamp, settlementFee);

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
    storeDefillamaFees(timestamp, settlementFeeUSDC);

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
    storeDefillamaFees(timestamp, settlementFeeUSDC);

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

export function updateClosingStats(
  token: string,
  timestamp: BigInt,
  totalFee: BigInt,
  settlementFee: BigInt,
  user: Bytes,
  contractAddress: Bytes,
  isExercised: boolean,
  netPnL: BigInt,
  leaderboardPnl: BigInt,
  isWintradeLeaderboard: boolean
): void {
  if (token == "USDC") {
    // Update daily & total open interest
    updateOpenInterest(timestamp, false, totalFee);
    // Update daily & total PnL for stats page
    storePnl(timestamp, netPnL, isExercised, netPnL, ZERO, ZERO);
    // Update daily & total PnL per contracts for stats page
    storePnlPerContract(timestamp, netPnL, isExercised, contractAddress);
    // Update Leaderboards
    updateLeaderboards(
      totalFee,
      timestamp,
      user,
      isWintradeLeaderboard,
      ZERO,
      false,
      totalFee,
      true,
      leaderboardPnl,
      ZERO,
      leaderboardPnl,
      ZERO,
      false,
      ZERO
    );
    updateOptionContractData(
      false,
      totalFee,
      Address.fromBytes(contractAddress)
    );
    logOpenInterest(token, totalFee, false);
    logOpenInterest("total", totalFee, false);
  } else if (token == "ARB") {
    let totalFeeUSDC = convertARBToUSDC(totalFee);
    let settlementFeeUSDC = convertARBToUSDC(settlementFee);
    let leaderboardPnlUSDC = convertARBToUSDC(leaderboardPnl);
    const netPnLUSDC = convertARBToUSDC(netPnL);

    // Update daily & total open interest
    updateOpenInterest(timestamp, false, totalFeeUSDC);
    // Update daily & total PnL for stats page
    storePnl(timestamp, netPnLUSDC, isExercised, ZERO, netPnLUSDC, ZERO);
    // Update daily & total PnL per contracts for stats page
    storePnlPerContract(timestamp, netPnLUSDC, isExercised, contractAddress);
    // Update Leaderboards
    updateLeaderboards(
      totalFeeUSDC,
      timestamp,
      user,
      isWintradeLeaderboard,
      totalFee,
      true,
      ZERO,
      false,
      leaderboardPnlUSDC,
      leaderboardPnl,
      ZERO,
      ZERO,
      false,
      ZERO
    );
    updateOptionContractData(
      false,
      totalFee,
      Address.fromBytes(contractAddress)
    );
    logOpenInterest(token, totalFee, false);
    logOpenInterest("total", totalFeeUSDC, false);
  } else if (token == "BFR") {
    let totalFeeUSDC = convertBFRToUSDC(totalFee);
    let settlementFeeUSDC = convertBFRToUSDC(settlementFee);
    let leaderboardPnlUSDC = convertBFRToUSDC(leaderboardPnl);
    const netPnLUSDC = convertBFRToUSDC(netPnL);

    // Update daily & total open interest
    updateOpenInterest(timestamp, false, totalFeeUSDC);
    // Update daily & total PnL for stats page
    storePnl(timestamp, netPnLUSDC, isExercised, ZERO, ZERO, netPnLUSDC);
    // Update daily & total PnL per contracts for stats page
    storePnlPerContract(timestamp, netPnLUSDC, isExercised, contractAddress);
    // Update Leaderboards
    updateLeaderboards(
      totalFeeUSDC,
      timestamp,
      user,
      isWintradeLeaderboard,
      ZERO,
      false,
      ZERO,
      false,
      leaderboardPnlUSDC,
      ZERO,
      ZERO,
      leaderboardPnl,
      true,
      totalFee
    );
    updateOptionContractData(
      false,
      totalFee,
      Address.fromBytes(contractAddress)
    );
    logOpenInterest(token, totalFee, false);
    logOpenInterest("total", totalFeeUSDC, false);
  }
}
