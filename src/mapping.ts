import { Transfer } from "../generated/BFR/BFR";
import { BurnedBFR } from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export const ZERO = BigInt.fromI32(0);

export function handleTransfer(event: Transfer): void {
  let id = _
  let entity = _loadOrCreateBurnedBFR("daily", id);  
}



function _loadOrCreateBurnedBFR(period: string, id: string, ): BurnedBFR {
  let entity = BurnedBFR.load(id);
  if (!entity) {
    entity = new BurnedBFR(id);
    entity.timestamp = ZERO;
    entity.period = period;
    entity.amount = ZERO;
    entity.save();
  }
  return entity;
}