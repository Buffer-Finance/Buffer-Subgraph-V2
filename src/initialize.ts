import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  Market,
  OptionContract,
  QueuedOptionData,
  UserOptionData,
  UserStat,
} from "../generated/schema";
import { ZeroAddress } from "./config";
export const ZERO = BigInt.fromI32(0);

export function _loadOrCreateOptionContractEntity(
  contractAddress: string
): OptionContract {
  let optionContract = OptionContract.load(contractAddress);
  if (optionContract == null) {
    optionContract = new OptionContract(contractAddress);
    optionContract.address = Address.fromHexString(contractAddress);
    optionContract.isPaused = false;
    optionContract.poolContract = Address.fromHexString(ZeroAddress);
    optionContract.routerContract = Address.fromHexString(ZeroAddress);
    optionContract.token0 = "UNKNOWN";
    optionContract.token1 = "UNKNOWN";
    optionContract.openUp = ZERO;
    optionContract.openDown = ZERO;
    optionContract.openInterestUp = ZERO;
    optionContract.openInterestDown = ZERO;
    optionContract.config = ZeroAddress;
  }
  return optionContract as OptionContract;
}

export function _loadOrCreateQueuedOptionEntity(
  queueID: BigInt,
  contractAddress: string
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
    entity.maxFeePerContract = ZERO;
    entity.numberOfContracts = ZERO;
    entity.totalFee = ZERO;
    entity.save();
  }
  return entity as QueuedOptionData;
}

export function _loadOrCreateOptionDataEntity(
  optionID: BigInt,
  contractAddress: string
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

export function _loadOrCreateMarket(id: Bytes): Market {
  let market = Market.load(id);
  if (market == null) {
    market = new Market(id);
    market.skew = ZERO;
  }
  return market as Market;
}
