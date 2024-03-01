import { Address } from "@graphprotocol/graph-ts";
import {
  DeregisterAccount,
  RegisterAccount,
} from "../generated/AccountRegistrar/AccountRegistrar";
import { DeregisteredAccount, EOAtoOneCT } from "../generated/schema";
import { ZeroAddress } from "./config";

export function _handleRegisterAccount(event: RegisterAccount): void {
  let account = event.params.user;
  let eoaToOneCT = EOAtoOneCT.load(account.toString());
  if (eoaToOneCT == null) {
    eoaToOneCT = new EOAtoOneCT(account.toString());
  }
  eoaToOneCT.eoa = event.params.user;
  eoaToOneCT.oneCT = event.params.oneCT;
  eoaToOneCT.updatedAt = event.block.timestamp;
  eoaToOneCT.nonce = event.params.nonce;
  eoaToOneCT.save();
}

export function _handleDeregisterAccount(event: DeregisterAccount): void {
  let account = event.params.account;
  let eoaToOneCT = EOAtoOneCT.load(account.toString());
  if (eoaToOneCT == null) {
    eoaToOneCT = new EOAtoOneCT(account.toString());
  }
  eoaToOneCT.eoa = event.params.account;
  eoaToOneCT.oneCT = Address.fromString(ZeroAddress);
  eoaToOneCT.updatedAt = event.block.timestamp;
  eoaToOneCT.nonce = event.params.nonce;
  eoaToOneCT.save();

  let deRegisteredAccount = DeregisteredAccount.load(account.toString());
  if (deRegisteredAccount == null) {
    deRegisteredAccount = new DeregisteredAccount(account.toString());
  }
  deRegisteredAccount.nonce = event.params.nonce;
  deRegisteredAccount.updatedAt = event.block.timestamp;
  deRegisteredAccount.eoa = event.params.account;

  deRegisteredAccount.save();
}
