import { Address } from "@graphprotocol/graph-ts";
import {
  AboveBelowBufferRouter,
  OpenTrade as AboveBelowOpenTrade,
  CancelTrade,
  InitiateTrade,
} from "../generated/AboveBelowBufferRouter/AboveBelowBufferRouter";
import { OpenTrade } from "../generated/BufferRouter/BufferRouter";
import { UserOptionData } from "../generated/schema";
import {
  AboveBelow_RouterAddress,
  AboveBelow_RouterAddress_2,
  State,
} from "./config";
import {
  _loadOrCreateAboveBelowOptionDataEntity,
  _loadOrCreateAboveBelowQueuedOptionEntity,
  _loadOrCreateOptionContractEntity,
} from "./initialize";
import { isContractRegisteredToV2Router } from "./optionContractHandlers";

export function _handleOpenTrade(event: OpenTrade): void {
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

export function _handleAboveBelowInitiateTrade(event: InitiateTrade): void {
  if (
    event.address == Address.fromString(AboveBelow_RouterAddress_2) ||
    event.address == Address.fromString(AboveBelow_RouterAddress)
  ) {
    let routerContract = AboveBelowBufferRouter.bind(event.address);
    let queueID = event.params.queueId;
    let queuedTradeData = routerContract.queuedTrades(queueID);
    let contractAddress = queuedTradeData.value1.toHexString();
    _loadOrCreateOptionContractEntity(contractAddress);
    // logUser(event.block.timestamp, event.params.user);
    let queuedOptionData = _loadOrCreateAboveBelowQueuedOptionEntity(
      queueID,
      contractAddress
    );
    queuedOptionData.user = event.params.user;
    queuedOptionData.state = State.queued;
    queuedOptionData.strike = queuedTradeData.value2;
    queuedOptionData.expirationTime = queuedTradeData.value3;
    queuedOptionData.numberOfContracts = queuedTradeData.value4;
    queuedOptionData.maxFeePerContract = queuedTradeData.value10;
    queuedOptionData.isAbove = queuedTradeData.value8 ? true : false;
    queuedOptionData.queueTimestamp = queuedTradeData.value9;
    queuedOptionData.save();
    if (event.address == Address.fromString(AboveBelow_RouterAddress_2)) {
      queuedOptionData.totalFee = queuedTradeData.value12;
    }
  }
}

export function _handleAboveBelowCancelTrade(event: CancelTrade): void {
  if (
    event.address == Address.fromString(AboveBelow_RouterAddress_2) ||
    event.address == Address.fromString(AboveBelow_RouterAddress)
  ) {
    let queueID = event.params.queueId;
    let routerContract = AboveBelowBufferRouter.bind(event.address);
    let contractAddress = routerContract
      .queuedTrades(queueID)
      .value1.toHexString();
    let userQueuedData = _loadOrCreateAboveBelowQueuedOptionEntity(
      queueID,
      contractAddress
    );
    userQueuedData.state = State.cancelled;
    userQueuedData.reason = event.params.reason;
    userQueuedData.cancelTimestamp = event.block.timestamp;
    userQueuedData.save();
  }
}

export function _handleAboveBelowOpenTrade(event: AboveBelowOpenTrade): void {
  if (
    event.address == Address.fromString(AboveBelow_RouterAddress_2) ||
    event.address == Address.fromString(AboveBelow_RouterAddress)
  ) {
    let routerContract = AboveBelowBufferRouter.bind(event.address);

    let queueID = event.params.queueId;
    let contractAddress = routerContract
      .queuedTrades(queueID)
      .value1.toHexString();
    let userQueuedData = _loadOrCreateAboveBelowQueuedOptionEntity(
      queueID,
      contractAddress
    );
    userQueuedData.lag = event.block.timestamp.minus(
      userQueuedData.queueTimestamp
    );
    userQueuedData.processTime = event.block.timestamp;
    userQueuedData.state = State.opened;
    userQueuedData.save();
    let userOptionData = _loadOrCreateAboveBelowOptionDataEntity(
      event.params.optionId,
      contractAddress
    );
    userOptionData.queueID = queueID;
    userOptionData.queuedTimestamp = userQueuedData.queueTimestamp;
    userOptionData.lag = event.block.timestamp.minus(
      userQueuedData.queueTimestamp
    );
    userOptionData.save();
  }
}
