import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { _getDayId, _getHourId, _getWeekId, _getDefillamaDayId } from "./helpers";
import {
  _loadOrCreateVolumeStat,
  _loadOrCreateTradingStatEntity,
  _loadOrCreateAssetTradingStatEntity,
  _loadOrCreateFeeStat,
  _loadOrCreateDefillamaFeeStat,
  _loadOrCreateUserRewards,
} from "./initialize";

// Used for the plotting the volume chart
export function logVolume(
  timestamp: BigInt,
  amount: BigInt,
  volumeARB: BigInt,
  volumeUSDC: BigInt,
  volumeBFR: BigInt
): void {
  let totalEntity = _loadOrCreateVolumeStat("total", "total", timestamp);
  totalEntity.amount = totalEntity.amount.plus(amount);
  totalEntity.VolumeARB = totalEntity.VolumeARB.plus(volumeARB);
  totalEntity.VolumeUSDC = totalEntity.VolumeUSDC.plus(volumeUSDC);
  totalEntity.VolumeBFR = totalEntity.VolumeBFR.plus(volumeBFR);
  totalEntity.save();

  let id = _getDayId(timestamp);
  let dailyEntity = _loadOrCreateVolumeStat(id, "daily", timestamp);
  dailyEntity.amount = dailyEntity.amount.plus(amount);
  dailyEntity.VolumeARB = dailyEntity.VolumeARB.plus(volumeARB);
  dailyEntity.VolumeUSDC = dailyEntity.VolumeUSDC.plus(volumeUSDC);
  dailyEntity.VolumeBFR = dailyEntity.VolumeBFR.plus(volumeBFR);
  dailyEntity.save();

  let hourID = _getHourId(timestamp);
  let hourlyEntity = _loadOrCreateVolumeStat(hourID, "hourly", timestamp);
  hourlyEntity.amount = hourlyEntity.amount.plus(amount);
  hourlyEntity.VolumeARB = hourlyEntity.VolumeARB.plus(volumeARB);
  hourlyEntity.VolumeUSDC = hourlyEntity.VolumeUSDC.plus(volumeUSDC);
  hourlyEntity.VolumeBFR = hourlyEntity.VolumeBFR.plus(volumeBFR);
  hourlyEntity.save();

  let weekID = _getWeekId(timestamp);
  let weekEntity = _loadOrCreateVolumeStat(weekID, "weekly", timestamp);
  weekEntity.amount = weekEntity.amount.plus(amount);
  weekEntity.VolumeARB = weekEntity.VolumeARB.plus(volumeARB);
  weekEntity.VolumeUSDC = weekEntity.VolumeUSDC.plus(volumeUSDC);
  weekEntity.VolumeBFR = weekEntity.VolumeBFR.plus(volumeBFR);
  weekEntity.save();
}

// Used for the plotting the fees chart
export function storeFees(
  timestamp: BigInt,
  fees: BigInt,
  feesARB: BigInt,
  feesUSDC: BigInt,
  feesBFR: BigInt
): void {
  let id = _getDayId(timestamp);
  let entity = _loadOrCreateFeeStat(id, "daily", timestamp);
  entity.fee = entity.fee.plus(fees);
  entity.feeARB = entity.feeARB.plus(feesARB);
  entity.feeUSDC = entity.feeUSDC.plus(feesUSDC);
  entity.feeBFR = entity.feeBFR.plus(feesBFR);
  entity.save();

  let weekID = _getWeekId(timestamp);
  let weekEntity = _loadOrCreateFeeStat(weekID, "weekly", timestamp);
  weekEntity.fee = weekEntity.fee.plus(fees);
  weekEntity.feeARB = weekEntity.feeARB.plus(feesARB);
  weekEntity.feeUSDC = weekEntity.feeUSDC.plus(feesUSDC);
  weekEntity.feeBFR = weekEntity.feeBFR.plus(feesBFR);
  weekEntity.save();

  let totalEntity = _loadOrCreateFeeStat("total", "total", timestamp);
  totalEntity.fee = totalEntity.fee.plus(fees);
  totalEntity.feeARB = totalEntity.feeARB.plus(feesARB);
  totalEntity.feeUSDC = totalEntity.feeUSDC.plus(feesUSDC);
  totalEntity.feeBFR = totalEntity.feeBFR.plus(feesBFR);
  totalEntity.save();
}

