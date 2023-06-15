import { Transfer } from "../generated/BFR/BFR";
import { BurnedBFR } from "../generated/schema";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { _getDayId } from "./helpers";

const ZERO = BigInt.fromI32(0);
const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD";

export function handleTransfer(event: Transfer): void {
  let timestamp = event.block.timestamp;
  if (event.params.to == Address.fromString(BURN_ADDRESS)) {
    let id = _getDayId(timestamp);
    let entity = _loadOrCreateBurnedBFR("daily", id);
    entity.amount = entity.amount.plus(event.params.value);
    entity.timestamp = timestamp;
    entity.save();
  }
}

function _loadOrCreateBurnedBFR(period: string, id: string): BurnedBFR {
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
