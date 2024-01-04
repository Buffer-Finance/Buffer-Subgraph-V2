import { Address } from "@graphprotocol/graph-ts";
import {
  BufferRouter,
  CancelTrade,
  InitiateTrade,
  OpenTrade,
} from "../generated/BufferRouter/BufferRouter";
import { RouterAddress, RouterAddress_2, State } from "./config";
import { logUser } from "./core";
import {
  _loadOrCreateOptionContractEntity,
  _loadOrCreateOptionDataEntity,
  _loadOrCreateQueuedOptionEntity,
} from "./initialize";

export function _handleInitiateTrade(event: InitiateTrade): void {
  if (
    event.address == Address.fromString(RouterAddress_2) ||
    event.address == Address.fromString(RouterAddress)
  ) {
    let routerContract = BufferRouter.bind(event.address);
    let queueID = event.params.queueId;
    let queuedTradeData = routerContract.queuedTrades(queueID);
    let contractAddress = queuedTradeData.value1.toHexString();
    _loadOrCreateOptionContractEntity(contractAddress);
    logUser(event.block.timestamp, event.params.user);
    let queuedOptionData = _loadOrCreateQueuedOptionEntity(
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
    if (event.address == Address.fromString(RouterAddress_2)) {
      queuedOptionData.totalFee = queuedTradeData.value12;
    }
  }
}

export function _handleOpenTrade(event: OpenTrade): void {
  if (
    event.address == Address.fromString(RouterAddress_2) ||
    event.address == Address.fromString(RouterAddress)
  ) {
    let routerContract = BufferRouter.bind(event.address);

    let queueID = event.params.queueId;
    let contractAddress = routerContract
      .queuedTrades(queueID)
      .value1.toHexString();
    let userQueuedData = _loadOrCreateQueuedOptionEntity(
      queueID,
      contractAddress
    );
    userQueuedData.lag = event.block.timestamp.minus(
      userQueuedData.queueTimestamp
    );
    userQueuedData.processTime = event.block.timestamp;
    userQueuedData.state = State.opened;
    userQueuedData.save();
    let userOptionData = _loadOrCreateOptionDataEntity(
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

export function _handleCancelTrade(event: CancelTrade): void {
  if (
    event.address == Address.fromString(RouterAddress_2) ||
    event.address == Address.fromString(RouterAddress)
  ) {
    let queueID = event.params.queueId;
    let routerContract = BufferRouter.bind(event.address);
    let contractAddress = routerContract
      .queuedTrades(queueID)
      .value1.toHexString();
    let userQueuedData = _loadOrCreateQueuedOptionEntity(
      queueID,
      contractAddress
    );
    userQueuedData.state = State.cancelled;
    userQueuedData.reason = event.params.reason;
    userQueuedData.cancelTimestamp = event.block.timestamp;
    userQueuedData.save();
  }
}
