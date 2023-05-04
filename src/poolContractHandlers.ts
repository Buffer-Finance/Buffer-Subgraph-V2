import { BigInt, Address } from "@graphprotocol/graph-ts";
import { _getDayId, _getHourId, _getWeekId } from "./helpers";
import { _loadOrCreatePoolStat, _loadOrCreateARBPoolStat } from "./initialize";
import { USDC_POOL_CONTRACT } from "./config";

export function _handleChangeInPool(
  timestamp: BigInt,
  contractAddress: Address,
  liquidityProvided: boolean,
  amount: BigInt
): void {
  if (contractAddress == Address.fromString(USDC_POOL_CONTRACT)) {
    // let poolContractInstance = BinaryPool.bind(contractAddress);
    // let rate = poolContractInstance
    //   .totalTokenXBalance()
    //   .times(BigInt.fromI64(100000000))
    //   .div(poolContractInstance.totalSupply());

    let poolStat = _loadOrCreatePoolStat(_getDayId(timestamp), "daily");
    poolStat.amount = liquidityProvided
      ? poolStat.amount.plus(amount)
      : poolStat.amount.minus(amount);
    poolStat.timestamp = timestamp;
    // poolStat.rate = rate;
    poolStat.save();

    let totalPoolStat = _loadOrCreatePoolStat("total", "total");
    totalPoolStat.amount = liquidityProvided
      ? totalPoolStat.amount.plus(amount)
      : totalPoolStat.amount.minus(amount);
    totalPoolStat.timestamp = timestamp;
    totalPoolStat.save();
  }
}
