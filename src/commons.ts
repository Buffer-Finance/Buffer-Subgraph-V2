import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  DailyLeaderboard,
  LastWeekLeaderboard,
  OptionContract,
  TotalData,
  Trade,
  WeeklyLeaderboard,
} from "../generated/schema";
import {
  ARB_POOL_CONTRACT,
  BFR_POOL_CONTRACT,
  ONE,
  USDC_POOL_CONTRACT,
  ZERO,
} from "./config";
import { convertARBToUSDC, convertBFRToUSDC } from "./convertToUSDC";
import { _getDayId, _getLeaderboardWeekId } from "./helpers";

export function checkTimeThreshold(blockTimestamp: BigInt): boolean {
  const threshold = BigInt.fromI32(1710743400);
  return blockTimestamp.gt(threshold);
}

export function registerAmarket(
  targetContract: Bytes,
  routerAddress: Bytes
): void {
  const market = OptionContract.load(targetContract.toHexString());
  if (market == null) {
    const market = new OptionContract(
      targetContract.toHexString().toLowerCase()
    );
    market.address = targetContract;
    market.routerContract = routerAddress;
    market.pool = "UNKNOWN";
    market.save();
  }
}

export function isRegisteredToV2Router(targetContract: Bytes): boolean {
  const market = OptionContract.load(targetContract.toHexString());
  if (market) {
    return (
      market.routerContract ==
      Address.fromString("0x0511b76254e86A4E6c94a86725CdfF0E7A8B4326")
    );
  }
  return false;
}

export function isRegisteredTOABRouter(targetContract: Bytes): boolean {
  const market = OptionContract.load(targetContract.toHexString());
  if (market) {
    return (
      market.routerContract ==
      Address.fromString("0xA747eeE75fF4a917c6c822C7b7815cdd28c37974")
    );
  }
  return false;
}

export function getPoolNameFromAddress(poolAddress: Bytes): string {
  // convert switch case into if else ladder
  if (poolAddress == Address.fromString(USDC_POOL_CONTRACT)) {
    return "USDC";
  } else if (poolAddress == Address.fromString(ARB_POOL_CONTRACT)) {
    return "ARB";
  } else if (poolAddress == Address.fromString(BFR_POOL_CONTRACT)) {
    return "BFR";
  } else {
    return "NOPE";
  }
}

export function updateAMarket(
  market: OptionContract,
  poolAddress: Bytes
): void {
  market.pool = getPoolNameFromAddress(poolAddress);
  market.save();
}

function convertToUSD(payoutInToken: BigInt, depositToken: string): BigInt {
  if (depositToken == "USDC") {
    return payoutInToken;
  } else if (depositToken == "ARB") {
    return convertARBToUSDC(payoutInToken);
  } else if (depositToken == "BFR") {
    return convertBFRToUSDC(payoutInToken);
  }
  return payoutInToken;
}

