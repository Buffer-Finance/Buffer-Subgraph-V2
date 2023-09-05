import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { _getDayId, _getLeaderboardWeekId } from "./helpers";
import {
  _loadOrCreateDailyRevenueAndFee,
  _loadOrCreateLeaderboardEntity,
  _loadOrCreateWeeklyLeaderboardEntity,
  _loadOrCreateWeeklyRevenueAndFee,
} from "./initialize";

//To update the current leaderboard : Daily & Weekly
export function updateLeaderboards(
  totalFee: BigInt,
  timestamp: BigInt,
  user: Bytes,
  isExercised: boolean,
  arbVolume: BigInt,
  isARB: boolean,
  usdcVolume: BigInt,
  isUSDC: boolean,
  netPnL: BigInt,
  arbNetPnL: BigInt,
  usdcNetPnL: BigInt,
  bfrNetPnL: BigInt,
  isBFR: boolean,
  bfrVolume: BigInt
): void {
  _updateDailyLeaderboard(
    totalFee,
    timestamp,
    user,
    isExercised,
    arbVolume,
    isUSDC,
    usdcVolume,
    isARB,
    netPnL,
    arbNetPnL,
    usdcNetPnL,
    bfrNetPnL,
    isBFR,
    bfrVolume
  );
  _updateWeeklyLeaderboard(
    totalFee,
    timestamp,
    user,
    isExercised,
    arbVolume,
    isUSDC,
    usdcVolume,
    isARB,
    netPnL,
    arbNetPnL,
    usdcNetPnL,
    bfrNetPnL,
    isBFR,
    bfrVolume
  );
}

//To calculate Reward Pool for leaderboards
export function updateDailyAndWeeklyRevenue(
  totalFee: BigInt,
  timestamp: BigInt,
  settlementFee: BigInt,
  token: string
): void {
  // Daily
  let dailyRevenueAndFee = _loadOrCreateDailyRevenueAndFee(
    _getDayId(timestamp),
    timestamp,
    token
  );
  dailyRevenueAndFee.totalFee = dailyRevenueAndFee.totalFee.plus(totalFee);
  dailyRevenueAndFee.settlementFee =
    dailyRevenueAndFee.settlementFee.plus(settlementFee);
  dailyRevenueAndFee.save();

  // Weekly
  let weeklyFeeAndRevenue = _loadOrCreateWeeklyRevenueAndFee(
    _getLeaderboardWeekId(timestamp),
    timestamp,
    token
  );
  weeklyFeeAndRevenue.totalFee = weeklyFeeAndRevenue.totalFee.plus(totalFee);
  weeklyFeeAndRevenue.settlementFee =
    weeklyFeeAndRevenue.settlementFee.plus(settlementFee);
  weeklyFeeAndRevenue.save();
}

function _updateDailyLeaderboard(
  totalFee: BigInt,
  timestamp: BigInt,
  user: Bytes,
  isExercised: boolean,
  arbVolume: BigInt,
  isUSDC: boolean,
  usdcVolume: BigInt,
  isARB: boolean,
  netPnL: BigInt,
  arbNetPnL: BigInt,
  usdcNetPnL: BigInt,
  bfrNetPnL: BigInt,
  isBFR: boolean,
  bfrVolume: BigInt
): void {
  let entity = _loadOrCreateLeaderboardEntity(_getDayId(timestamp), user);
  entity.volume = entity.volume.plus(totalFee);
  entity.totalTrades += 1;
  entity.netPnL = isExercised
    ? entity.netPnL.plus(netPnL)
    : entity.netPnL.minus(netPnL);
  if (isExercised) {
    entity.tradesWon += 1;
  }
  entity.winRate = (entity.tradesWon * 100000) / entity.totalTrades;

  entity.arbVolume = entity.arbVolume.plus(arbVolume);

  entity.bfrVolume = entity.bfrVolume.plus(bfrVolume);

  entity.arbNetPnL = isExercised
    ? entity.arbNetPnL.plus(arbNetPnL)
    : entity.arbNetPnL.minus(arbNetPnL);

  entity.bfrNetPnL = isExercised
    ? entity.bfrNetPnL.plus(bfrNetPnL)
    : entity.bfrNetPnL.minus(bfrNetPnL);

  let arbTotalTrades = isARB ? 1 : 0;
  let bfrTotalTrades = isBFR ? 1 : 0;

  entity.arbTotalTrades += arbTotalTrades;
  entity.bfrTotalTrades += bfrTotalTrades;

  entity.arbTradesWon += isExercised ? arbTotalTrades : 0;
  entity.bfrTradesWon += isExercised ? bfrTotalTrades : 0;

  if (entity.arbTotalTrades > 0) {
    entity.arbWinRate = (entity.arbTradesWon * 100000) / entity.arbTotalTrades;
  }

  if (entity.bfrTotalTrades > 0) {
    entity.bfrWinRate = (entity.bfrTradesWon * 100000) / entity.bfrTotalTrades;
  }

  entity.usdcVolume = entity.usdcVolume.plus(usdcVolume);
  entity.usdcNetPnL = isExercised
    ? entity.usdcNetPnL.plus(usdcNetPnL)
    : entity.usdcNetPnL.minus(usdcNetPnL);
  let usdcTotalTrades = isUSDC ? 1 : 0;
  entity.usdcTotalTrades += usdcTotalTrades;
  entity.usdcTradesWon += isExercised ? usdcTotalTrades : 0;
  if (entity.usdcTotalTrades > 0) {
    entity.usdcWinRate =
      (entity.usdcTradesWon * 100000) / entity.usdcTotalTrades;
  }
  entity.save();
}

