import { Transfer } from "../generated/BFR/BFR";
import { BFRHolder } from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

const zeroAddress = "0x0000000000000000000000000000000000000000";
let ZERO = BigInt.fromI32(0);

export function _handleTransfer(event: Transfer): void {
  let from = event.params.from.toHex();
  let to = event.params.to.toHex();
  let value = event.params.value;
  let fromAccount = loadOrCreateBFRholder(from);
  let toAccount = loadOrCreateBFRholder(to);
  if (fromAccount.id != zeroAddress) {
    fromAccount.balance = fromAccount.balance.minus(value);
    fromAccount.save();
  }
  toAccount.balance = toAccount.balance.plus(value);
  toAccount.save();
}

function loadOrCreateBFRholder(address: string): BFRHolder {
  let referenceID = `${address}`;
  let entity = BFRHolder.load(referenceID);
  if (entity == null) {
    entity = new BFRHolder(referenceID);
    entity.balance = ZERO;
    entity.save();
  }
  return entity as BFRHolder;
}
// function loadOrCreateBFRHolderCounter(address: string): BFRHolderCounter {
//   let referenceID = `${address}`;
//   let entity = BFRHolderCounter.load(referenceID);
//   if (entity == null) {
//     entity = new BFRHolderCounter(referenceID);
//     entity.save();
//     entity.balance = ZERO;
//   }
//   return entity;
// }