export function _createOrUpdateLeaderBoards(
  timestamp: BigInt,
  userAddress: Bytes,
  volume: BigInt,
  depositToken: string,
  winAmount: BigInt
): void {
  _createOrUpdateTotalData(timestamp, volume, depositToken);
  const dayId = _getDayId(timestamp);

  const id = dayId + userAddress.toHexString();
  let arbVolume = ZERO;
  let bfrVolume = ZERO;
  let usdcVolume = ZERO;
  let usdcTrades = ZERO;
  let arbTrades = ZERO;
  let bfrTrades = ZERO;
  let arbPnl = ZERO;
  let bfrPnl = ZERO;
  let usdcPnl = ZERO;
  let usdcTradesWon = ZERO;
  let arbTradesWon = ZERO;
  let bfrTradesWon = ZERO;
  let totalVolume = ZERO;
  let totalPnl = ZERO;
  let totalTrades = ONE;

  if (depositToken == "USDC") {
    usdcVolume = volume;
    usdcTrades = ONE;
    totalVolume = volume;
    usdcPnl = winAmount;
    totalPnl = winAmount;
    if (winAmount > ZERO) {
      usdcTradesWon = ONE;
    }
  } else if (depositToken == "ARB") {
    arbVolume = volume;
    arbTrades = ONE;
    totalVolume = convertToUSD(volume, "ARB");
    arbPnl = winAmount;
    totalPnl = convertToUSD(winAmount, "ARB");
    if (winAmount > ZERO) {
      arbTradesWon = ONE;
    }
  } else if (depositToken == "BFR") {
    bfrVolume = volume;
    bfrTrades = ONE;
    totalVolume = convertToUSD(volume, "BFR");
    bfrPnl = winAmount;
    totalPnl = convertToUSD(winAmount, "BFR");
    if (winAmount > ZERO) {
      bfrTradesWon = ONE;
    }
  }

  let dailyLeaderboard = DailyLeaderboard.load(id);

  const weekId = _getLeaderboardWeekId(timestamp);
  const lastWeekId = _getLeaderboardWeekId(
    timestamp.minus(BigInt.fromI32(604800))
  );
  if (dailyLeaderboard == null) {
    const league = getLeagueFromLastWeek(lastWeekId, userAddress);

    dailyLeaderboard = new DailyLeaderboard(id);
    dailyLeaderboard.ARBVolume = arbVolume;
    dailyLeaderboard.BFRVolume = bfrVolume;
    dailyLeaderboard.USDCVolume = usdcVolume;
    dailyLeaderboard.dayId = dayId;
    dailyLeaderboard.userAddress = userAddress;
    dailyLeaderboard.USDCTrades = usdcTrades;
    dailyLeaderboard.ARBTrades = arbTrades;
    dailyLeaderboard.BFRTrades = bfrTrades;
    dailyLeaderboard.USDCTradesWon = usdcTradesWon;
    dailyLeaderboard.ARBTradesWon = arbTradesWon;
    dailyLeaderboard.BFRTradesWon = bfrTradesWon;
    dailyLeaderboard.ARBPnl = arbPnl;
    dailyLeaderboard.BFRPnl = bfrPnl;
    dailyLeaderboard.USDCPnl = usdcPnl;
    dailyLeaderboard.league = league;
    dailyLeaderboard.totalPnl = totalPnl;
    dailyLeaderboard.totalVolume = totalVolume;
    dailyLeaderboard.totalTrades = totalTrades;
    dailyLeaderboard.weekId = weekId;
    dailyLeaderboard.save();
  } else {
    dailyLeaderboard.ARBVolume = dailyLeaderboard.ARBVolume.plus(arbVolume);
    dailyLeaderboard.BFRVolume = dailyLeaderboard.BFRVolume.plus(bfrVolume);
    dailyLeaderboard.USDCVolume = dailyLeaderboard.USDCVolume.plus(usdcVolume);
    dailyLeaderboard.USDCTrades = dailyLeaderboard.USDCTrades.plus(usdcTrades);
    dailyLeaderboard.ARBTrades = dailyLeaderboard.ARBTrades.plus(arbTrades);
    dailyLeaderboard.BFRTrades = dailyLeaderboard.BFRTrades.plus(bfrTrades);
    dailyLeaderboard.ARBPnl = dailyLeaderboard.ARBPnl.plus(arbPnl);
    dailyLeaderboard.BFRPnl = dailyLeaderboard.BFRPnl.plus(bfrPnl);
    dailyLeaderboard.USDCPnl = dailyLeaderboard.USDCPnl.plus(usdcPnl);
    dailyLeaderboard.USDCTradesWon =
      dailyLeaderboard.USDCTradesWon.plus(usdcTradesWon);
    dailyLeaderboard.ARBTradesWon =
      dailyLeaderboard.ARBTradesWon.plus(arbTradesWon);
    dailyLeaderboard.BFRTradesWon =
      dailyLeaderboard.BFRTradesWon.plus(bfrTradesWon);
    dailyLeaderboard.totalPnl = dailyLeaderboard.totalPnl.plus(totalPnl);
    dailyLeaderboard.totalVolume =
      dailyLeaderboard.totalVolume.plus(totalVolume);
    dailyLeaderboard.totalTrades =
      dailyLeaderboard.totalTrades.plus(totalTrades);
    dailyLeaderboard.save();
  }

  const weekleaderboard = WeeklyLeaderboard.load(
    weekId + userAddress.toHexString()
  );

  if (weekleaderboard == null) {
    const league = getLeagueFromLastWeek(lastWeekId, userAddress);

    const weekleaderboard = new WeeklyLeaderboard(
      weekId + userAddress.toHexString()
    );
    weekleaderboard.ARBPnl = arbPnl;
    weekleaderboard.ARBVolume = arbVolume;
    weekleaderboard.BFRPnl = bfrPnl;
    weekleaderboard.BFRVolume = bfrVolume;
    weekleaderboard.USDCPnl = usdcPnl;
    weekleaderboard.USDCVolume = usdcVolume;
    weekleaderboard.weekId = weekId;
    weekleaderboard.userAddress = userAddress;
    weekleaderboard.USDCTrades = usdcTrades;
    weekleaderboard.ARBTrades = arbTrades;
    weekleaderboard.BFRTrades = bfrTrades;
    weekleaderboard.USDCTradesWon = usdcTradesWon;
    weekleaderboard.ARBTradesWon = arbTradesWon;
    weekleaderboard.BFRTradesWon = bfrTradesWon;
    weekleaderboard.league = league;
    weekleaderboard.totalPnl = totalPnl;
    weekleaderboard.totalVolume = totalVolume;
    weekleaderboard.totalTrades = totalTrades;
    weekleaderboard.save();
  } else {
    weekleaderboard.ARBVolume = weekleaderboard.ARBVolume.plus(arbVolume);
    weekleaderboard.BFRVolume = weekleaderboard.BFRVolume.plus(bfrVolume);
    weekleaderboard.USDCVolume = weekleaderboard.USDCVolume.plus(usdcVolume);
    weekleaderboard.USDCTrades = weekleaderboard.USDCTrades.plus(usdcTrades);
    weekleaderboard.ARBTrades = weekleaderboard.ARBTrades.plus(arbTrades);
    weekleaderboard.BFRTrades = weekleaderboard.BFRTrades.plus(bfrTrades);
    weekleaderboard.ARBPnl = weekleaderboard.ARBPnl.plus(arbPnl);
    weekleaderboard.BFRPnl = weekleaderboard.BFRPnl.plus(bfrPnl);
    weekleaderboard.USDCPnl = weekleaderboard.USDCPnl.plus(usdcPnl);
    weekleaderboard.USDCTradesWon =
      weekleaderboard.USDCTradesWon.plus(usdcTradesWon);
    weekleaderboard.ARBTradesWon =
      weekleaderboard.ARBTradesWon.plus(arbTradesWon);
    weekleaderboard.BFRTradesWon =
      weekleaderboard.BFRTradesWon.plus(bfrTradesWon);
    weekleaderboard.totalPnl = weekleaderboard.totalPnl.plus(totalPnl);
    weekleaderboard.totalVolume = weekleaderboard.totalVolume.plus(totalVolume);
    weekleaderboard.totalTrades = weekleaderboard.totalTrades.plus(totalTrades);
    weekleaderboard.save();
  }
}

