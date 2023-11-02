import {
  BufferRouter,
  CancelTrade,
  InitiateTrade,
  OpenTrade,
} from "../generated/BufferRouter/BufferRouter";
import { State } from "./config";
import { logUser } from "./core";
import {
  _loadOrCreateOptionContractEntity,
  _loadOrCreateOptionDataEntity,
  _loadOrCreateQueuedOptionEntity,
  _loadOrCreateTournamentEntity,
} from "./initialize";

export function _handleInitiateTrade(event: InitiateTrade): void {
  let routerContract = BufferRouter.bind(event.address);
  let queueID = event.params.queueId;
  let queuedTradeData = routerContract.queuedTrades(queueID);
  let contractAddress = queuedTradeData.value6.toHexString();
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
  const tournament = _loadOrCreateTournamentEntity(event.params.tournamentId);
  tournament.save();
  queuedOptionData.tournament = tournament.id;
  queuedOptionData.save();
}

export function _handleOpenTrade(event: OpenTrade): void {
  let routerContract = BufferRouter.bind(event.address);
  let queueID = event.params.queueId;
  let contractAddress = routerContract
    .queuedTrades(queueID)
    .value6.toHexString();
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

export function _handleCancelTrade(event: CancelTrade): void {
  let queueID = event.params.queueId;
  let routerContract = BufferRouter.bind(event.address);
  let contractAddress = routerContract
    .queuedTrades(queueID)
    .value6.toHexString();
  let userQueuedData = _loadOrCreateQueuedOptionEntity(
    queueID,
    contractAddress
  );
  userQueuedData.state = State.cancelled;
  userQueuedData.reason = event.params.reason;
  userQueuedData.cancelTimestamp = event.block.timestamp;
  userQueuedData.save();
}
