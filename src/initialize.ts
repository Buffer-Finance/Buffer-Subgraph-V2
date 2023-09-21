import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { BufferBinaryOptions } from "../generated/BufferBinaryOptions/BufferBinaryOptions";
import { BufferRouter } from "../generated/BufferRouter/BufferRouter";
import {
  ARBPoolStat,
  AssetTradingStat,
  DailyRevenueAndFee,
  DashboardStat,
  FeeStat,
  Leaderboard,
  OptionContract,
  PoolStat,
  ReferralData,
  TradingStat,
  UserOptionData,
  UserRewards,
  UserStat,
  VolumeStat,
  WeeklyLeaderboard,
  WeeklyRevenueAndFee,
} from "../generated/schema";
import {
  ADDRESS_ZERO,
  ARB_POOL_CONTRACT,
  BFR_POOL_CONTRACT,
  RouterAddress,
  USDC_POL_POOL_CONTRACT,
  USDC_POOL_CONTRACT,
  V2_ARB_POOL_CONTRACT,
  V2_RouterAddress,
  V2_USDC_POOL_CONTRACT,
} from "./config";

export const ZERO = BigInt.fromI32(0);

//TODO: Scan Config for settlement fee update
export function calculatePayout(settlementFeePercent: BigInt): BigInt {
  let payout = BigInt.fromI64(1000000000000000000).minus(
    settlementFeePercent.times(BigInt.fromI64(200000000000000))
  );
  return payout;
}

export function _loadOrCreateOptionContractEntity(
  contractAddress: Address
): OptionContract {
  let optionContract = OptionContract.load(contractAddress);
  if (optionContract == null) {
    optionContract = new OptionContract(contractAddress);
    optionContract.address = contractAddress;
    optionContract.volume = ZERO;
    optionContract.tradeCount = 0;
    optionContract.openDown = ZERO;
    optionContract.openUp = ZERO;
    optionContract.openInterest = ZERO;
    optionContract.currentUtilization = ZERO;
    //    optionContract.payoutForDown = ZERO;
    //    optionContract.payoutForUp = ZERO;
    optionContract.category = -1;

    const routerContract = BufferRouter.bind(Address.fromString(RouterAddress));
    const v2RouterContract = BufferRouter.bind(
      Address.fromString(V2_RouterAddress)
    );
    if (routerContract.contractRegistry(contractAddress) == true) {
      optionContract.routerContract = RouterAddress;
    } else if (
      v2RouterContract.try_contractRegistry(contractAddress).reverted ==
        false &&
      v2RouterContract.try_contractRegistry(contractAddress).value == true
    ) {
      optionContract.routerContract = V2_RouterAddress;
    } else {
      optionContract.routerContract = ADDRESS_ZERO;
    }

    let optionContractPool = Address.fromString(ADDRESS_ZERO);
    if (optionContract.routerContract == ADDRESS_ZERO) {
      optionContract.isPaused = true;
      optionContract.asset = "";
    } else {
      let optionContractInstance = BufferBinaryOptions.bind(
        Address.fromBytes(contractAddress)
      );
      optionContract.isPaused = optionContractInstance.isPaused();
      optionContract.asset = optionContractInstance.assetPair();
      optionContractPool = optionContractInstance.pool();
    }

    if (optionContractPool == Address.fromString(USDC_POL_POOL_CONTRACT)) {
      optionContract.token = "USDC";
      optionContract.pool = "USDC_POL";
    } else if (
      optionContractPool == Address.fromString(ARB_POOL_CONTRACT) ||
      optionContractPool == Address.fromString(V2_ARB_POOL_CONTRACT)
    ) {
      optionContract.token = "ARB";
      optionContract.pool = "ARB";
    } else if (
      optionContractPool == Address.fromString(USDC_POOL_CONTRACT) ||
      optionContractPool == Address.fromString(V2_USDC_POOL_CONTRACT)
    ) {
      optionContract.token = "USDC";
      optionContract.pool = "USDC";
    } else if (optionContractPool == Address.fromString(BFR_POOL_CONTRACT)) {
      optionContract.token = "BFR";
      optionContract.pool = "BFR";
    } else {
      optionContract.token = "unknown";
      optionContract.pool = "unknown";
    }
    optionContract.save();
  }
  return optionContract as OptionContract;
}

