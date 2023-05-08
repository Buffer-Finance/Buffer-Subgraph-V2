import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  UserOptionData,
  OptionContract,
  UserStat,
  QueuedOptionData,
  Tournament,
} from "../generated/schema";
export const ZERO = BigInt.fromI32(0);

export function _loadOrCreateOptionContractEntity(
  contractAddress: Address
): OptionContract {
  let optionContract = OptionContract.load(contractAddress);
  if (optionContract == null) {
    optionContract = new OptionContract(contractAddress);
    optionContract.address = contractAddress;
    optionContract.isPaused = false;
  }
  return optionContract as OptionContract;
}

export function _loadOrCreateQueuedOptionEntity(
  queueID: BigInt,
  contractAddress: Bytes
): QueuedOptionData {
  let referenceID = `${queueID}${contractAddress}`;
  let entity = QueuedOptionData.load(referenceID);
  if (entity == null) {
    entity = new QueuedOptionData(referenceID);
    entity.queueID = queueID;
    entity.optionContract = contractAddress;
    entity.queueTimestamp = ZERO;
    entity.cancelTimestamp = ZERO;
    entity.lag = ZERO;
    entity.processTime = ZERO;
    entity.save();
  }
  return entity as QueuedOptionData;
}

export function _loadOrCreateOptionDataEntity(
  optionID: BigInt,
  contractAddress: Bytes
): UserOptionData {
  let referrenceID = `${optionID}${contractAddress}`;
  let entity = UserOptionData.load(referrenceID);
  if (entity == null) {
    entity = new UserOptionData(referrenceID);
    entity.optionID = optionID;
    entity.optionContract = contractAddress;
    entity.amount = ZERO;
    entity.totalFee = ZERO;
    entity.queuedTimestamp = ZERO;
    entity.lag = ZERO;
  }
  return entity as UserOptionData;
}

export function _loadOrCreateUserStat(
  id: string,
  period: string,
  timestamp: BigInt
): UserStat {
  let userStat = UserStat.load(id);
  if (userStat == null) {
    userStat = new UserStat(id);
    userStat.period = period;
    userStat.timestamp = timestamp;
    userStat.uniqueCount = 0;
    userStat.uniqueCountCumulative = 0;
    userStat.users = [];
    userStat.existingCount = 0;
  }
  return userStat as UserStat;
}

export function _loadOrCreateTournamentEntity(
  id: BigInt
): Tournament {
  let tournamentID = id.toString();
  let entity = Tournament.load(tournamentID);
  if (entity == null) {
    entity = new Tournament(tournamentID);
  }
  return entity as Tournament;
}