function getLeagueFromLastWeek(lastWeekId: string, userAddress: Bytes): string {
  const lastWeekLeaderboard = WeeklyLeaderboard.load(
    lastWeekId.toString() + userAddress.toHexString()
  );
  const last = new LastWeekLeaderboard(
    lastWeekId.toString() + userAddress.toHexString()
  );
  if (last !== null) {
    last.userAddress = userAddress;
    last.save();
  }
  let league = "Bronze";
  if (lastWeekLeaderboard != null) {
    if (lastWeekLeaderboard.totalVolume.gt(BigInt.fromI64(25000000000))) {
      league = "Diamond";
    } else if (
      lastWeekLeaderboard.totalVolume.gt(BigInt.fromI64(10000000000))
    ) {
      league = "Platinum";
    } else if (lastWeekLeaderboard.totalVolume.gt(BigInt.fromI64(5000000000))) {
      league = "Gold";
    } else if (lastWeekLeaderboard.totalVolume.gt(BigInt.fromI64(2000000000))) {
      league = "Silver";
    }
  }
  return league;
}

export function _createTradeEntity(
  tradeId: BigInt,
  marketAddress: Bytes,
  userAddress: Bytes,
  volume: BigInt,
  depositToken: string
): void {
  const trade = new Trade(
    tradeId.toString() + marketAddress.toHexString().toLowerCase()
  );
  trade.userAddress = userAddress;
  trade.volume = volume;
  trade.token = depositToken;
  trade.save();
}

export function _createOrUpdateTotalData(
  timestamp: BigInt,
  volume: BigInt,
  depositToken: string
): void {
  const dayId = _getDayId(timestamp);

  let dailyData = TotalData.load(dayId);

  if (dailyData == null) {
    dailyData = new TotalData(dayId);
    dailyData.volume = convertToUSD(volume, depositToken);
    dailyData.trades = ONE;
    dailyData.save();
  } else {
    dailyData.volume = dailyData.volume.plus(
      convertToUSD(volume, depositToken)
    );
    dailyData.trades = dailyData.trades.plus(ONE);
    dailyData.save();
  }

  const weekId = _getLeaderboardWeekId(timestamp);

  let weeklyData = TotalData.load(weekId);

  if (weeklyData == null) {
    weeklyData = new TotalData(weekId);
    weeklyData.volume = convertToUSD(volume, depositToken);
    weeklyData.trades = ONE;
    weeklyData.save();
  } else {
    weeklyData.volume = weeklyData.volume.plus(
      convertToUSD(volume, depositToken)
    );
    weeklyData.trades = weeklyData.trades.plus(ONE);
    weeklyData.save();
  }
}
