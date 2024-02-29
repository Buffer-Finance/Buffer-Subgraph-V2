import { BigInt } from "@graphprotocol/graph-ts";
import { ONE } from "./config";
import { _loadOrCreateOptionContractEntity } from "./initialize";

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
