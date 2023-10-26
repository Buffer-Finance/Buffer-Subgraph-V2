import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DailyUserStat, User } from "../generated/schema";
import { ZERO } from "./config";
import { _getDayId } from "./helpers";
import {
  _loadOrCreateOptionContractEntity,
  _loadOrCreateUserStat,
} from "./initialize";

export function updateOptionContractData(
  increaseInOpenInterest: boolean,
  isAbove: boolean,
  totalFee: BigInt,
  contractAddress: Address
): void {
  let optionContractData = _loadOrCreateOptionContractEntity(contractAddress);
  // let poolToken = optionContractData.pool;
  // let optionContractInstance = BufferBinaryOptions.bind(contractAddress);
  optionContractData.tradeCount += 1;
  optionContractData.volume = optionContractData.volume.plus(totalFee);
  if (isAbove) {
    optionContractData.openUp = increaseInOpenInterest
      ? optionContractData.openUp.plus(totalFee)
      : optionContractData.openUp.minus(totalFee);
  } else {
    optionContractData.openDown = increaseInOpenInterest
      ? optionContractData.openDown.plus(totalFee)
      : optionContractData.openDown.minus(totalFee);
  }
  optionContractData.openInterest = increaseInOpenInterest
    ? optionContractData.openInterest.plus(totalFee)
    : optionContractData.openInterest.minus(totalFee);
  optionContractData.currentUtilization = ZERO;
  optionContractData.save();
  // return poolToken;
}

export function logUser(timestamp: BigInt, account: Address): void {
  let user = User.load(account.toString());
  let id = _getDayId(timestamp);
  let dailyUserStatid = `${id}-${account.toString()}`;
  let userStat = _loadOrCreateUserStat(id, "daily", timestamp);
  if (user == null) {
    let totalUserStat = _loadOrCreateUserStat("total", "total", timestamp);
    totalUserStat.uniqueCountCumulative =
      totalUserStat.uniqueCountCumulative + 1;
    totalUserStat.save();

    userStat.uniqueCount = userStat.uniqueCount + 1;
    userStat.save();

    user = new User(account.toString());
    user.address = account;
    user.save();

    let dailyUserStat = new DailyUserStat(dailyUserStatid);
    dailyUserStat.save();
  } else {
    let entity = DailyUserStat.load(dailyUserStatid);
    if (entity == null) {
      userStat.existingCount += 1;
      userStat.save();
      entity = new DailyUserStat(dailyUserStatid);
      entity.save();
    }
  }
}
