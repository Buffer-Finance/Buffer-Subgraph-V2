import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { _getHourId, _getDayId, _getWeekId } from "./helpers";
import { ZERO } from "./initialize";
import {
  updateOpenInterest,
  storeFees,
  logVolume,
  storePnl,
  storePnlPerContract,
  saveSettlementFeeDiscount,
} from "./stats";
import { updateDailyAndWeeklyRevenue, updateLeaderboards } from "./leaderboard";
import {
  logVolumeAndSettlementFeePerContract,
  updateDashboardOverviewStats,
  logOpenInterest,
} from "./dashboard";
import { convertARBToUSDC } from "./convertToUSDC";
import { updateOptionContractData } from "./core";
import { _loadOrCreateNetPnLPerPool } from "./initialize";

export function updateOpeningStats(
  token: string,
  timestamp: BigInt,
  totalFee: BigInt,
  settlementFee: BigInt,
  isAbove: boolean,
  contractAddress: Bytes,
  poolToken: string
): void {
  // Circuit Breaker
  let dailyNetPnLPerPool = _loadOrCreateNetPnLPerPool(
    contractAddress,
    _getDayId(timestamp),
    "daily"
  );
  let weeklyNetPnLPerPool = _loadOrCreateNetPnLPerPool(
    contractAddress,
    _getWeekId(timestamp),
    "weekly"
  );

  let blpFee = BigInt.fromI32(0);
  if (timestamp < BigInt.fromI32(1683664200)) {
    blpFee = settlementFee.times(BigInt.fromI32(55).div(BigInt.fromI32(100)));
  } else {
    blpFee = settlementFee.times(BigInt.fromI32(70).div(BigInt.fromI32(100)));
  }
  weeklyNetPnLPerPool.netPnL = weeklyNetPnLPerPool.netPnL.plus(blpFee);
  weeklyNetPnLPerPool.save();

  dailyNetPnLPerPool.netPnL = dailyNetPnLPerPool.netPnL.plus(blpFee);
  dailyNetPnLPerPool.save();

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
    storeFees(timestamp, settlementFee, ZERO, settlementFee);

    // Update daily & total volume
    logVolume(timestamp, totalFee, ZERO, totalFee);

    // Update daily & total open interest
    updateOpenInterest(timestamp, true, isAbove, totalFee);

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
    storeFees(timestamp, settlementFeeUSDC, settlementFeeUSDC, ZERO);

    // Update daily & total volume
    logVolume(timestamp, totalFeeUSDC, totalFeeUSDC, ZERO);

    // Update daily & total open interest
    updateOpenInterest(timestamp, true, isAbove, totalFeeUSDC);

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
  isAbove: boolean,
  user: Bytes,
  contractAddress: Bytes,
  isExercised: boolean,
  netPnL: BigInt,
  payout: BigInt
): void {
  // Circuit Breaker
  if (isExercised) {
    let dailyNetPnLPerPool = _loadOrCreateNetPnLPerPool(
      contractAddress,
      _getDayId(timestamp),
      "daily"
    );
    let weeklyNetPnLPerPool = _loadOrCreateNetPnLPerPool(
      contractAddress,
      _getWeekId(timestamp),
      "weekly"
    );
    dailyNetPnLPerPool.netPnL = dailyNetPnLPerPool.netPnL.minus(netPnL);
    weeklyNetPnLPerPool.netPnL = weeklyNetPnLPerPool.netPnL.minus(netPnL);

    dailyNetPnLPerPool.save();
    weeklyNetPnLPerPool.save();
  }

  if (token == "USDC") {
    // Update daily & total open interest
    updateOpenInterest(timestamp, false, isAbove, totalFee);
    // Update daily & total PnL for stats page
    storePnl(
      timestamp,
      totalFee.minus(settlementFee),
      isExercised,
      totalFee.minus(settlementFee),
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
      netPnL
    );
    updateOptionContractData(
      false,
      isAbove,
      totalFee,
      Address.fromBytes(contractAddress)
    );
    logOpenInterest(token, totalFee, false);
    logOpenInterest("total", totalFee, false);
  } else if (token == "ARB") {
    let totalFeeUSDC = convertARBToUSDC(totalFee);
    let settlementFeeUSDC = convertARBToUSDC(settlementFee);
    let netPnLUSDC = convertARBToUSDC(netPnL);

    // Update daily & total open interest
    updateOpenInterest(timestamp, false, isAbove, totalFeeUSDC);
    // Update daily & total PnL for stats page
    storePnl(
      timestamp,
      totalFeeUSDC.minus(settlementFeeUSDC),
      isExercised,
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
      totalFee,
      true,
      ZERO,
      false,
      netPnLUSDC,
      netPnL,
      ZERO
    );
    updateOptionContractData(
      false,
      isAbove,
      totalFee,
      Address.fromBytes(contractAddress)
    );
    logOpenInterest(token, totalFee, false);
    logOpenInterest("total", totalFeeUSDC, false);
  }
}