function _updateWeeklyLeaderboard(
  totalFee: BigInt,
  timestamp: BigInt,
  user: Bytes,
  isExercised: boolean,
  arbVolume: BigInt,
  isUSDC: boolean,
  usdcVolume: BigInt,
  isARB: boolean,
  netPnL: BigInt,
  arbNetPnL: BigInt,
  usdcNetPnL: BigInt,
  bfrNetPnL: BigInt,
  isBFR: boolean,
  bfrVolume: BigInt
): void {
  let entity = _loadOrCreateWeeklyLeaderboardEntity(
    _getLeaderboardWeekId(timestamp),
    user
  );
  entity.volume = entity.volume.plus(totalFee);
  entity.totalTrades += 1;
  entity.netPnL = isExercised
    ? entity.netPnL.plus(netPnL)
    : entity.netPnL.minus(netPnL);
  if (isExercised) {
    entity.tradesWon += 1;
  }
  entity.winRate = (entity.tradesWon * 100000) / entity.totalTrades;

  entity.arbVolume = entity.arbVolume.plus(arbVolume);

  entity.bfrVolume = entity.bfrVolume.plus(bfrVolume);

  entity.arbNetPnL = isExercised
    ? entity.arbNetPnL.plus(arbNetPnL)
    : entity.arbNetPnL.minus(arbNetPnL);

  entity.bfrNetPnL = isExercised
    ? entity.bfrNetPnL.plus(bfrNetPnL)
    : entity.bfrNetPnL.minus(bfrNetPnL);

  let arbTotalTrades = isARB ? 1 : 0;
  let bfrTotalTrades = isBFR ? 1 : 0;

  entity.arbTotalTrades += arbTotalTrades;
  entity.bfrTotalTrades += bfrTotalTrades;

  entity.arbTradesWon += isExercised ? arbTotalTrades : 0;
  entity.bfrTradesWon += isExercised ? bfrTotalTrades : 0;

  if (entity.arbTotalTrades > 0) {
    entity.arbWinRate = (entity.arbTradesWon * 100000) / entity.arbTotalTrades;
  }

  if (entity.bfrTotalTrades > 0) {
    entity.bfrWinRate = (entity.bfrTradesWon * 100000) / entity.bfrTotalTrades;
  }

  entity.usdcVolume = entity.usdcVolume.plus(usdcVolume);
  entity.usdcNetPnL = isExercised
    ? entity.usdcNetPnL.plus(usdcNetPnL)
    : entity.usdcNetPnL.minus(usdcNetPnL);
  let usdcTotalTrades = isUSDC ? 1 : 0;
  entity.usdcTotalTrades += usdcTotalTrades;
  entity.usdcTradesWon += isExercised ? usdcTotalTrades : 0;
  if (entity.usdcTotalTrades > 0) {
    entity.usdcWinRate =
      (entity.usdcTradesWon * 100000) / entity.usdcTotalTrades;
  }
  entity.save();
}
