import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  DailyRevenueAndFee,
  Leaderboard,
  WeeklyLeaderboard,
  WeeklyRevenueAndFee,
} from "../generated/schema";
import { ZERO } from "./config";

export function _loadOrCreateLeaderboardEntity(
  dayId: string,
  account: string
): Leaderboard {
  let referenceID = `${dayId}${account}`;
  let entity = Leaderboard.load(referenceID);
  if (entity == null) {
    entity = new Leaderboard(referenceID);
    entity.user = Address.fromString(account);
    entity.timestamp = dayId;
    entity.totalTrades = 0;
    entity.volume = ZERO;
    entity.netPnL = ZERO;
    entity.tradesWon = 0;
    entity.winRate = 0;
    entity.arbVolume = ZERO;
    entity.arbNetPnL = ZERO;
    entity.arbTotalTrades = 0;
    entity.arbTradesWon = 0;
    entity.arbWinRate = 0;
    entity.usdcVolume = ZERO;
    entity.usdcNetPnL = ZERO;
    entity.usdcTotalTrades = 0;
    entity.usdcTradesWon = 0;
    entity.usdcWinRate = 0;
    entity.bfrVolume = ZERO;
    entity.bfrNetPnL = ZERO;
    entity.bfrTotalTrades = 0;
    entity.bfrTradesWon = 0;
    entity.bfrWinRate = 0;
    entity.save();
  }
  return entity as Leaderboard;
}

export function _loadOrCreateWeeklyLeaderboardEntity(
  weekId: string,
  account: string
): WeeklyLeaderboard {
  let referenceID = `${weekId}${account}`;
  let entity = WeeklyLeaderboard.load(referenceID);
  if (entity == null) {
    entity = new WeeklyLeaderboard(referenceID);
    entity.user = Address.fromString(account);
    entity.timestamp = weekId;
    entity.totalTrades = 0;
    entity.volume = ZERO;
    entity.netPnL = ZERO;
    entity.tradesWon = 0;
    entity.winRate = 0;
    entity.arbVolume = ZERO;
    entity.arbNetPnL = ZERO;
    entity.arbTotalTrades = 0;
    entity.arbTradesWon = 0;
    entity.arbWinRate = 0;
    entity.usdcVolume = ZERO;
    entity.usdcNetPnL = ZERO;
    entity.usdcTotalTrades = 0;
    entity.usdcTradesWon = 0;
    entity.usdcWinRate = 0;
    entity.bfrVolume = ZERO;
    entity.bfrNetPnL = ZERO;
    entity.bfrTotalTrades = 0;
    entity.bfrTradesWon = 0;
    entity.bfrWinRate = 0;
    entity.save();
  }
  return entity as WeeklyLeaderboard;
}

export function _loadOrCreateDailyRevenueAndFee(
  id: string,
  timestamp: BigInt,
  tokenId: string
): DailyRevenueAndFee {
  let lookUpId = `${id}${tokenId}`;
  let entity = DailyRevenueAndFee.load(lookUpId);
  if (entity === null) {
    entity = new DailyRevenueAndFee(lookUpId);
    entity.totalFee = ZERO;
    entity.settlementFee = ZERO;
    entity.timestamp = timestamp;
    entity.dayId = id;
    entity.tokenId = tokenId;
    entity.save();
  }
  return entity as DailyRevenueAndFee;
}

export function _loadOrCreateWeeklyRevenueAndFee(
  id: string,
  timestamp: BigInt,
  tokenId: string
): WeeklyRevenueAndFee {
  let lookUpId = `${id}${tokenId}`;
  let entity = WeeklyRevenueAndFee.load(lookUpId);
  if (entity === null) {
    entity = new WeeklyRevenueAndFee(lookUpId);
    entity.totalFee = ZERO;
    entity.settlementFee = ZERO;
    entity.timestamp = timestamp;
    entity.weekId = id;
    entity.tokenId = tokenId;
    entity.save();
  }
  return entity as WeeklyRevenueAndFee;
}
