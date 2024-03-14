import {
  Loss,
  Profit,
  Provide,
  Withdraw,
} from "../generated/BinaryPool/BinaryPool";
import { BLPtxns } from "../generated/schema";
import { _updateOrCreatePoolStatForProfitLoss } from "./initialize";

export function handleProvide(event: Provide): void {
  const poolAddress = event.address;

  const blp_pool_txn = new BLPtxns(event.transaction.hash.toHexString());

  blp_pool_txn.amount = event.params.amount;
  blp_pool_txn.user = event.params.account;
  blp_pool_txn.timestamp = event.block.timestamp;
  blp_pool_txn.type = "Provide";
  blp_pool_txn.txHash = event.transaction.hash;
  blp_pool_txn.units_minted_burned = event.params.writeAmount;
  blp_pool_txn.poolAddress = poolAddress;
  blp_pool_txn.blp_rate = event.params.amount.div(event.params.writeAmount);
  blp_pool_txn.save();

  // _updateOrCreatePoolStatForProvideWithdraw(
  //   event.block.timestamp,
  //   event.params.amount,
  //   event.params.writeAmount,
  //   true
  // );
}

export function handleWithdraw(event: Withdraw): void {
  const poolAddress = event.address;

  const blp_pool_txn = new BLPtxns(event.transaction.hash.toHexString());

  blp_pool_txn.amount = event.params.amount;
  blp_pool_txn.user = event.params.account;
  blp_pool_txn.timestamp = event.block.timestamp;
  blp_pool_txn.type = "Withdraw";
  blp_pool_txn.txHash = event.transaction.hash;
  blp_pool_txn.units_minted_burned = event.params.writeAmount;
  blp_pool_txn.poolAddress = poolAddress;
  blp_pool_txn.blp_rate = event.params.amount.div(event.params.writeAmount);
  blp_pool_txn.save();

  // _updateOrCreatePoolStatForProvideWithdraw(
  //   event.block.timestamp,
  //   event.params.amount,
  //   event.params.writeAmount,
  //   false
  // );
}

export function handleProfit(event: Profit): void {
  _updateOrCreatePoolStatForProfitLoss(
    event.block.timestamp,
    event.params.amount,
    true
  );
  // let poolContractInstance = BinaryPool.bind(event.address);
  // let rate = poolContractInstance
  //   .totalTokenXBalance()
  //   .times(BigInt.fromI64(100000000))
  //   .div(poolContractInstance.totalSupply());
  // let poolStat = _loadOrCreatePoolStat(
  //   _getDayId(event.block.timestamp),
  //   "daily"
  // );
  // let usdcContractInstance = USDC.bind(Address.fromString(USDC_ADDRESS));
  // poolStat.amount = usdcContractInstance.balanceOf(event.address);
  // poolStat.timestamp = event.block.timestamp;
  // poolStat.rate = rate;
  // poolStat.save();
  // let totalPoolStat = _loadOrCreatePoolStat("total", "total");
  // totalPoolStat.amount = usdcContractInstance.balanceOf(event.address);
  // totalPoolStat.timestamp = event.block.timestamp;
  // totalPoolStat.save();
}

export function handleLoss(event: Loss): void {
  _updateOrCreatePoolStatForProfitLoss(
    event.block.timestamp,
    event.params.amount,
    false
  );
  // let poolContractInstance = BinaryPool.bind(event.address);
  // let rate = poolContractInstance
  //   .totalTokenXBalance()
  //   .times(BigInt.fromI64(100000000))
  //   .div(poolContractInstance.totalSupply());
  // let poolStat = _loadOrCreatePoolStat(
  //   _getDayId(event.block.timestamp),
  //   "daily"
  // );
  // let usdcContractInstance = USDC.bind(Address.fromString(USDC_ADDRESS));
  // poolStat.amount = usdcContractInstance.balanceOf(event.address);
  // poolStat.timestamp = event.block.timestamp;
  // poolStat.rate = rate;
  // poolStat.save();
  // let totalPoolStat = _loadOrCreatePoolStat("total", "total");
  // totalPoolStat.amount = usdcContractInstance.balanceOf(event.address);
  // totalPoolStat.timestamp = event.block.timestamp;
  // totalPoolStat.save();
}
