import { BigInt } from "@graphprotocol/graph-ts";

export function convertARBToUSDC(amount: BigInt): BigInt {
  return amount.times(BigInt.fromI32(12)).div(BigInt.fromI64(100000000000000));
}

export function convertBFRToUSDC(amount: BigInt): BigInt {
  return amount.times(BigInt.fromI32(12)).div(BigInt.fromI64(10000000000000));
}
