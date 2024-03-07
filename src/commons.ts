import { Bytes } from "@graphprotocol/graph-ts";
import { OptionContract } from "../generated/schema";
import {
  ARB_POOL_CONTRACT,
  BFR_POOL_CONTRACT,
  USDC_POOL_CONTRACT,
  ZERO,
} from "./config";

export function registerAmarket(
  targetContract: Bytes,
  routerAddress: Bytes
): void {
  const market = OptionContract.load(targetContract.toHex());
  if (market == null) {
    const market = new OptionContract(targetContract.toHex());
    market.address = targetContract;
    market.isPaused = true;
    market.category = 0;
    market.token = "UNKNOWN";
    market.pool = "UNKNOWN";
    market.tradeCount = ZERO;
    market.volume = ZERO;
    market.openUp = ZERO;
    market.openDown = ZERO;
    market.openInterestUp = ZERO;
    market.openInterestDown = ZERO;
    market.routerContract = routerAddress;
    market.save();
  }
}

export function getPoolNameFromAddress(poolAddress: Bytes): string {
  // convert switch case into if else ladder
  if (poolAddress.toHexString() === USDC_POOL_CONTRACT) {
    return "USDC";
  } else if (poolAddress.toHexString() === ARB_POOL_CONTRACT) {
    return "ARB";
  } else if (poolAddress.toHexString() === BFR_POOL_CONTRACT) {
    return "BFR";
  } else {
    return "UNKNOWN";
  }
}
