import {
  CancelTrade,
  ContractRegistryUpdated,
  InitiateTrade,
  OpenTrade,
} from "../generated/BufferRouter/BufferRouter";
import { RouterAddress, State } from "./config";
import { logUser } from "./core";
import {
  ZERO,
  _loadOrCreateOptionContractEntity,
  _loadOrCreateOptionDataEntity,
  _loadOrCreateQueuedOptionEntity,
} from "./initialize";

export function _handleContractRegistryUpdated(
  event: ContractRegistryUpdated
): void {
  const router = event.address.toHexString();
  if (router == RouterAddress) {
    const marketAddress = event.params.targetContract.toHexString();
    const market = _loadOrCreateOptionContractEntity(marketAddress);
    market.routerContract = event.address;
    market.save();
  }
}

export function _handleInitiateTrade(event: InitiateTrade): void {
  const contractAddress = event.params.targetContract.toHexString();
  let queueID = event.params.queueId;

  _loadOrCreateOptionContractEntity(contractAddress);
  logUser(event.block.timestamp, event.params.user);
  let queuedOptionData = _loadOrCreateQueuedOptionEntity(
    queueID,
    contractAddress
  );
  queuedOptionData.user = event.params.user;
  queuedOptionData.state = State.queued;
  queuedOptionData.strike = ZERO;
  queuedOptionData.expirationTime = event.params.expiration;
  queuedOptionData.isAbove = event.params.isAbove;
  queuedOptionData.queueTimestamp = event.params.queuedTime;
  queuedOptionData.totalFee = event.params.totalFee;
  queuedOptionData.save();
}

export function _handleOpenTrade(event: OpenTrade): void {
  let queueID = event.params.queueId;
  let contractAddress = event.params.targetContract.toHexString();
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
