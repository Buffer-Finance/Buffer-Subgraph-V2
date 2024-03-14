import { BigInt } from "@graphprotocol/graph-ts";
import { PoolStat } from "../generated/schema";
import { _getDayId } from "./helpers";
let ZERO = BigInt.fromI32(0);

export function _updateOrCreatePoolStatForProvideWithdraw(
  timestamp: BigInt,
  amount: BigInt,
  blp_amount: BigInt,
  isProvide: boolean
): void {
  const id = _getDayId(timestamp);
  let poolStat = PoolStat.load(id.toString());
  if (poolStat == null) {
    const pastDayPoolStats = PoolStat.load((id - 1).toString());
    if (pastDayPoolStats != null) {
      poolStat = new PoolStat(id.toString());
      const newAmount = isProvide
        ? pastDayPoolStats.amount.plus(amount)
        : pastDayPoolStats.amount.minus(amount);
      const newBlpAmount = isProvide
        ? pastDayPoolStats.blp_amount.plus(blp_amount)
        : pastDayPoolStats.blp_amount.minus(blp_amount);
      poolStat.amount = newAmount;
      poolStat.rate = pastDayPoolStats.rate;
      poolStat.blp_amount = newBlpAmount;
      poolStat.timestamp = timestamp;
      poolStat.save();
    } else {
      const poolStat = new PoolStat(id.toString());
      poolStat.amount = isProvide ? amount : ZERO.minus(amount);
      poolStat.rate = amount.div(blp_amount);
      poolStat.blp_amount = isProvide ? blp_amount : ZERO.minus(blp_amount);
      poolStat.timestamp = timestamp;
      poolStat.save();
    }
  } else {
    poolStat = new PoolStat(id.toString());
    const newAmount = isProvide
      ? poolStat.amount.plus(amount)
      : poolStat.amount.minus(amount);
    const newBlpAmount = isProvide
      ? poolStat.blp_amount.plus(blp_amount)
      : poolStat.blp_amount.minus(blp_amount);
    poolStat.amount = newAmount;
    poolStat.rate = newBlpAmount;
    poolStat.blp_amount = poolStat.blp_amount.plus(blp_amount);
    poolStat.timestamp = timestamp;
    poolStat.save();
  }
}

export function _updateOrCreatePoolStatForProfitLoss(
  timestamp: BigInt,
  amount: BigInt,
  isProfit: boolean
): void {
  const id = _getDayId(timestamp);
  let poolStat = PoolStat.load(id.toString());
  if (poolStat == null) {
    const pastDayPoolStats = PoolStat.load((id - 1).toString());
    if (pastDayPoolStats != null) {
      poolStat = new PoolStat(id.toString());
      const newAmount = isProfit
        ? pastDayPoolStats.amount.plus(amount)
        : pastDayPoolStats.amount.minus(amount);
      poolStat.amount = newAmount;
      poolStat.rate = newAmount.div(pastDayPoolStats.blp_amount);
      poolStat.blp_amount = pastDayPoolStats.blp_amount;
      poolStat.timestamp = timestamp;
      poolStat.save();
    } else {
      const poolStat = new PoolStat(id.toString());
      poolStat.amount = isProfit ? amount : ZERO.minus(amount);
      poolStat.rate = ZERO;
      poolStat.blp_amount = ZERO;
      poolStat.timestamp = timestamp;
      poolStat.save();
    }
  } else {
    poolStat = new PoolStat(id.toString());
    let newAmount = isProfit
      ? poolStat.amount.plus(amount)
      : poolStat.amount.minus(amount);
    poolStat.amount = newAmount;
    poolStat.rate = newAmount.div(poolStat.blp_amount);
    poolStat.blp_amount = poolStat.blp_amount;
    poolStat.timestamp = timestamp;
    poolStat.save();
  }
}