export function _loadOrCreateTradingStatEntity(
  id: string,
  period: string,
  timestamp: BigInt
): TradingStat {
  let entity = TradingStat.load(id);
  if (entity == null) {
    entity = new TradingStat(id);
    entity.period = period;
    entity.profit = ZERO;
    entity.loss = ZERO;
    entity.profitCumulative = ZERO;
    entity.lossCumulative = ZERO;
    entity.profitUSDC = ZERO;
    entity.lossUSDC = ZERO;
    entity.profitCumulativeUSDC = ZERO;
    entity.lossCumulativeUSDC = ZERO;
    entity.profitARB = ZERO;
    entity.lossARB = ZERO;
    entity.profitCumulativeARB = ZERO;
    entity.lossCumulativeARB = ZERO;
    entity.profitBFR = ZERO;
    entity.lossBFR = ZERO;
    entity.profitCumulativeBFR = ZERO;
    entity.lossCumulativeBFR = ZERO;
    entity.openInterest = ZERO;
  }
  entity.timestamp = timestamp;
  return entity as TradingStat;
}

export function _loadOrCreateAssetTradingStatEntity(
  id: string,
  period: string,
  timestamp: BigInt,
  contractAddress: Bytes,
  periodID: string
): AssetTradingStat {
  let entity = AssetTradingStat.load(id);
  if (entity == null) {
    entity = new AssetTradingStat(id);
    entity.period = period;
    entity.profit = ZERO;
    entity.profitARB = ZERO;
    entity.profitUSDC = ZERO;
    entity.profitBFR = ZERO;
    entity.loss = ZERO;
    entity.lossUSDC = ZERO;
    entity.lossARB = ZERO;
    entity.lossBFR = ZERO;
    entity.contractAddress = contractAddress;
    entity.profitCumulative = ZERO;
    entity.profitCumulativeARB = ZERO;
    entity.profitCumulativeUSDC = ZERO;
    entity.profitCumulativeBFR = ZERO;
    entity.lossCumulative = ZERO;
    entity.lossCumulativeARB = ZERO;
    entity.lossCumulativeUSDC = ZERO;
    entity.lossCumulativeBFR = ZERO;
    entity.periodID = periodID;
  }
  entity.timestamp = timestamp;
  return entity as AssetTradingStat;
}

export function _loadOrCreateOptionDataEntity(
  optionID: BigInt,
  contractAddress: Bytes
): UserOptionData {
  let referrenceID = `${optionID}${contractAddress}`;
  let entity = UserOptionData.load(referrenceID);
  if (entity == null) {
    entity = new UserOptionData(referrenceID);
    entity.optionID = optionID;
    entity.optionContract = contractAddress;
    entity.amount = ZERO;
    entity.totalFee = ZERO;
    entity.lag = ZERO;
    entity.creationEventTimeStamp = ZERO;
  }
  return entity as UserOptionData;
}

