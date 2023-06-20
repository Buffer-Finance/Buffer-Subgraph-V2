import { Address } from "@graphprotocol/graph-ts";
import { _getDayId, _getHourId, _getWeekId } from "./helpers";
import {
  _loadOrCreateOptionContractEntity,
  _loadOrCreateOptionDataEntity,
  _loadOrCreateReferralData,
} from "./initialize";
import { OpenTrade, RegisterAccount, DeregisterAccount } from "../generated/BufferRouter/BufferRouter";
import { State, RouterAddress, ARBITRUM_SOLANA_ADDRESS } from "./config";
import { updateClosingStats } from "./aggregate";
import { UserOptionData, EOAtoOneCT } from "../generated/schema";

const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export function _handleOpenTrade(event: OpenTrade): void {
  let queueID = event.params.queueId;
  let contractAddress = event.params.targetContract;
  let userOptionData = UserOptionData.load(
    `${event.params.optionId}${contractAddress}`
  );
  if (userOptionData != null) {
    userOptionData.queueID = queueID;
    userOptionData.save();
  }
}

export function _handleRegisterAccount(event: RegisterAccount): void {
  let account = event.params.account;
  let eoaToOneCT = EOAtoOneCT.load(
    account.toString()
  );
  if (eoaToOneCT == null) {
    eoaToOneCT = new EOAtoOneCT(account.toString());
  }
  eoaToOneCT.eoa = event.params.account;
  eoaToOneCT.oneCT = event.params.oneCT;
  eoaToOneCT.save();
}

export function _handleDeregisterAccount(event: DeregisterAccount): void {
  let account = event.params.account;
  let eoaToOneCT = EOAtoOneCT.load(
    account.toString()
  );
  if (eoaToOneCT == null) {
    eoaToOneCT = new EOAtoOneCT(account.toString());
  }
  eoaToOneCT.eoa = event.params.account;
  eoaToOneCT.oneCT = Address.fromString(ADDRESS_ZERO);
  eoaToOneCT.save();
}