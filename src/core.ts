import { BigInt } from "@graphprotocol/graph-ts";
import { ZERO, _loadOrCreateOptionContractEntity } from "./initialize";

export function updateOptionContractData(
  increaseInOpenInterest: boolean,
  totalFee: BigInt,
  contractAddress: string
): string {
  let optionContractData = _loadOrCreateOptionContractEntity(contractAddress);
  let poolToken = optionContractData.pool;

  optionContractData.tradeCount += 1;
  optionContractData.volume = optionContractData.volume.plus(totalFee);
  optionContractData.openInterest = increaseInOpenInterest
    ? optionContractData.openInterest.plus(totalFee)
    : optionContractData.openInterest.minus(totalFee);
  optionContractData.currentUtilization = ZERO;

  optionContractData.save();
  return poolToken;
}
