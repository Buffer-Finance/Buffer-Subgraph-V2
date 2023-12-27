import { BigInt } from "@graphprotocol/graph-ts";
import { ABVolumePerContract } from "../generated/schema";
import { ONE } from "./config";
import { _loadOrCreateOptionContractEntity } from "./initialize";

export function logABVolumeAndSettlementFeePerContract(
  id: string,
  period: string,
  timestamp: BigInt,
  contractAddress: string,
  totalFee: BigInt,
  settlementFee: BigInt
): void {
  let referrenceID = `${id}${contractAddress}`;
  let entity = ABVolumePerContract.load(referrenceID);
  if (entity === null) {
    entity = new ABVolumePerContract(referrenceID);
    entity.period = period;
    entity.timestamp = timestamp;
    entity.amount = totalFee;
    entity.optionContract = contractAddress;
    entity.settlementFee = settlementFee;
    entity.save();
  } else {
    entity.amount = entity.amount.plus(totalFee);
    entity.settlementFee = entity.settlementFee.plus(settlementFee);
    entity.save();
  }
}

export function logABOpenInterst(
  contracteAddress: string,
  isAbove: boolean,
  volume: BigInt,
  isOpening: boolean
): void {
  const entity = _loadOrCreateOptionContractEntity(contracteAddress);
  if (isOpening) {
    if (isAbove) {
      entity.openInterestUp = entity.openInterestUp.plus(volume);
      entity.openUp = entity.openUp.plus(ONE);
    } else {
      entity.openInterestDown = entity.openInterestDown.plus(volume);
      entity.openDown = entity.openDown.plus(ONE);
    }
  } else {
    if (isAbove) {
      entity.openInterestUp = entity.openInterestUp.minus(volume);
      entity.openUp = entity.openUp.minus(ONE);
    } else {
      entity.openInterestDown = entity.openInterestDown.minus(volume);
      entity.openDown = entity.openDown.minus(ONE);
    }
  }
  entity.save();
}
