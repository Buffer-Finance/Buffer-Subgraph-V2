import { Address } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/BFR/BFR";
import { Counter, Holder } from "../generated/schema";
import { ADDRESS_ZERO } from "./config";
import { ZERO } from "./initialize";

function loadOrCreateCounter(): Counter {
  let entity = Counter.load("counter");
  if (!entity) {
    entity = new Counter("counter");
    entity.counter = 0;
    entity.save();
  }
  return entity;
}

function loadOrCreateHolderData(account: Address): Holder {
  let entity = Holder.load(account);
  if (!entity) {
    entity = new Holder(account);
    entity.balance = ZERO;
    entity.counter = 0;
    entity.save();
  }
  return entity;
}

export function _handleARBTransfer(event: Transfer): void {
  let fromAccount = loadOrCreateHolderData(event.params.from);
  let toAccount = loadOrCreateHolderData(event.params.to);
  let counter = loadOrCreateCounter();
  if (fromAccount.id != Address.fromString(ADDRESS_ZERO)) {
    fromAccount.balance = fromAccount.balance.minus(event.params.value);
    fromAccount.counter = counter.counter;
    fromAccount.save();
  }
  if (toAccount.id != Address.fromString(ADDRESS_ZERO)) {
    toAccount.balance = toAccount.balance.plus(event.params.value);
    toAccount.counter = counter.counter + 1;
    toAccount.save();
  }
  counter.counter += 2;
  counter.save();
}