export function _loadOrCreateLeaderboardEntity(
  dayId: string,
  account: Bytes
): Leaderboard {
  let referenceID = `${dayId}${account}`;
  let entity = Leaderboard.load(referenceID);
  if (entity == null) {
    entity = new Leaderboard(referenceID);
    entity.user = account;
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
  account: Bytes
): WeeklyLeaderboard {
  let referenceID = `${weekId}${account}`;
  let entity = WeeklyLeaderboard.load(referenceID);
  if (entity == null) {
    entity = new WeeklyLeaderboard(referenceID);
    entity.user = account;
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

export function _loadOrCreateUserStat(
  id: string,
  period: string,
  timestamp: BigInt
): UserStat {
  let userStat = UserStat.load(id);
  if (userStat == null) {
    userStat = new UserStat(id);
    userStat.period = period;
    userStat.timestamp = timestamp;
    userStat.uniqueCount = 0;
    userStat.uniqueCountCumulative = 0;
    userStat.users = [];
    userStat.existingCount = 0;
  }
  return userStat as UserStat;
}

export function _loadOrCreateVolumeStat(
  id: string,
  period: string,
  timestamp: BigInt
): VolumeStat {
  let entity = VolumeStat.load(id);
  if (entity === null) {
    entity = new VolumeStat(id);
    entity.period = period;
    entity.timestamp = timestamp;
    entity.amount = ZERO;
    entity.VolumeUSDC = ZERO;
    entity.VolumeARB = ZERO;
    entity.VolumeBFR = ZERO;
    entity.save();
  }
  return entity as VolumeStat;
}

export function _loadOrCreateFeeStat(
  id: string,
  period: string,
  timestamp: BigInt
): FeeStat {
  let entity = FeeStat.load(id);
  if (entity === null) {
    entity = new FeeStat(id);
    entity.period = period;
    entity.timestamp = timestamp;
    entity.fee = ZERO;
    entity.feeARB = ZERO;
    entity.feeUSDC = ZERO;
    entity.feeBFR = ZERO;
    entity.save();
  }
  return entity as FeeStat;
}

export function _loadOrCreateReferralData(user: Bytes): ReferralData {
  let userReferralData = ReferralData.load(user);
  if (userReferralData == null) {
    userReferralData = new ReferralData(user);
    userReferralData.user = user;
    userReferralData.totalDiscountAvailed = ZERO;
    userReferralData.totalDiscountAvailedARB = ZERO;
    userReferralData.totalDiscountAvailedUSDC = ZERO;
    userReferralData.totalDiscountAvailedBFR = ZERO;
    userReferralData.totalRebateEarned = ZERO;
    userReferralData.totalRebateEarnedUSDC = ZERO;
    userReferralData.totalRebateEarnedARB = ZERO;
    userReferralData.totalRebateEarnedBFR = ZERO;
    userReferralData.totalTradesReferred = 0;
    userReferralData.totalTradesReferredUSDC = 0;
    userReferralData.totalTradesReferredARB = 0;
    userReferralData.totalTradesReferredBFR = 0;
    userReferralData.totalTradingVolume = ZERO;
    userReferralData.totalTradingVolumeARB = ZERO;
    userReferralData.totalTradingVolumeUSDC = ZERO;
    userReferralData.totalTradingVolumeBFR = ZERO;
    userReferralData.totalVolumeOfReferredTrades = ZERO;
    userReferralData.totalVolumeOfReferredTradesUSDC = ZERO;
    userReferralData.totalVolumeOfReferredTradesARB = ZERO;
    userReferralData.totalVolumeOfReferredTradesBFR = ZERO;

    userReferralData.save();
  }
  return userReferralData as ReferralData;
}

export function _loadOrCreateDashboardStat(id: string): DashboardStat {
  let dashboardStat = DashboardStat.load(id);
  if (dashboardStat == null) {
    dashboardStat = new DashboardStat(id);
    dashboardStat.totalSettlementFees = ZERO;
    dashboardStat.totalVolume = ZERO;
    dashboardStat.totalTrades = 0;
    dashboardStat.openInterest = ZERO;
    dashboardStat.save();
  }
  return dashboardStat as DashboardStat;
}

export function _loadOrCreatePoolStat(id: string, period: string): PoolStat {
  let poolStat = PoolStat.load(id);
  if (poolStat == null) {
    poolStat = new PoolStat(id);
    poolStat.amount = ZERO;
    poolStat.period = period;
    poolStat.rate = ZERO;
  }
  return poolStat as PoolStat;
}

export function _loadOrCreateARBPoolStat(
  id: string,
  period: string
): ARBPoolStat {
  let poolStat = ARBPoolStat.load(id);
  if (poolStat == null) {
    poolStat = new ARBPoolStat(id);
    poolStat.amount = ZERO;
    poolStat.period = period;
    poolStat.rate = ZERO;
  }
  return poolStat as ARBPoolStat;
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

export function _loadOrCreateUserRewards(
  id: string,
  timestamp: BigInt
): UserRewards {
  let entity = UserRewards.load(id);
  if (entity === null) {
    entity = new UserRewards(id);
    entity.cumulativeReward = ZERO;
    entity.referralReward = ZERO;
    entity.nftDiscount = ZERO;
    entity.referralDiscount = ZERO;
    entity.period = "daily";
    entity.timestamp = timestamp;
    entity.save();
  }
  return entity as UserRewards;
}
