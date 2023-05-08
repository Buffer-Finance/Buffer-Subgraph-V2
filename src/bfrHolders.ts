import { Transfer } from "../generated/BFR/BFR";
import { BFRInvestor, BFRInvestorsCount } from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";
import { _getDayId } from "./utils";

const zeroAddress = "0x0000000000000000000000000000000000000000";
let ZERO = BigInt.fromI32(0);

export function _handleTransfer(event: Transfer): void {
  let from = event.params.from.toHex();
  let to = event.params.to.toHex();
  let value = event.params.value;
  const timestamp = event.block.timestamp;
  let fromAccount = loadOrCreateBFRholder(from);
  let toAccount = loadOrCreateBFRholder(to);
  const dayId = _getDayId(timestamp);
  let dayEntity = loadOrCreateBFRInvestorsData(dayId);
  if (fromAccount.id != zeroAddress) {
    fromAccount.balance = fromAccount.balance.minus(value);
    fromAccount.save();
  }
  if (fromAccount.balance.equals(ZERO)) {
    dayEntity.holders = dayEntity.holders.minus(1);
  }
  dayEntity.holders = dayEntity.holders.plus(1);
  dayEntity.save();
  toAccount.balance = toAccount.balance.plus(value);
  toAccount.save();
}

function loadOrCreateBFRholder(address: string): BFRInvestor {
  let referenceID = `${address}`;
  let entity = BFRInvestor.load(referenceID);
  if (entity == null) {
    entity = new BFRInvestor(referenceID);
    entity.balance = ZERO;
    entity.save();
  }
  return entity as BFRInvestor;
}
function loadOrCreateBFRInvestorsData(id: string): BFRInvestorsCount {
  let entity = BFRInvestorsCount.load(id);
  if (!entity) {
    entity = new BFRInvestorsCount(id);
    entity.holders = ZERO;
    entity.timestamp = BigInt.fromI32(0);
    entity.save();
  }
  return entity;
}
