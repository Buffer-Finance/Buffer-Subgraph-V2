import { Bytes } from "@graphprotocol/graph-ts";
import { OptionContract } from "../generated/schema";
import { ZERO } from "./config";

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
