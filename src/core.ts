import { BigInt } from "@graphprotocol/graph-ts";
import { DailyUserStat, User } from "../generated/schema";
import { _getDayId } from "./helpers";
import {
  ZERO,
  _loadOrCreateOptionContractEntity,
  _loadOrCreateUserStat,
} from "./initialize";

export function updateOptionContractData(
  increaseInOpenInterest: boolean,
  totalFee: BigInt,
  contractAddress: string
): string {
  let optionContractData = _loadOrCreateOptionContractEntity(contractAddress);
  let poolToken = optionContractData.pool;
  // let poolAddress = Address.fromString(ADDRESS_ZERO);
  // let optionContractInstance = BufferBinaryOptions.bind(contractAddress);
  optionContractData.tradeCount += 1;
  optionContractData.volume = optionContractData.volume.plus(totalFee);
  optionContractData.openInterest = increaseInOpenInterest
    ? optionContractData.openInterest.plus(totalFee)
    : optionContractData.openInterest.minus(totalFee);
  optionContractData.currentUtilization = ZERO;
  // if (poolToken == "USDC_POL") {
  //   poolAddress = Address.fromString(USDC_POL_POOL_CONTRACT);
  // } else if (poolToken == "ARB") {
  //   poolAddress = Address.fromString(ARB_POOL_CONTRACT);
  // } else if (poolToken == "USDC") {
  //   poolAddress = Address.fromString(USDC_POOL_CONTRACT);
  // } else if (poolToken == "BFR") {
  //   poolAddress = Address.fromString(BFR_POOL_CONTRACT);
  // } else if (poolToken == "V2_ARB") {
  //   poolAddress = Address.fromString(V2_ARB_POOL_CONTRACT);
  // } else if (poolToken == "V2_USDC") {
  //   poolAddress = Address.fromString(V2_USDC_POOL_CONTRACT);
  // }

  optionContractData.save();
  return poolToken;
}

export function logUser(timestamp: BigInt, account: string): void {
  let user = User.load(account);
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

    user = new User(account);
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
