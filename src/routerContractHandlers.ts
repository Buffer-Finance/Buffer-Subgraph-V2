import { Address } from "@graphprotocol/graph-ts";
import {
  DeregisterAccount,
  RegisterAccount,
} from "../generated/AccountRegistrar/AccountRegistrar";
import { OpenTrade } from "../generated/BufferRouter/BufferRouter";
import {
  DeregisteredAccount,
  EOAtoOneCT,
  UserOptionData,
} from "../generated/schema";
import { ADDRESS_ZERO } from "./config";
import { _loadOrCreateOptionContractEntity } from "./initialize";
import { isContractRegisteredToV2Router } from "./optionContractHandlers";
import { createTxnData } from "./txnDataHandlers";

export function _handleOpenTrade(event: OpenTrade): void {
  createTxnData(event.receipt, event.transaction, "OpenTrade");
  let queueID = event.params.queueId;
  let contractAddress = Address.fromBytes(
    event.params.targetContract
  ).toHexString();
  const optionContractInstance =
    _loadOrCreateOptionContractEntity(contractAddress);

  if (isContractRegisteredToV2Router(optionContractInstance)) {
    let userOptionData = UserOptionData.load(
      `${event.params.optionId}${contractAddress}`
    );
    if (userOptionData != null) {
      userOptionData.queueID = queueID;
      userOptionData.save();
    }
  }
}

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
  eoaToOneCT.oneCT = Address.fromString(ADDRESS_ZERO);
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
