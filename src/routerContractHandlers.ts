import {
  _loadOrCreateOptionContractEntity,
  _loadOrCreateQueuedOptionEntity,
  _loadOrCreateOptionDataEntity,
} from "./initialize";
import { State } from "./config";
import { logUser } from "./core";
import { UserOptionData, QueuedOptionData } from "../generated/schema";
import {
  InitiateTrade,
  CancelTrade,
  BufferRouter,
  OpenTrade,
} from "../generated/BufferRouter/BufferRouter";

export function _handleInitiateTrade(event: InitiateTrade): void {
  let routerContract = BufferRouter.bind(event.address);
  let queueID = event.params.queueId;
  let queuedTradeData = routerContract.queuedTrades(queueID);
  let contractAddress = queuedTradeData.value6;
  _loadOrCreateOptionContractEntity(contractAddress);
  logUser(event.block.timestamp, event.params.account);
  let queuedOptionData = _loadOrCreateQueuedOptionEntity(
    queueID,
    contractAddress
  );
  queuedOptionData.user = event.params.account;
  queuedOptionData.state = State.queued;
  queuedOptionData.strike = queuedTradeData.value7;
  queuedOptionData.totalFee = queuedTradeData.value3;
  queuedOptionData.slippage = queuedTradeData.value8;
  queuedOptionData.isAbove = queuedTradeData.value5 ? true : false;
  queuedOptionData.queueTimestamp = event.block.timestamp;
  queuedOptionData.save();
}

export function _handleOpenTrade(event: OpenTrade): void {
  let routerContract = BufferRouter.bind(event.address);
  let queueID = event.params.queueId;
  let contractAddress = routerContract.queuedTrades(queueID).value6;
  let userQueuedData = QueuedOptionData.load(`${queueID}${contractAddress}`);
  if (userQueuedData != null) {
    userQueuedData.lag = event.block.timestamp.minus(
      userQueuedData.queueTimestamp
    );
    userQueuedData.processTime = event.block.timestamp;
    userQueuedData.state = State.opened;
    userQueuedData.save();

    let referrenceID = `${event.params.optionId}${contractAddress}`;
    let userOptionData = UserOptionData.load(referrenceID);
    if (userOptionData != null) {
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
}

export function _handleCancelTrade(event: CancelTrade): void {
  let queueID = event.params.queueId;
  let routerContract = BufferRouter.bind(event.address);
  let contractAddress = routerContract.queuedTrades(queueID).value6;
  let userQueuedData = QueuedOptionData.load(`${queueID}${contractAddress}`);
  if (userQueuedData != null) {
    userQueuedData.state = State.cancelled;
    userQueuedData.reason = event.params.reason;
    userQueuedData.cancelTimestamp = event.block.timestamp;
    userQueuedData.save();
  }
}