// Used for storing the open interest
export function updateOpenInterest(
  timestamp: BigInt,
  increaseInOpenInterest: boolean,
  isAbove: boolean,
  amount: BigInt
): void {
  let totalId = "total";
  let totalEntity = _loadOrCreateTradingStatEntity(totalId, "total", timestamp);
  if (isAbove) {
    totalEntity.longOpenInterest = increaseInOpenInterest
      ? totalEntity.longOpenInterest.plus(amount)
      : totalEntity.longOpenInterest.minus(amount);
  } else {
    totalEntity.shortOpenInterest = increaseInOpenInterest
      ? totalEntity.shortOpenInterest.plus(amount)
      : totalEntity.shortOpenInterest.minus(amount);
  }
  totalEntity.save();
  let dayID = _getDayId(timestamp);
  let dailyEntity = _loadOrCreateTradingStatEntity(dayID, "daily", timestamp);
  dailyEntity.longOpenInterest = totalEntity.longOpenInterest;
  dailyEntity.shortOpenInterest = totalEntity.shortOpenInterest;
  dailyEntity.save();
}

// Used for plotting the Traders NetPnL chart and Traders Profit vs Loss chart
export function storePnl(
  timestamp: BigInt,
  pnl: BigInt,
  isProfit: boolean,
  pnlUSDC: BigInt,
  pnlARB: BigInt,
  pnlBFR: BigInt
): void {
  let dayID = _getDayId(timestamp);
  let weekID = _getWeekId(timestamp);
  let dailyEntity = _loadOrCreateTradingStatEntity(dayID, "daily", timestamp);
  let weeklyEntity = _loadOrCreateTradingStatEntity(
    weekID,
    "weekly",
    timestamp
  );
  let totalEntity = _loadOrCreateTradingStatEntity("total", "total", timestamp);

  if (isProfit) {
    totalEntity.profitCumulative = totalEntity.profitCumulative.plus(pnl);
    totalEntity.profitCumulativeUSDC = totalEntity.profitCumulativeUSDC.plus(
      pnlUSDC
    );
    totalEntity.profitCumulativeARB = totalEntity.profitCumulativeARB.plus(
      pnlARB
    );
    totalEntity.profitCumulativeBFR = totalEntity.profitCumulativeBFR.plus(
      pnlBFR
    );
    dailyEntity.profit = dailyEntity.profit.plus(pnl);
    dailyEntity.profitUSDC = dailyEntity.profitUSDC.plus(pnlUSDC);
    dailyEntity.profitARB = dailyEntity.profitARB.plus(pnlARB);
    dailyEntity.profitBFR = dailyEntity.profitBFR.plus(pnlBFR);
    weeklyEntity.profit = weeklyEntity.profit.plus(pnl);
    weeklyEntity.profitUSDC = weeklyEntity.profitUSDC.plus(pnlUSDC);
    weeklyEntity.profitARB = weeklyEntity.profitARB.plus(pnlARB);
    weeklyEntity.profitBFR = weeklyEntity.profitBFR.plus(pnlBFR);
  } else {
    totalEntity.lossCumulative = totalEntity.lossCumulative.plus(pnl);
    totalEntity.lossCumulativeUSDC = totalEntity.lossCumulativeUSDC.plus(
      pnlUSDC
    );
    totalEntity.lossCumulativeARB = totalEntity.lossCumulativeARB.plus(pnlARB);
    totalEntity.lossCumulativeBFR = totalEntity.lossCumulativeBFR.plus(pnlBFR);
    dailyEntity.loss = dailyEntity.loss.plus(pnl);
    dailyEntity.lossARB = dailyEntity.lossARB.plus(pnlARB);
    dailyEntity.lossUSDC = dailyEntity.lossUSDC.plus(pnlUSDC);
    dailyEntity.lossBFR = dailyEntity.lossBFR.plus(pnlBFR);

    weeklyEntity.loss = weeklyEntity.loss.plus(pnl);
    weeklyEntity.lossARB = weeklyEntity.lossARB.plus(pnlARB);
    weeklyEntity.lossUSDC = weeklyEntity.lossUSDC.plus(pnlUSDC);
    weeklyEntity.lossBFR = weeklyEntity.lossBFR.plus(pnlBFR);
  }
  totalEntity.save();
  let totalEntityV2 = _loadOrCreateTradingStatEntity(
    "total",
    "total",
    timestamp
  );
  dailyEntity.profitCumulative = totalEntityV2.profitCumulative;
  dailyEntity.profitCumulativeUSDC = totalEntityV2.profitCumulativeUSDC;
  dailyEntity.profitCumulativeARB = totalEntityV2.profitCumulativeARB;
  dailyEntity.profitCumulativeBFR = totalEntityV2.profitCumulativeBFR;
  dailyEntity.lossCumulative = totalEntityV2.lossCumulative;
  dailyEntity.lossCumulativeARB = totalEntityV2.lossCumulativeARB;
  dailyEntity.lossCumulativeUSDC = totalEntityV2.lossCumulativeUSDC;
  dailyEntity.lossCumulativeBFR = totalEntityV2.lossCumulativeBFR;
  weeklyEntity.profitCumulative = totalEntityV2.profitCumulative;
  weeklyEntity.profitCumulativeUSDC = totalEntityV2.profitCumulativeUSDC;
  weeklyEntity.profitCumulativeARB = totalEntityV2.profitCumulativeARB;
  weeklyEntity.profitCumulativeBFR = totalEntityV2.profitCumulativeBFR;
  weeklyEntity.lossCumulative = totalEntityV2.lossCumulative;
  weeklyEntity.lossCumulativeARB = totalEntityV2.lossCumulativeARB;
  weeklyEntity.lossCumulativeUSDC = totalEntityV2.lossCumulativeUSDC;
  weeklyEntity.lossCumulativeBFR = totalEntityV2.lossCumulativeBFR;
  dailyEntity.save();
  weeklyEntity.save();
}

