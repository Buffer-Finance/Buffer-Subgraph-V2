import {
  BufferRouter,
  CancelTrade,
  ContractRegistryUpdated,
  InitiateTrade,
  OpenTrade,
} from "../generated/BufferRouter/BufferRouter";
import { State } from "./config";
import { logUser } from "./core";
import {
  _loadOrCreateOptionContractEntity,
  _loadOrCreateOptionDataEntity,
  _loadOrCreateQueuedOptionEntity,
} from "./initialize";

export function _handleContractRegistryUpdated(
  event: ContractRegistryUpdated
): void {
  if (event.params.register == true) {
    const optionContract = _loadOrCreateOptionContractEntity(
      event.params.targetContract.toHexString()
    );
    optionContract.routerContract = event.address;
    optionContract.save();
  }
}

export function _handleInitiateTrade(event: InitiateTrade): void {
  logUser(event.block.timestamp, event.params.user);
  const queuedOptionData = _loadOrCreateQueuedOptionEntity(
    event.params.queueId,
    event.params.targetContract.toHexString()
  );
  queuedOptionData.user = event.params.user;
  queuedOptionData.state = State.queued;
  queuedOptionData.strike = event.params.strike;
  queuedOptionData.expirationTime = event.params.expiration;
  queuedOptionData.maxFeePerContract = event.params.maxFeePerContract;
  queuedOptionData.isAbove = event.params.isAbove;
  queuedOptionData.queueTimestamp = event.params.timestamp;
  queuedOptionData.numberOfContracts = event.params.contracts;
  queuedOptionData.save();
}

export function _handleOpenTrade(event: OpenTrade): void {
  const queueID = event.params.queueId;
  const contractAddress = event.params.targetContract.toHexString();
  const userQueuedData = _loadOrCreateQueuedOptionEntity(
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
  userOptionData.user = userQueuedData.user;
  userOptionData.state = State.active;
  userOptionData.expirationTime = userQueuedData.expirationTime;
  userOptionData.isAbove = userQueuedData.isAbove;
  userOptionData.creationTime = userQueuedData.queueTimestamp;
  userOptionData.queuedTimestamp = userQueuedData.queueTimestamp;
  userOptionData.lag = event.block.timestamp.minus(
    userQueuedData.queueTimestamp
  );
  userOptionData.save();
}

export function _handleCancelTrade(event: CancelTrade): void {
  let queueID = event.params.queueId;
  let routerContract = BufferRouter.bind(event.address);
  let contractAddress = event.params.targetContract.toHexString();
  let userQueuedData = _loadOrCreateQueuedOptionEntity(
    queueID,
    contractAddress
  );
  userQueuedData.state = State.cancelled;
  userQueuedData.reason = event.params.reason;
  userQueuedData.cancelTimestamp = event.block.timestamp;
  userQueuedData.save();
}