export function storePnlPerContract(
  timestamp: BigInt,
  pnl: BigInt,
  isProfit: boolean,
  contractAddress: Bytes
): void {
  let totalID = `total-${contractAddress}`;
  let totalEntity = _loadOrCreateAssetTradingStatEntity(
    totalID,
    "total",
    timestamp,
    contractAddress,
    "total"
  );
  let dayID = _getDayId(timestamp);
  let id = `${dayID}-${contractAddress}`;
  let dailyEntity = _loadOrCreateAssetTradingStatEntity(
    id,
    "daily",
    timestamp,
    contractAddress,
    dayID
  );
  if (isProfit) {
    totalEntity.profitCumulative = totalEntity.profitCumulative.plus(pnl);
    dailyEntity.profit = dailyEntity.profit.plus(pnl);
  } else {
    totalEntity.lossCumulative = totalEntity.lossCumulative.plus(pnl);
    dailyEntity.loss = dailyEntity.loss.plus(pnl);
  }
  totalEntity.save();
  let totalEntityV2 = _loadOrCreateAssetTradingStatEntity(
    totalID,
    "total",
    timestamp,
    contractAddress,
    "total"
  );
  dailyEntity.profitCumulative = totalEntityV2.profitCumulative;
  dailyEntity.lossCumulative = totalEntityV2.lossCumulative;
  dailyEntity.save();
}

// For tracking user benefits for referra / Nft discounts
export function saveSettlementFeeDiscount(
  timestamp: BigInt,
  totalFee: BigInt,
  settlementFee: BigInt
): void {
  let dayID = _getDayId(timestamp);
  let userRewardEntity = _loadOrCreateUserRewards(dayID, timestamp);
  userRewardEntity.cumulativeReward = userRewardEntity.cumulativeReward.plus(
    totalFee
      .times(BigInt.fromI32(15000000))
      .div(BigInt.fromI32(100000000))
      .minus(settlementFee)
  );
  userRewardEntity.save();
}

// Segregating Nfts discounts from Referral Discounts
export function referralAndNFTDiscountStats(
  timestamp: BigInt,
  rebate: BigInt,
  referrerFee: BigInt
): void {
  let dayID = _getDayId(timestamp);
  let userRewardEntity = _loadOrCreateUserRewards(dayID, timestamp);
  userRewardEntity.referralDiscount = userRewardEntity.referralDiscount.plus(
    rebate
  );
  userRewardEntity.referralReward = userRewardEntity.referralReward.plus(
    referrerFee
  );
  userRewardEntity.nftDiscount = userRewardEntity.cumulativeReward.minus(
    rebate
  );
  userRewardEntity.save();
}

export function storeDefillamaFees(
  timestamp: BigInt,
  fees: BigInt,
): void {
  let id = _getDefillamaDayId(timestamp);
  let entity = _loadOrCreateDefillamaFeeStat(id, "daily", timestamp);
  entity.fee = entity.fee.plus(fees);
  entity.save();
}